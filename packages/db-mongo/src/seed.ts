import { prismaMongo as prisma } from "./client.js";
import readline from "readline";

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

    /**
     * 0️⃣ ADMIN ACCESS CODE
     */
    const adminAccessCodeExist = await prisma.signupAccessCode.findFirst({
        where: { role: "ADMIN", email: null },
    });

    if (adminAccessCodeExist) {
        console.log(`✅ Admin Master Access Code already exists (Code: ${adminAccessCodeExist.code}) — skipping`);
    } else {
        const shouldSeedCode = await askQuestion(
            "❓ Do you want to seed the Admin Master Access Code? (y/n): ",
        );
        if (shouldSeedCode) {
            const generatedCode = "ADMIN" + Math.floor(1000 + Math.random() * 9000); // Generate something like ADMIN1234
            await prisma.signupAccessCode.create({
                data: {
                    role: "ADMIN",
                    code: generatedCode,
                    email: null,
                    expiresAt: null,
                },
            });
            console.log(
                `✅ Admin Master Access Code seeded successfully (Code: ${generatedCode})!`,
            );
        } else {
            console.log("⏭️  Skipped Admin Master Access Code.");
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
