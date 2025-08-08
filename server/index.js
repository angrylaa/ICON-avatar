import express from "express";
import authRoutes from "./routes/auth.routes.js";
import { errorMiddleware } from "./utils/errors.js";

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running http://localhost:${PORT}`));
