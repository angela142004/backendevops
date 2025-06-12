import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createSubmission = async (req, res) => {
  try {
    const { nombre, dni, telefono, correo, grado, nivel } = req.body;

    const newSubmission = await prisma.formSubmission.create({
      data: {
        nombre,
        dni,
        telefono,
        correo,
        grado,
        nivel,
      },
    });

    res.status(201).json(newSubmission);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el submission" });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const submissions = await prisma.formSubmission.findMany();
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las submissions" });
  }
};

export const deleteSubmission = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSubmission = await prisma.formSubmission.delete({
      where: { id: Number(id) },
    });
    res.json({
      message: "Submission eliminada correctamente",
      deletedSubmission,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la submission" });
  }
};
