import { Fish, Drumstick, Beef } from "lucide-react";

const categories = [
  { name: "Fish", icon: Fish, color: "text-cyan" },
  { name: "Poultry", icon: Drumstick, color: "text-primary" },
  { name: "Meat", icon: Beef, color: "text-pink" },
];

const CategoryNav = () => {
  return (
    <nav className="w-full border-b border-border">
      <div className="container mx-auto">
        <div className="flex justify-center gap-8 md:gap-16">
          {categories.map((category, index) => (
            <button
              key={category.name}
              className={`nav-category ${index === 0 ? "nav-category-active" : ""} ${category.color}`}
            >
              <category.icon className="h-6 w-6" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
