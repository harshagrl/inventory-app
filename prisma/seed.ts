// ──────────────────────────────────────────────────────────────
// Prisma Seed — Creates demo users and sample products
// Run with: npx prisma db seed
// ──────────────────────────────────────────────────────────────


import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── 1. Create Users ──────────────────────────────────────

  const adminPassword = await bcrypt.hash("admin123", 12);
  const sellerPassword = await bcrypt.hash("seller123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN" as any,
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: "seller@test.com" },
    update: {},
    create: {
      email: "seller@test.com",
      name: "Seller User",
      password: sellerPassword,
      role: "SELLER" as any,
    },
  });

  console.log("✅ Users created:");
  console.log(`   Admin  → ${admin.email} (role: ${admin.role})`);
  console.log(`   Seller → ${seller.email} (role: ${seller.role})\n`);

  // ─── 2. Create Products ───────────────────────────────────

  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: "RICE-BAS-001" },
      update: {},
      create: {
        name: "Basmati Rice (Premium)",
        description:
          "Aged long-grain basmati rice, perfect for biryani and pulao. Sourced from the foothills of the Himalayas.",
        sku: "RICE-BAS-001",
        category: "Grains & Cereals",
        baseUnit: "GRAM" as any,
        basePricePaise: BigInt(8500), // ₹85.00 per kg → 8500 paise per 1000g → stored as price per kg
        stockQuantityBase: 50000, // 50 kg in grams
      },
    }),

    prisma.product.upsert({
      where: { sku: "OIL-OLV-002" },
      update: {},
      create: {
        name: "Extra Virgin Olive Oil",
        description:
          "Cold-pressed extra virgin olive oil imported from Spain. Ideal for salads, cooking, and dipping.",
        sku: "OIL-OLV-002",
        category: "Oils & Condiments",
        baseUnit: "MILLILITER" as any,
        basePricePaise: BigInt(65000), // ₹650.00 per litre → stored as paise per 1000ml
        stockQuantityBase: 25000, // 25 litres in millilitres
      },
    }),

    prisma.product.upsert({
      where: { sku: "EGG-FRM-003" },
      update: {},
      create: {
        name: "Farm Fresh Eggs (Free Range)",
        description:
          "Free-range eggs from local farms. Rich yolk color and superior taste. Pack of 1 egg unit.",
        sku: "EGG-FRM-003",
        category: "Dairy & Eggs",
        baseUnit: "ITEM" as any,
        basePricePaise: BigInt(800), // ₹8.00 per egg
        stockQuantityBase: 500, // 500 eggs
      },
    }),

    prisma.product.upsert({
      where: { sku: "MILK-FUL-004" },
      update: {},
      create: {
        name: "Full Cream Milk (Pasteurized)",
        description:
          "Fresh pasteurized full cream milk with 3.5% fat content. Perfect for tea, coffee, and desserts.",
        sku: "MILK-FUL-004",
        category: "Dairy & Eggs",
        baseUnit: "MILLILITER" as any,
        basePricePaise: BigInt(5600), // ₹56.00 per litre
        stockQuantityBase: 100000, // 100 litres in ml
      },
    }),

    prisma.product.upsert({
      where: { sku: "NUT-ALM-005" },
      update: {},
      create: {
        name: "California Almonds (Raw)",
        description:
          "Premium quality raw California almonds. Rich in protein, fiber, and healthy fats. Great for snacking.",
        sku: "NUT-ALM-005",
        category: "Dry Fruits & Nuts",
        baseUnit: "GRAM" as any,
        basePricePaise: BigInt(120000), // ₹1200.00 per kg
        stockQuantityBase: 10000, // 10 kg in grams
      },
    }),
  ]);

  console.log("✅ Products created:");
  products.forEach((p) => {
    console.log(`   📦 ${p.name} (SKU: ${p.sku}, Unit: ${p.baseUnit})`);
  });

  console.log("\n🎉 Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
