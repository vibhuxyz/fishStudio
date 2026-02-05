import Link from "next/link";
import { Fish, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo and tagline */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Fish className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">
                Fish Studio
              </span>
            </Link>

            <p className="text-muted-foreground">
              Enjoy premium taste
              <br />
              delivered to your doorstep
            </p>
          </div>

          {/* Useful links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Useful links</h4>
            <ul className="space-y-3">
              {["About us", "Events", "Blogs", "FAQ"].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Menu */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Main Menu</h4>
            <ul className="space-y-3">
              {["Home", "Offers", "Menus", "Reservation"].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>fishstudio@gmail.com</li>
              <li>+91 8899442255</li>
              <li>Social media</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors"
                aria-label="social-link"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          <p className="text-muted-foreground text-sm">
            © 2025 Fish Studio | All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
