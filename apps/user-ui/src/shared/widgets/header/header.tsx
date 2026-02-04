import { Search, User, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";

const Header = () => {
  return (
    <header className="w-full">
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <div className="container mx-auto flex justify-center gap-16 overflow-hidden">
          <span>Lorem ipsum dolor sit amet</span>
          <span className="hidden md:inline">Lorem ipsum dolor sit amet</span>
          <span className="hidden lg:inline">Lorem ipsum dolor sit amet</span>
          <span className="hidden xl:inline">Lorem ipsum dolor sit amet</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto py-4 px-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-primary">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 8C16 8 10 14 8 20C6 26 8 32 14 36C10 32 10 26 12 22C14 18 18 14 24 14C30 14 34 18 36 22C38 26 38 32 34 36C40 32 42 26 40 20C38 14 32 8 24 8Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M20 24C22 22 26 22 28 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="18" cy="20" r="2" fill="currentColor"/>
                <circle cx="30" cy="20" r="2" fill="currentColor"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">Fish Studio</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search for fish, meat, poultry..."
                className="w-full pr-10 rounded-lg border-border"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <span className="hidden lg:inline text-sm text-muted-foreground hover:text-foreground cursor-pointer">
              Log in/Sign up
            </span>
            <button className="p-2 hover:bg-secondary rounded-full transition-colors">
              <User className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-full transition-colors relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
