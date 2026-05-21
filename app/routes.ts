import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/homepage-2.tsx"),
  route("post/:slug", "routes/post.tsx"),
  route(":category?", "routes/home.tsx"),
] satisfies RouteConfig;
