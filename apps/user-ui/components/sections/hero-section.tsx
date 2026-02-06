import Image from "next/image";
import { Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const BLUR_DATA =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNCw4QDAsNEQ4SEBQSEBESFBcWFxcYGBsbGBshICD/2wBDAQMEBAUEBQkFBQkhEAsQISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISH/wAARCAAIAAgDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAABv/EAB8QAAICAgIDAQAAAAAAAAAAAAECAwQFEQASITFBcf/EABUBAQEAAAAAAAAAAAAAAAAAAAUG/8QAGhEAAgMBAQAAAAAAAAAAAAAAAAECAxExQf/aAAwDAQACEQMRAD8Al4/LZCnlKtaOysVeSRUVmQEqCdAnf0eXqd4bVTk7mO3LWIZB3i+y9c=";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-secondary/30 px-4 py-12 lg:py-16">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 lg:flex-row lg:gap-12">
        {/* Left content */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
            <span className="text-balance">
              Meat, Fish, Repeat.{" "}
              <br />
              Delivered{" "}
              <span className="text-primary">Super Fresh.</span>
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-muted-foreground lg:mx-0">
            Freshly cut chicken, mutton, fish -- ordered online, arrived chilled
            and ready.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 lg:justify-start">
            <Button size="lg" className="rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90">
              Order Now
            </Button>
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background shadow-sm">
                <Play className="h-4 w-4 text-foreground" />
              </span>
              Watch Video
            </button>
          </div>
        </div>

        {/* Right content - hero image */}
        <div className="relative flex-1">
          <div className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 lg:left-auto lg:right-1/4 lg:translate-x-0">
            <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-md">
              {"Fresh & Tasty!"}
            </span>
          </div>

          <div className="mx-auto h-72 w-72 overflow-hidden rounded-full border-4 border-background shadow-xl md:h-96 md:w-96">
            <Image
              src="/images/hero-woman.jpg"
              alt="Fresh fish and meat delivery"
              width={400}
              height={400}
              className="h-full w-full object-cover"
              priority
              loading="eager"
              placeholder="blur"
              blurDataURL={BLUR_DATA}
            />
          </div>

          {/* Floating product cards */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4 lg:bottom-8">
            <FloatingProductCard
              image="/images/products/pomfret.jpg"
              name="Bhetki (Sea Bass)"
              rating={3}
              price="Rs.350.00"
            />
            <FloatingProductCard
              image="/images/products/pomfret.jpg"
              name="Pomfret (Bengal)"
              rating={4}
              price="Rs.750.00"
              className="hidden md:flex"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingProductCard({
  image,
  name,
  rating,
  price,
  className = "",
}: {
  image: string;
  name: string;
  rating: number;
  price: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-lg ${className}`}>
      <div className="relative h-12 w-12 overflow-hidden rounded-lg">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          width={48}
          height={48}
          className="h-full w-full object-cover"
          loading="lazy"
          placeholder="blur"
          blurDataURL={BLUR_DATA}
        />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <div className="flex items-center gap-1">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={`f-${i}`} className="h-3 w-3 fill-amber-400 text-amber-400" />
          ))}
          {Array.from({ length: 5 - rating }).map((_, i) => (
            <Star key={`e-${i}`} className="h-3 w-3 text-border" />
          ))}
        </div>
        <p className="text-sm font-bold text-foreground">{price}</p>
      </div>
    </div>
  );
}
