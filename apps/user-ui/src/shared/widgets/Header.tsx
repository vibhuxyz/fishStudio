"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  User,
  ShoppingCart,
  Fish,
  Drumstick,
  Beef,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  categories,
  subCategories,
  getCategoryKey,
  type Category,
} from "@/data/siteConfig";

import { Input } from "@/components/ui/input";
import AuthDialog from "./AuthDialog";

/* ---------------------------------- */
/* Category Icons */
/* ---------------------------------- */

const categoryIcons: Record<Category, React.ReactNode> = {
  "Fresh Water": <Fish className="w-5 h-5" />,
  "Sea Fish": <Fish className="w-5 h-5" />,
  "Premium Sea Food": <Fish className="w-5 h-5" />,
  "Meat & Poultry": <Drumstick className="w-5 h-5" />,
  "Fry Ready": <Beef className="w-5 h-5" />,
  "Moms Magic": <Beef className="w-5 h-5" />,
  "Rice & Spice": <Beef className="w-5 h-5" />,
  "Pet Serve": <Fish className="w-5 h-5" />,
};

const Header = () => {
  const [cartCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  /* Check scroll position on mount and when container size changes */
  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft <
          container.scrollWidth - container.clientWidth - 10,
      );
    }
  };

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 250;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  const calculateDropdownPosition = (category: Category) => {
    const categoryRef = categoryRefs.current[category];
    if (categoryRef) {
      const rect = categoryRef.getBoundingClientRect();
      const dropdownWidth = 280;
      const rightMargin = 10;
      const screenWidth = window.innerWidth;

      // Calculate if dropdown would go off-screen
      let leftPos = rect.left + 12; // 12px to the right of button

      // If dropdown would overflow on right side, adjust position
      if (leftPos + dropdownWidth + rightMargin > screenWidth) {
        // Position it so it ends rightMargin pixels from screen edge
        leftPos = screenWidth - dropdownWidth - rightMargin;
      }

      return {
        top: rect.bottom + 12, // 12px below button
        left: leftPos,
      };
    }
    return { top: 0, left: 0 };
  };

  const handleCategoryHover = (category: Category) => {
    // Clear close timeout if any
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setActiveCategory(category);
    setIsDropdownVisible(true);

    // Calculate position
    const pos = calculateDropdownPosition(category);
    setDropdownPos(pos);
  };

  const handleMouseLeave = () => {
    // Delay closing for smooth transition
    closeTimeoutRef.current = setTimeout(() => {
      setIsDropdownVisible(false);
      setActiveCategory(null);
      closeTimeoutRef.current = null;
    }, 150); // 150ms delay before closing
  };

  const handleDropdownEnter = () => {
    // Clear close timeout when entering dropdown
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleAuthSuccess = (phone: string) => {
    console.log("User authenticated with phone:", phone);
    // You can save this to state, localStorage, or API
    // For now, just close the dialog
  };

  return (
    <>
      <header className="w-full bg-background sticky top-0 z-[100] shadow-sm">
        {/* Top announcement bar */}
        <div className="bg-primary text-primary-foreground py-2 text-center text-sm">
          <div className="container mx-auto flex justify-around">
            <span>Free delivery on orders above ₹500</span>
            <span className="hidden md:inline">Fresh cut guaranteed</span>
            <span className="hidden lg:inline">
              Same day delivery available
            </span>
            <span className="hidden xl:inline">100% quality assured</span>
          </div>
        </div>

        {/* Main header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Fish className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary hidden sm:block">
                Fish Studio
              </span>
            </Link>

            {/* Search bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for fish, meat, spices..."
                  className="w-full pl-4 pr-12 py-3 rounded-full border-2 border-border focus:border-primary"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <button
                onClick={() => setIsAuthDialogOpen(true)}
                className="hidden md:flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Log in / Sign up</span>
              </button>

              <button className="relative p-2">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Category Navigation with Horizontal Scroll */}
        <nav
          className="border-t border-border relative z-[100]"
          style={{ overflow: "visible" }}
        >
          <div className="container mx-auto px-4 relative">
            {/* Left Scroll Button */}
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-background to-transparent p-2 hover:text-primary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Scrollable Categories Container */}
            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex items-center gap-2 overflow-x-auto py-2 px-8 scroll-smooth"
              style={{
                scrollBehavior: "smooth",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {/* Hide scrollbar styles */}
              <style>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>

              {categories.map((category) => {
                const key = getCategoryKey(category);

                return (
                  <div
                    key={category}
                    ref={(el) => {
                      if (el) categoryRefs.current[category] = el;
                    }}
                    className="group relative z-[100] flex-shrink-0"
                    onMouseEnter={() => handleCategoryHover(category)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Category Button */}
                    <button className="flex items-center gap-2 px-4 py-3 hover:text-primary whitespace-nowrap font-medium transition-colors hover:bg-secondary rounded-lg">
                      {categoryIcons[category]}
                      <span className="hidden sm:inline">{category}</span>
                      <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right Scroll Button */}
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-l from-background to-transparent p-2 hover:text-primary transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </nav>

        {/* Dropdown Menu Portal with Smooth Animation */}
        {activeCategory && (
          <div
            ref={dropdownRef}
            className={`fixed bg-background border border-border rounded-lg shadow-2xl min-w-[280px] z-[99999] p-4 transition-all duration-300 ease-out ${
              isDropdownVisible
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-[-10px] pointer-events-none"
            }`}
            style={{
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
              maxHeight: "500px",
              overflow: "auto",
              transformOrigin: "top left",
            }}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Category Title */}
            <h3 className="font-semibold text-primary mb-3 pb-2 border-b text-sm">
              {activeCategory}
            </h3>

            {/* Subcategories */}
            <div className="space-y-1">
              {subCategories[getCategoryKey(activeCategory)].map((sub) => (
                <Link
                  key={sub}
                  href={`/product/${sub.toLowerCase().replace(/[/\s]/g, "-")}`}
                  className="block px-3 py-2 rounded-md hover:bg-secondary text-sm font-medium transition-colors hover:text-primary"
                >
                  {sub}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Add global styles for smooth animations */}
        <style>{`
          @keyframes dropdownAppear {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes dropdownDisappear {
            from {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
            to {
              opacity: 0;
              transform: scale(0.95) translateY(-10px);
            }
          }
        `}</style>
      </header>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Header;
