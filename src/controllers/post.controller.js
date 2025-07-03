import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Obtener todos los posts
 */
export const getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        postType: true,
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los posts" });
  }
};

/**
 * Obtener un post por ID
 */
export const getPostById = async (req, res) => {
  const { id: idParam } = req.params;
  const { id, is_admin } = req.user; // Usar 'id' en vez de 'userId'

  try {
    // Definir las condiciones de búsqueda según el rol del usuario
    const whereCondition = {
      id: Number(idParam),
      ...(is_admin ? {} : { userId: Number(id) }),
    };

    // Buscar el post por ID con las condiciones apropiadas
    const post = await prisma.post.findFirst({
      where: whereCondition,
      include: {
        postType: true,
        images: true, // Imágenes del post
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        error: is_admin
          ? "Post no encontrado"
          : "Post no encontrado o no tienes permiso para acceder a este recurso",
      });
    }

    res.json(post);
  } catch (error) {
    console.error("Error al obtener el post:", error);
    res.status(500).json({ error: "Error al obtener el post" });
  }
};

/**
 * Obtener todos los posts de un usuario
 */

export const getMyPosts = async (req, res) => {
  const { id } = req.user; // Usar 'id' en vez de 'userId'

  try {
    const posts = await prisma.post.findMany({
      where: { userId: Number(id) },
      include: {
        postType: true,
        images: true, // Incluye las imágenes asociadas a cada post
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    if (posts.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron posts para este usuario" });
    }

    res.json(posts);
  } catch (error) {
    console.error("Error al obtener los posts del usuario:", error);
    res.status(500).json({ error: "Error al obtener los posts del usuario" });
  }
};

/**
 * Crear un nuevo post
 */
export const createPost = async (req, res) => {
  const { userId, postType, title, content, start_at, end_at, images } =
    req.body;

  try {
    // Crear el post
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        postType: {
          connect: {
            id: postType,
          },
        },
        start_at: start_at ? new Date(start_at) : undefined,
        end_at: end_at ? new Date(end_at) : undefined,
        user: {
          connect: { id: userId }, // Conectando al usuario existente
        },
      },
    });

    // Crear las imágenes asociadas al post
    if (images && Array.isArray(images) && images.length > 0) {
      console.log("Creando imágenes:", images);
      await prisma.postImage.createMany({
        data: images.map((img) => ({
          postId: newPost.id,
          image_url: img.image_url,
          is_cover: img.is_cover || false,
        })),
      });
      console.log("Imágenes creadas para post", newPost.id);
      // Obtener el post completo con las imágenes
      const postWithImages = await prisma.post.findUnique({
        where: { id: newPost.id },
        include: {
          images: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          postType: true,
        },
      });
      return res.status(201).json(postWithImages);
    } else {
      // Si no hay imágenes, devolver el post simple
      const postSimple = await prisma.post.findUnique({
        where: { id: newPost.id },
        include: {
          images: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          postType: true,
        },
      });
      return res.status(201).json(postSimple);
    }
  } catch (error) {
    console.error("Error al crear el post:", error);
    res.status(500).json({ error: "Error al crear el post" });
  }
};

/**
 * Actualizar un post existente
 */
export const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, start_at, end_at, images } = req.body;

  try {
    // 1. Obtener la publicación actual
    const currentPost = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: { images: true }, // Incluye las imágenes asociadas al post
    });

    if (!currentPost) {
      throw new Error("Publicación no encontrada");
    }

    // 2. Si se enviaron imágenes en el request, manejar la actualización
    if (images && Array.isArray(images)) {
      // Eliminar todas las imágenes actuales de la relación
      await prisma.postImage.deleteMany({
        where: { postId: Number(id) },
      });

      // Crear las nuevas relaciones de imágenes
      if (images.length > 0) {
        const imageData = images.map((img, index) => ({
          postId: Number(id),
          image_url: img.image_url,
          is_cover: img.is_cover || index === 0, // Primera imagen como cover por defecto
        }));

        await prisma.postImage.createMany({
          data: imageData,
        });
      }
    }

    // 3. Actualizar los datos básicos del post (título, contenido, fechas)
    const updatedPost = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        title, // Nuevo título
        content, // Nuevo contenido
        start_at: start_at ? new Date(start_at) : null, // Asegurarse de que sea un objeto Date
        end_at: end_at ? new Date(end_at) : null, // Asegurarse de que sea un objeto Date
      },
      include: {
        images: true, // Incluir las imágenes en la respuesta (para confirmar la actualización)
      },
    });

    // 4. Responder con el post actualizado
    res.json(updatedPost);
  } catch (error) {
    console.error("Error al actualizar el post:", error);
    res.status(500).json({
      error: "Error al actualizar el post",
      details: error.message,
    });
  }
};

/**
 * Eliminar un post
 */
export const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.postImage.deleteMany({ where: { postId: Number(id) } }); // Borra imágenes asociadas
    await prisma.post.delete({ where: { id: Number(id) } });
    res.json({ message: "Post eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el post" });
  }
};

/**
 * Obtener posts para la página pública
 */
export const getPublicPosts = async (req, res) => {
  try {
    const { tipo } = req.query; // se espera ?tipo=1 como query string

    const filter = tipo ? { postTypeId: parseInt(tipo) } : {};
    const posts = await prisma.post.findMany({
      where: filter,
      include: {
        postType: true,
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        images: true,
      },
      orderBy: {
        created_at: "desc", // Usar created_at en lugar de createdAt
      },
    });
    // Transforma fechas a strings legibles
    const formattedPosts = posts.map((post) => ({
      ...post,
      created_at: post.created_at.toISOString(), // 👈 convierte a string ISO
    }));
    res.json(formattedPosts);
  } catch (error) {
    console.error("Error al obtener los posts públicos:", error);
    res.status(500).json({ error: "Error al obtener los posts" });
  }
};

export const getPublicPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        postType: true,
        images: true,
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Publicación no encontrada" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error al obtener la publicación pública:", error);
    res
      .status(500)
      .json({ error: "Error del servidor al obtener la publicación" });
  }
};
