import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("questionaire", "./routes/questionaire.tsx"),
  route("chat", "./routes/chat.tsx"),
  route("call", "./routes/call.tsx"),
  route("admin", "./routes/admin.tsx"),
  route("questionairev2", "./routes/questionairev2.tsx"),
] satisfies RouteConfig;
