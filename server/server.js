import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import dns from "node:dns/promises";

import productRoutes from "./routes/productRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import userController from "./controllers/UserController.js";
import ServiceRoutes from "./routes/ServiceRoutes.js";
import ReportRoutes from "./routes/ReportRoutes.js";
import ScheduleRoutes from "./routes/ScheduleRoutes.js";

dotenv.config();
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado com sucesso"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

// Rotas
app.use("/api/users", userController);
app.use("/api/products", productRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/schedules", ScheduleRoutes);
app.use("/api/services", ServiceRoutes);
app.use("/api/reports", ReportRoutes);

// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));


