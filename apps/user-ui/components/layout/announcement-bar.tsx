import { announcementTexts } from "@/lib/data";

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground overflow-hidden">
      <div className="animate-marquee flex whitespace-nowrap py-2">
        {[...announcementTexts, ...announcementTexts].map((text, index) => (
          <span
            key={index}
            className="mx-8 text-sm font-medium"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
