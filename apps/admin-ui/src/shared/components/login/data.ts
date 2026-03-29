import { LucideIcon, ShieldAlert } from "lucide-react";

export interface TestAccount {
  name: string;
  email: string;
  password: string;
  icon: LucideIcon;
  badge?: string;
}

export const testAccounts: TestAccount[] = [
  {
    name: "Fish Studio",
    email: "develop.fishstudio@gmail.com",
    password: "Fishstudio@123",
    icon: ShieldAlert,
    badge: "Admin",
  },
];
