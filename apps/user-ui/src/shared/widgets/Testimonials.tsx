import Image from "next/image";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    text: "Finally, truly fresh fish and meat in Delhi! The quality is consistently excellent, and the convenience of having it delivered to my doorstep is a game-changer for my weekly cooking. You can taste the freshness in every bite. I'm a customer for life!",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden h-[400px]">
              <Image
                src={heroImage}
                alt="Happy customer cooking"
                fill
                className="object-cover"
                priority
              />

              <div className="absolute bottom-8 right-8 bg-background rounded-xl px-4 py-2 shadow-lg">
                <p className="text-sm font-medium text-foreground">
                  It's fresh with top quality!
                </p>
              </div>
            </div>

            {/* Navigation arrows */}
            <button
              aria-label="Previous testimonial"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-lg hover:bg-secondary/80 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>

            <button
              aria-label="Next testimonial"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-12 bg-secondary rounded-full flex items-center justify-center shadow-lg hover:bg-secondary/80 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <span className="section-label">TESTIMONIALS</span>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              What Our Customers
              <br />
              Say About Us
            </h2>

            <p className="text-muted-foreground leading-relaxed">
              “{testimonials[0].text}”
            </p>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-secondary border-2 border-background"
                  />
                ))}
              </div>

              <div>
                <p className="font-semibold text-foreground">
                  Customer Feedback
                </p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow text-yellow" />
                  <span className="font-medium">4.9</span>
                  <span className="text-muted-foreground">(18.6k Reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
