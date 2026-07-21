import { prismaMongo as prisma } from "./client.js";
import readline from "readline";
import crypto from "crypto";

/**
 * Helper function to ask a yes/no question via terminal
 */
function askQuestion(query: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

async function main() {
  console.log("🌱 Checking Admin Access Code...");

  const adminAccessCodeExist = await prisma.signupAccessCode.findFirst({
    where: { role: "ADMIN", email: null },
  });

  if (adminAccessCodeExist) {
    // If it exists but has no plainCode, it's likely broken or legacy. We should delete it.
    if (!adminAccessCodeExist.plainCode) {
      console.log("⚠️ Found an old/invalid Admin Access Code without plainCode. Deleting it so a new one can be seeded...");
      await prisma.signupAccessCode.delete({ where: { id: adminAccessCodeExist.id } });
      console.log("🔄 Please run the seed command again.");
    } else {
      console.log(
        `✅ Admin Master Access Code already exists (Code: ${adminAccessCodeExist.plainCode}) — skipping`,
      );
    }
  } else {
    // Check for an environment variable instead of a readline prompt
    const shouldSeedCode = process.env.SEED_ADMIN === "true";

    if (shouldSeedCode) {
      // Clean up any existing broken/plaintext ADMIN codes so it can regenerate properly
      await prisma.signupAccessCode.deleteMany({
        where: { role: "ADMIN", email: null },
      });

      const generatedCode = "ADMIN" + Math.floor(1000 + Math.random() * 9000);
      const hashedCode = crypto.createHash("sha256").update(generatedCode).digest("hex");

      await prisma.signupAccessCode.create({
        data: {
          role: "ADMIN",
          code: hashedCode,
          plainCode: generatedCode,
          email: null,
          expiresAt: null,
        },
      });
      console.log(
        `✅ Admin Master Access Code seeded successfully (Code: ${generatedCode})!`,
      );
    } else {
      console.log(
        "⏭️  Skipped Admin Master Access Code. (Run with SEED_ADMIN=true to generate)",
      );
    }
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("👋 Seeding script finished.");
    process.exit(0); // Ensure the process exits cleanly
  });
