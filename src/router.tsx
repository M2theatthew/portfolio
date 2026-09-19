import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

let router: ReturnType<typeof createAppRouter> | undefined;

function createAppRouter() {
  return createRouter({ routeTree, defaultErrorComponent: AppErrorComponent });
}

/** One router for the whole page — created lazily so it isn't rebuilt on re-render. */
export function getRouter() {
  router ??= createAppRouter();
  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
