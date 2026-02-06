import Link from "next/link";
import { Fish, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Fish className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-serif text-lg font-bold text-foreground">
                Fish Studio
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Enjoy premium taste delivered to your doorstep
            </p>
          </div>

          {/* Useful links */}
          <div>
            <h3 className="font-serif text-sm font-bold text-foreground">
              Useful links
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {["About us", "Events", "Blogs", "FAQ"].map((link) => (
                <li key={link}>
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Menu */}
          <div>
            <h3 className="font-serif text-sm font-bold text-foreground">
              Main Menu
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {["Home", "Offers", "Menus", "Reservation"].map((link) => (
                <li key={link}>
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-serif text-sm font-bold text-foreground">
              Contact Us
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li className="text-sm text-muted-foreground">
                fishstudio@gmail.com
              </li>
              <li className="text-sm text-muted-foreground">+91 8899442255</li>
              <li className="text-sm text-muted-foreground">Social media</li>
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
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-80"
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
