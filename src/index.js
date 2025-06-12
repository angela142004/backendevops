import express from "express";
import { PORT, CORS_ORIGIN, JWT_SECRET, API_KEY } from "./config/env.js";
import "dotenv/config.js";

import usarRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import formRoutes from "./routes/form.route.js";
// import postImgRoutes from "./routes/postimg.routes.js";

import morgan from "morgan";
import cors from "cors";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

const corsOptions = {
  origin: CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  credentials: true,
};
app.use(cors(corsOptions));




if (!API_KEY) throw new Error("API_KEY no está definida");



if (!JWT_SECRET) throw new Error("JWT_SECRET no está definida");

app.use("/prisma", usarRoutes);
app.use("/prisma", formRoutes);
app.use("/prisma", postRoutes);
// app.use("/prisma", postImgRoutes);

// Solo inicia el servidor si NO estás corriendo en modo de test
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log("Servidor en el puerto", PORT);
    console.log("API Key configurada:", API_KEY ? "Sí" : "No");
  });
}

// Exporta la app para pruebas
export default app;
