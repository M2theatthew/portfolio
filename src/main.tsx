import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

const rootEl = document.getElementById("root")!;

createRoot(rootEl).render(
  <StrictMode>
    <RouterProvider router={getRouter()} />
  </StrictMode>,
);

// Let the first paint land, then fade the app in (see #root in styles.css) —
// one soft step instead of the page popping in as soon as JS finishes.
requestAnimationFrame(() => {
  requestAnimationFrame(() => rootEl.classList.add("is-loaded"));
});
