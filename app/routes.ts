import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("portfolio", "routes/portfolio.tsx"),
  route("bio", "routes/bio.tsx"),
  route("contact", "routes/contact.tsx"),
] satisfies RouteConfig;
