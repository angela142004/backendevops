import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Obtener todas las imágenes de posts
 */
export const getPostImages = async (req, res) => {
  try {
    const images = await prisma.postImage.findMany();
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las imágenes" });
  }
};

/**
 * Obtener imágenes por ID de publicación
 */
export const getImagesByPostId = async (req, res) => {
  const { postId } = req.params;
  try {
    const images = await prisma.postImage.findMany({
      where: { postId: Number(postId) },
    });
    res.json(images);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener las imágenes de la publicación" });
  }
};

/**
 * Crear una nueva imagen para un post
 */
export const createPostImage = async (req, res) => {
  const { postId, image_url, is_cover } = req.body;
  try {
    const newImage = await prisma.postImage.create({
      data: {
        postId,
        image_url,
        is_cover: is_cover ?? false,
      },
    });
    res.status(201).json(newImage);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la imagen" });
  }
};

/**
 * Actualizar una imagen de post
 */
export const updatePostImage = async (req, res) => {
  const { id } = req.params;
  const { image_url, is_cover } = req.body;
  try {
    const updatedImage = await prisma.postImage.update({
      where: { id: Number(id) },
      data: {
        image_url,
        is_cover,
      },
    });
    res.json(updatedImage);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la imagen" });
  }
};

/**
 * Eliminar una imagen de post
 */
export const deletePostImage = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.postImage.delete({
      where: { id: Number(id) },
    });
    res.json({ message: "Imagen eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la imagen" });
  }
};
