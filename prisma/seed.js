import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Insertar tipos de publicaciones
  const postTypes = ["evento", "blog", "comunicado"];
  for (const name of postTypes) {
    await prisma.postType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("Tipos de publicaciones insertados o actualizados.");

  // Insertar el primer usuario si no existe
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@mail.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@mail.com",
      password_hash: hashedPassword,
      is_admin: true,
    },
  });
  console.log("Primer usuario insertado o ya existe:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
