import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo & Tagline */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-primary">
                <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 8C16 8 10 14 8 20C6 26 8 32 14 36C10 32 10 26 12 22C14 18 18 14 24 14C30 14 34 18 36 22C38 26 38 32 34 36C40 32 42 26 40 20C38 14 32 8 24 8Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M20 24C22 22 26 22 28 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="18" cy="20" r="2" fill="currentColor"/>
                  <circle cx="30" cy="20" r="2" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-primary">Fish Studio</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Enjoy premium taste
              <br />
              delivered to your doorstep
            </p>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Useful links</h4>
            <ul className="space-y-3">
              {["About us", "Events", "Blogs", "FAQ"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link}
                  </a>
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
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:fishstudio@gmail.com" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  fishstudio@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+918899442255" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  +91 8899442255
                </a>
              </li>
              <li>
                <span className="text-muted-foreground text-sm">Social media</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {[
              { icon: Facebook, href: "#" },
              { icon: Instagram, href: "#" },
              { icon: Twitter, href: "#" },
              { icon: Youtube, href: "#" },
            ].map(({ icon: Icon, href }, index) => (
              <a
                key={index}
                href={href}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            Copyright © 2025 Fishstudio | All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
