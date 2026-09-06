import { randomBytes, scryptSync } from "node:crypto";
import postgres from "postgres";

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function readUser(prefix) {
  const role = requiredEnv(`${prefix}_ROLE`);
  if (role !== "waiter" && role !== "kitchen") {
    throw new Error(`${prefix}_ROLE must be waiter or kitchen`);
  }

  return {
    username: requiredEnv(`${prefix}_USERNAME`),
    password: requiredEnv(`${prefix}_PASSWORD`),
    role,
  };
}

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  // Stored format: 16-byte salt as hex, a colon, then the 64-byte scrypt key as hex.
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

async function main() {
  const databaseUrl = requiredEnv("DATABASE_URL");
  const users = [readUser("SISTER1"), readUser("SISTER2")];
  const sql = postgres(databaseUrl, { prepare: false, ssl: "require" });

  try {
    await sql.begin(async (tx) => {
      for (const user of users) {
        await tx`
          insert into guesthouse.users (username, password_hash, role)
          values (${user.username}, ${hashPassword(user.password)}, ${user.role})
          on conflict (username) do update
          set password_hash = excluded.password_hash, role = excluded.role
        `;
      }
    });
    console.log(`Seeded ${users.length} admin users successfully.`);
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error("Failed to seed admin users:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
