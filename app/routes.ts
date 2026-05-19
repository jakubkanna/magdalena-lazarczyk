import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("homepage-2", "routes/homepage-2.tsx"),
  route("post/:slug", "routes/post.tsx"),
  route(":category?", "routes/home.tsx"),
] satisfies RouteConfig;
