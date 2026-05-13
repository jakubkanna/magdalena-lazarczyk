import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("post/:slug", "routes/post.tsx"),
  route(":category?", "routes/home.tsx"),
] satisfies RouteConfig;
