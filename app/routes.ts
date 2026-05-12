import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route(":category?", "routes/home.tsx"),
] satisfies RouteConfig;
