import { Play, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-woman.jpg";
import fishImage from "@/assets/product-fish-1.jpg";
import fish2Image from "@/assets/product-fish-2.jpg";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Left Content */}
          <div className="flex-1 text-white z-10">
            <span className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
              Fresh & Tasty!
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Meat, Fish, Repeat.
              <br />
              Delivered <span className="text-cyan">Super Fresh.</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-md">
              Freshly cut chicken, mutton, fish — ordered online, arrived
              chilled and ready.
            </p>
            <div className="flex items-center gap-4">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-full text-lg font-semibold">
                Order Now
              </Button>
              <button className="flex items-center gap-2 text-white hover:text-cyan transition-colors">
                <span className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="h-5 w-5 fill-current" />
                </span>
                <span className="font-medium">Watch Video</span>
              </button>
            </div>
          </div>

          {/* Center - Hero Image */}
          <div className="relative flex-1 flex justify-center">
            <div className="relative">
              {/* Circular Image Container */}
              <div className="w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-gray-700">
                <Image
                  src={heroImage}
                  alt="Chef cooking fresh fish"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Login Form Overlay */}
              <div className="absolute top-4 right-0 bg-white rounded-2xl shadow-2xl p-6 w-64">
                <h3 className="text-foreground font-semibold text-center mb-4">
                  Log in / Sign up
                </h3>
                <div className="relative mb-4">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+91 Your mobile number"
                    className="pl-10 text-sm border-pink text-pink placeholder:text-pink/60"
                  />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                  Send Otp
                </Button>
              </div>
            </div>
          </div>

          {/* Right - Featured Products */}
          <div className="hidden xl:flex flex-col gap-4">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4">
              <Image
                src={fishImage}
                alt="Bhetki"
                className="w-16 h-16 rounded-xl object-cover"
              />

              <div>
                <h4 className="text-white font-medium">Bhetki (Sea Bass)</h4>
                <div className="flex items-center gap-1 text-yellow text-sm">
                  {"★★★★☆"}
                </div>
                <span className="text-cyan font-bold">₹350.00</span>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4">
              <Image
                src={fish2Image}
                alt="Pomfret"
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h4 className="text-white font-medium">Pomfret (Bengal)</h4>
                <div className="flex items-center gap-1 text-yellow text-sm">
                  {"★★★★★"}
                </div>
                <span className="text-cyan font-bold">₹750.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
