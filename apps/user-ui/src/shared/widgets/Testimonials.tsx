import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import heroImage from "@/assets/hero-woman.jpg";
import Image from "next/image";

const Testimonials = () => {
  return (
    <section className="py-12 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left - Image */}
          <div className="relative flex-1">
            <button className="carousel-btn absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden md:flex bg-secondary text-foreground">
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-4 left-1/4 w-32 h-2 bg-pink rounded-full" />
              <div className="absolute -bottom-4 left-1/4 w-48 h-2 bg-primary rounded-full" />

              <div className="rounded-3xl overflow-hidden shadow-xl max-w-md mx-auto">
                <Image
                  src={heroImage}
                  alt="Happy customer"
                  className="w-full h-80 md:h-96 object-cover"
                />
              </div>

              {/* Speech bubble */}
              <div className="absolute top-1/2 right-0 translate-x-4 bg-white rounded-2xl px-6 py-3 shadow-lg">
                <p className="text-sm font-medium text-foreground">
                  It's fresh with top quality!
                </p>
              </div>
            </div>

            <button className="carousel-btn absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden md:flex bg-secondary text-foreground">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Right - Content */}
          <div className="flex-1 max-w-lg">
            <span className="section-label">TESTIMONIALS</span>
            <h2 className="section-title mt-2 mb-6">
              What Our Customers
              <br />
              Say About Us
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              "Finally, truly fresh fish and meat in Delhi! The quality is
              consistently excellent, and the convenience of having it delivered
              to my doorstep is a game-changer for my weekly cooking. You can
              taste the freshness in every bite. I'm a customer for life!"
            </p>

            {/* Customer Feedback */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full border-2 border-white overflow-hidden"
                  >
                    <Image
                      src={heroImage}
                      alt={`Customer ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-semibold text-foreground">
                  Customer Feedback
                </h4>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow text-yellow" />
                  <span className="font-bold">4.9</span>
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
