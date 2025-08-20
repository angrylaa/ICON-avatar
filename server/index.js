import express from "express";
import authRoutes from "./routes/auth.routes.js";
import { errorMiddleware } from "./utils/errors.js";
import cookieParser from "cookie-parser";
import usersRoutes from "./routes/users.routes.js";
import cors from "cors";
import knowledgeRoutes from "./routes/knowledge.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/knowledge", knowledgeRoutes);
app.use("/conversation", conversationRoutes);
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running http://localhost:${PORT}`));
