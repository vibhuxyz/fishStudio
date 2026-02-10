"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  User,
  ShoppingCart,
  LayoutGrid,
  Fish,
  LogOut,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CategoryMenu } from "./category-menu";
import { AnnouncementBar } from "./announcement-bar";
import { useCart } from "@/lib/cart-store";
import { useAuth, logoutUser } from "@/lib/auth-store";
import { useModals } from "@/components/providers/modal-provider";

interface SiteHeaderProps {
  onLoginClick?: () => void;
  onCartClick?: () => void;
}

export function SiteHeader({ onLoginClick, onCartClick }: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { totalItems } = useCart();
  const { user, isLoggedIn } = useAuth();
  const modals = useModals();

  const handleLoginClick = onLoginClick ?? modals.openLogin;
  const handleCartClick = onCartClick ?? modals.openCart;

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleIconEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowCategoryDropdown(true);
  };

  const handleIconLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowCategoryDropdown(false);
    }, 250);
  };

  const handleDropdownEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleDropdownLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowCategoryDropdown(false);
    }, 250);
  };

  return (
    <>
      {/*<AnnouncementBar />*/}

      <header className="sticky top-0 z-40 border-b border-border bg-background shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex flex-shrink-0 items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Fish className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="font-serif text-lg font-bold leading-tight text-foreground">
                Fish Studio
              </span>
              <span className="text-[10px] text-muted-foreground">
                Fresh Fish & Meat Marketplace
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div
            className="relative flex max-w-xl flex-1 items-center"
            ref={dropdownRef}
          >
            <div className="relative flex w-full items-center">
              <Input
                type="text"
                placeholder="Search for any delicious..."
                className="h-11 rounded-lg border-border bg-background pl-4 pr-24 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-1 flex items-center gap-0.5">
                <AnimatePresence>
                  {isScrolled && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      className="relative"
                      onMouseEnter={handleIconEnter}
                      onMouseLeave={handleIconLeave}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-9 w-9 ${showCategoryDropdown ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                      >
                        <LayoutGrid className="h-5 w-5" />
                        <span className="sr-only">Categories</span>
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {showCategoryDropdown && isScrolled && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-background shadow-xl"
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  <CategoryMenu
                    variant="dropdown"
                    onClose={() => setShowCategoryDropdown(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right actions */}
          <div className="flex flex-shrink-0 items-center gap-1">
            {isLoggedIn && user ? (
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden flex-col md:flex">
                  <span className="text-sm font-medium leading-tight text-foreground">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    +91 {user.phone}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={logoutUser}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Log out</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={handleLoginClick}
              >
                <User className="h-5 w-5" />
                <span className="hidden md:inline">Log in/Sign up</span>
              </Button>
            )}

            <button
              type="button"
              className="relative ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={handleCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
              {hydrated && totalItems > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-[10px] text-primary-foreground">
                  {totalItems}
                </Badge>
              )}
            </button>
          </div>
        </div>

        <div
          className="overflow-hidden transition-[max-height] duration-200 ease-in-out"
          style={{ maxHeight: isScrolled ? 0 : 200 }}
        >
          <CategoryMenu variant="horizontal" />
        </div>
      </header>
    </>
  );
}
