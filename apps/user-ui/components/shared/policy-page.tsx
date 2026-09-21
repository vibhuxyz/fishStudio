import { Fragment } from "react";

export type PolicySection = {
  h: string;
  /** One string per paragraph. Wrap text in **double asterisks** to bold it. */
  p: string[];
};

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export function PolicyPage({
  title,
  lastUpdated,
  sections,
}: {
  title: string;
  lastUpdated: string;
  sections: PolicySection[];
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-28 md:px-6 md:pb-10">
      <h1 className="mb-1 text-xl font-bold text-foreground md:text-2xl">
        {title}
      </h1>
      <p className="mb-6 text-xs text-muted-foreground">
        Last updated: {lastUpdated}
      </p>

      <div className="space-y-5">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-base font-semibold text-foreground">{s.h}</h2>
            {s.p.map((para, i) => (
              <p
                key={i}
                className="mt-1 text-sm leading-relaxed text-muted-foreground"
              >
                {renderInline(para)}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
