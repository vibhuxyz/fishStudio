import Link from "next/link";
import { Fish, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-4 gap-x-2 gap-y-8 sm:grid-cols-2 lg:grid-cols-4" style={{ textAlign: 'left', alignItems: 'start' }}>
          {/* Brand - 50% on mobile */}
          <div className="col-span-2 flex flex-col items-start !text-left sm:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Fish className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-serif text-lg font-bold text-foreground">
                Fish Studio
              </span>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground sm:text-sm !text-left">
              Enjoy premium taste delivered to your doorstep
            </p>
          </div>

          {/* Useful links - 25% on mobile */}
          <div className="col-span-1 flex flex-col items-start !text-left sm:col-span-1">
            <h3 className="font-serif text-[12px] font-bold text-foreground sm:text-sm !text-left">
              Useful links
            </h3>
            <ul className="mt-2 flex flex-col items-start gap-1.5 sm:mt-3 sm:gap-2 !text-left">
              {["About us", "Events", "Blogs", "FAQ"].map((link) => (
                <li key={link} className="!text-left w-full">
                  <Link
                    href="/"
                    className="text-[11px] text-muted-foreground transition-colors hover:text-foreground sm:text-sm block !text-left"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Menu - 25% on mobile */}
          <div className="col-span-1 flex flex-col items-start !text-left sm:col-span-1">
            <h3 className="font-serif text-[12px] font-bold text-foreground sm:text-sm !text-left">
              Main Menu
            </h3>
            <ul className="mt-2 flex flex-col items-start gap-1.5 sm:mt-3 sm:gap-2 !text-left">
              {["Home", "Offers", "Menus", "Reservation"].map((link) => (
                <li key={link} className="!text-left w-full">
                  <Link
                    href="/"
                    className="text-[11px] text-muted-foreground transition-colors hover:text-foreground sm:text-sm block !text-left"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us - 100% on mobile */}
          <div className="col-span-4 mt-6 flex flex-col items-start !text-left sm:col-span-1 sm:mt-0 lg:col-span-1">
            <h3 className="font-serif text-[12px] font-bold text-foreground sm:text-sm !text-left">
              Contact Us
            </h3>
            <ul className="mt-2 flex flex-col items-start gap-1.5 sm:mt-3 sm:gap-2 !text-left">
              <li className="text-[11px] text-muted-foreground sm:text-sm !text-left">
                fishstudio@gmail.com
              </li>
              <li className="text-[11px] text-muted-foreground sm:text-sm !text-left">+91 8899442255</li>
              <li className="text-[11px] text-muted-foreground sm:text-sm !text-left">Social media</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 md:flex-row">
          <div className="flex items-center gap-3">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <Link
                key={i}
                href="/"
                className="flex h-9 w-9 items-center justify-center !rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-80"
                style={{ borderRadius: '9999px !important' }}
              >
                <Icon className="h-4 w-4" />
                <span className="sr-only">Social media</span>
              </Link>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {"Copyright \u00A9 2025 Fishstudio | All rights reserved"}
          </p>
        </div>
      </div>
    </footer>
  );
}
