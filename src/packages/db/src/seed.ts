import { db, user } from "./index";

async function seed() {
  await db
    .insert(user)
    .values({
      role: "admin",
      email: "admin@furnigo.com",
      displayName: "Admin",
    })
    .onConflictDoNothing({ target: user.email });

  console.log("Seed complete: admin@furnigo.com");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
