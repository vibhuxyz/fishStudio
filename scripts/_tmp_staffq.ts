import { prismaMongo as prisma } from "@repo/db-mongo";
import argon2 from "argon2";

const [username, password] = process.argv.slice(2);
const staff = await prisma.staffs.findFirst({ where: { username } });
if (!staff) {
  console.log("no staff with username:", JSON.stringify(username));
} else {
  console.log({
    username: staff.username,
    role: staff.role,
    isActive: staff.isActive,
    passwordMatches: await argon2.verify(staff.password, password ?? ""),
  });
}
