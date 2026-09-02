import http from "k6/http";
import { check, group, sleep } from "k6";
import { Counter, Trend } from "k6/metrics";

/**
 * Baseline load — the anonymous browse journey, through the gateway.
 *
 * Everything here is a read that needs no session, so the script can run
 * against a fresh stack with no seeded credentials. The authenticated
 * cart-to-checkout path is a Phase 4 concern: it writes rows, reserves stock
 * and charges a payment provider, so it needs its own teardown before it can be
 * looped a thousand times.
 *
 *   k6 run load/k6/baseline.js
 *   k6 run -e BASE_URL=http://localhost:8080 -e VUS=20 load/k6/baseline.js
 *
 * ## The rate limiter shapes every result here
 *
 * The gateway allows 1000 requests per IP per 15 minutes, and product-service
 * another 500. k6 runs from one machine, so the whole test looks like a single
 * very determined visitor and starts getting 429s within the first minute. At
 * 8 VUs roughly two thirds of the run is shed.
 *
 * That is the system working, so a 429 is counted as an expected response and
 * tracked in its own metric rather than inflating the failure rate. What this
 * script can honestly measure today is latency and the absence of 5xx.
 *
 * Measuring throughput properly needs the load generator exempted from the
 * limiter — an allowlisted source, not a bypass header, which would be a
 * production hole the moment its value leaked. That belongs with the Phase 4
 * test ladder, not here.
 */

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";
const VUS = Number(__ENV.VUS || 10);

/** Measured separately from k6's own http_req_duration so the slow step is obvious. */
const catalogueLatency = new Trend("catalogue_latency", true);
const searchLatency = new Trend("search_latency", true);
/** How much of the run the rate limiter shed. Not a failure — a design working. */
const rateLimited = new Counter("rate_limited_responses");

// Without this, k6 scores every 429 as a failed request and the run reports a
// two-thirds failure rate for a system that did exactly what it was built to do.
http.setResponseCallback(http.expectedStatuses(200, 429));

export const options = {
  scenarios: {
    baseline: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: VUS },
        { duration: "2m", target: VUS },
        { duration: "30s", target: 0 },
      ],
    },
  },
  // A failing threshold exits non-zero, which is what makes this a test rather
  // than a traffic generator. The numbers are the current system's behaviour,
  // not an aspiration — raise them only when a change has actually made it true.
  thresholds: {
    // 429 is excluded by the response callback above, so this is genuine
    // failure: a 5xx, a timeout, or a connection the gateway dropped.
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500"],
  },
};

const SEARCH_TERMS = ["fish", "prawn", "crab", "salmon", "tuna"];

/** A request the system answered on purpose: served, or deliberately shed. */
function served(response) {
  if (response.status === 429) {
    rateLimited.add(1);
    return true;
  }
  return response.status === 200;
}

function get(path, name) {
  // `tags: { name }` groups every request under one k6 metric name. Without it,
  // a URL carrying a slug creates a new row per product — the same cardinality
  // problem the `route` label solves on the Prometheus side.
  return http.get(`${BASE_URL}${path}`, { tags: { name } });
}

export default function browse() {
  group("homepage", () => {
    const sections = get("/product/api/get-homepage-sections", "homepage-sections");
    catalogueLatency.add(sections.timings.duration);
    check(sections, { "homepage sections served": served });

    check(get("/product/api/get-categories", "categories"), { "categories served": served });
    check(get("/product/api/get-banners", "banners"), { "banners served": served });
  });

  sleep(1);

  let slug = null;

  group("catalogue", () => {
    const products = get("/product/api/get-all-products?page=1&limit=12", "all-products");
    catalogueLatency.add(products.timings.duration);
    check(products, { "products served": served });
    slug = firstSlug(products);
  });

  sleep(1);

  group("search", () => {
    const term = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
    const results = get(`/product/api/search?q=${term}`, "search");
    searchLatency.add(results.timings.duration);
    check(results, { "search served": served });
  });

  // Only if the catalogue actually returned something. Requesting a made-up
  // slug would generate 404s and quietly poison the error-rate tile with
  // failures the system did not cause.
  if (slug) {
    group("product detail", () => {
      check(get(`/product/api/get-product/${slug}`, "product-detail"), {
        "detail served": served,
      });
    });
  }

  sleep(2);
}

function firstSlug(response) {
  if (response.status !== 200) {
    return null;
  }

  try {
    const body = response.json();
    const list = body?.products ?? body?.data?.products ?? body?.data;
    return Array.isArray(list) ? (list[0]?.slug ?? null) : null;
  } catch (err) {
    // A non-JSON body means the request failed in a way `check` already
    // recorded; the journey continues without the detail step.
    console.warn(`could not read a product slug: ${err}`);
    return null;
  }
}
