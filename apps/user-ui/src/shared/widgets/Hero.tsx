"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-foreground via-foreground to-foreground/90">
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left content */}
          <div className="text-background space-y-6 animate-fade-in">
            <div className="inline-block bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium">
              Fresh & Tasty!
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Meat, Fish, Repeat.
              <br />
              Delivered <span className="text-primary">Super Fresh.</span>
            </h1>

            <p className="text-background/80 text-lg max-w-md">
              Freshly cut chicken, mutton, fish – ordered online, arrived
              chilled and ready.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button className="btn-primary px-8 py-6 rounded-full text-lg font-semibold">
                Order Now
              </Button>

              <button className="flex items-center gap-2 text-background hover:text-primary transition-colors">
                <div className="w-12 h-12 bg-background/20 rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <span className="font-medium">Watch Video</span>
              </button>
            </div>
          </div>

          {/* Right content */}
          <div className="relative">
            <div className="relative rounded-full overflow-hidden aspect-square max-w-lg mx-auto">
              <Image
                src={heroImage}
                alt="Fresh fish cooking"
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* Featured products */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <div className="bg-foreground/80 backdrop-blur-sm text-background rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-12 h-12 bg-background/20 rounded-lg" />
                <div>
                  <p className="font-medium text-sm">Bhetki (Sea Bass)</p>
                  <p className="text-accent font-bold">₹350.00</p>
                </div>
              </div>

              <div className="bg-foreground/80 backdrop-blur-sm text-background rounded-xl px-4 py-3 flex items-center gap-3 hidden sm:flex">
                <div className="w-12 h-12 bg-background/20 rounded-lg" />
                <div>
                  <p className="font-medium text-sm">Pomfret (Bengal)</p>
                  <p className="text-accent font-bold">₹750.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
