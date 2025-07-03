import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET videos con pagina 'home'
export const getEnlacesHome = async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      where: {
        pagina: "home",
      },
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener videos con pagina home" });
  }
};

// GET videos con pagina 'blog'
export const getEnlacesBlog = async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      where: {
        pagina: "blog",
      },
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener videos con pagina blog" });
  }
};

// UPDATE video por ID
export const updateEnlace = async (req, res) => {
  const { id } = req.params;
  const { enlace, pagina } = req.body;
  try {
    // Usar la tabla video, ya que los GET también usan video
    const video = await prisma.video.update({
      where: { id: Number(id) }, // Asegura que el id sea numérico
      data: { enlace, pagina },
    });
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el video" });
  }
};
