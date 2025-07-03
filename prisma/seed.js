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

  // Insertar los primeros 4 videos solo si no existen
  const videos = [
    {
      enlace:
        "https://www.youtube.com/embed/K5o7U1WrJXc?autoplay=1&rel=0&modestbranding=1",
      pagina: "home",
    },
    { enlace: "https://www.youtube.com/embed/QEpJy9eiqX4", pagina: "blog" },
    { enlace: "https://www.youtube.com/embed/FOt91LmV_fY", pagina: "blog" },
    { enlace: "https://www.youtube.com/embed/Ic8EgWhbA9U", pagina: "blog" },
  ];

  for (const video of videos) {
    const exists = await prisma.video.findFirst({
      where: { enlace: video.enlace, pagina: video.pagina },
    });
    if (!exists) {
      await prisma.video.create({
        data: video,
      });
    }
  }
  console.log("Videos insertados o ya existentes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
