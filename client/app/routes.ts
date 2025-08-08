import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("questionaire", "./routes/questionaire.tsx"),
  route("chat", "./routes/chat.tsx"),
  route("call", "./routes/call.tsx"),
] satisfies RouteConfig;
