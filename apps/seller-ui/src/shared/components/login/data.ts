import { LucideIcon, User, ShieldCheck } from "lucide-react";

export interface TestAccount {
  name: string;
  email: string;
  password: string;
  icon: LucideIcon;
  badge?: string;
}

export const testAccounts: TestAccount[] = [
  {
    name: "Seller (Merchant)",
    email: "vikram.seller@gmail.com",
    password: "Vikram12@",
    icon: User,
    badge: "Seller",
  },
  {
    name: "Staff (Order Desk)",
    email: "vikram.staff@gmail.com",
    password: "Vikram12@",
    icon: ShieldCheck,
    badge: "Staff",
  },
];
