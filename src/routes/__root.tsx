import { createRootRoute, Outlet } from "@tanstack/react-router";

// <head> tags (title, description, Open Graph, favicons, fonts) live in
// /index.html so they're present in the static file GitHub Pages serves,
// which is what search engines and link-preview bots read first.
export const Route = createRootRoute({
  component: () => <Outlet />,
});
