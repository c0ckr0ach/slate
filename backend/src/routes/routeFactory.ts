import { Router } from "express";

export function createPlaceholderRouter(resource: string): Router {
  const router = Router();
  router.all("*", (_request, response) => {
    response.status(501).json({ error: { message: `${resource} endpoints are not implemented yet` } });
  });
  return router;
}
