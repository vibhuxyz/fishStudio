import { prismaMongo } from "@repo/db-mongo";

interface UserContact {
  name: string;
  email?: string | null;
  phone_number?: string | null;
}

/** Resolve email + phone for any userId, checking users → sellers → admins */
export async function resolveUserContact(userId: string): Promise<UserContact | null> {
  // 1. Regular users
  const user = await prismaMongo.users.findUnique({
    where: { id: userId },
    select: { email: true, phone_number: true, name: true },
  });
  if (user) return user;

  // 2. Sellers
  const seller = await prismaMongo.sellers.findUnique({
    where: { id: userId },
    select: { email: true, phone_number: true, name: true },
  });
  if (seller) return seller;

  // 3. Admins
  const admin = await prismaMongo.admins.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (admin) return { ...admin, phone_number: null };

  return null;
}
