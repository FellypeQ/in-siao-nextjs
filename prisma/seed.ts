import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import "dotenv/config";
import { createCipheriv, createHash, randomBytes } from "node:crypto";

function encryptSurname(value: string): string {
  const secret = process.env.AUTH_SECRET ?? "dev-in-siao-auth-secret-change-this";
  const key = createHash("sha256").update(secret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${authTag.toString("base64")}.${encrypted.toString("base64")}`;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL nao definida");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "master@siao.com.br";
  const passwordHash = await hash("Siao@2026", 12);

  const sobrenomeEncrypted = encryptSurname("");

  await prisma.user.upsert({
    where: { email },
    update: { sobrenomeEncrypted },
    create: {
      nome: "Master",
      sobrenomeEncrypted,
      email,
      passwordHash,
      role: "MASTER",
    },
  });

  console.log("Seed concluido: usuario MASTER criado/verificado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
