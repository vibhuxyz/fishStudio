"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const BLUR_DATA =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const testimonials = [
  {
    id: 1,
    text: "Finally, truly fresh fish and meat in Delhi! The quality is consistently excellent, and the convenience of having it delivered to my doorstep is a game-changer for my weekly cooking. You can taste the freshness in every bite. I'm a customer for life!",
    image: "/images/testimonial-cooking.jpg",
    badge: "It's fresh with top quality!",
  },
  {
    id: 2,
    text: "I was skeptical about ordering fish online, but Fish Studio completely changed my mind. The Hilsa I ordered was so fresh it tasted like it came straight from the river. The cutting options are incredibly convenient - I got it exactly how I wanted!",
    image: "/images/testimonial-cooking.jpg",
    badge: "Best fish delivery service!",
  },
  {
    id: 3,
    text: "The quality of chicken and mutton from Fish Studio is unmatched. Everything arrives fresh, well-packed, and on time. Their customer service is excellent too. Highly recommend to anyone who values quality meat products!",
    image: "/images/testimonial-cooking.jpg",
    badge: "Premium quality always!",
  },
];

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const testimonial = testimonials[current];

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
          {/* Left - Image */}
          <div className="relative flex-shrink-0">
            <div className="relative h-80 w-80 overflow-hidden rounded-2xl shadow-xl md:h-96 md:w-96">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full"
                >
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt="Customer cooking"
                    fill
                    className="object-cover"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA}
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <span className="inline-block rounded-lg bg-background/90 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm">
                  {testimonial.badge}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="absolute -left-4 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full border-border bg-background shadow-md"
              onClick={prev}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous testimonial</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute -right-4 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full border-border bg-background shadow-md"
              onClick={next}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next testimonial</span>
            </Button>
          </div>

          {/* Right - Text */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Testimonials
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
              What Our Customers Say About Us
            </h2>
            <AnimatePresence mode="wait">
              <motion.p
                key={testimonial.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-4 leading-relaxed text-muted-foreground"
              >
                {`"${testimonial.text}"`}
              </motion.p>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-center gap-4 lg:justify-start">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 overflow-hidden rounded-full border-2 border-background"
                  >
                    <Image
                      src="/images/hero-woman.jpg"
                      alt={`Customer ${i}`}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA}
                    />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Customer Feedback
                </p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-foreground">4.9</span>
                  <span className="text-xs text-muted-foreground">
                    (18.6k Reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
