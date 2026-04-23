import { db, user } from "./index";

async function seed() {
  const seeds = [
    { role: "admin", email: "admin@furnigo.com", displayName: "Admin" },
    { role: "client", email: "client@furnigo.com", displayName: "Test Client01" },
  ];

  for (const s of seeds) {
    await db.insert(user).values(s).onConflictDoNothing({ target: user.email });
  }

  console.log(`Seed complete: ${seeds.map((s) => s.email).join(", ")}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
