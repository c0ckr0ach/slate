import type { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  response.status(500).json({ error: { message } });
};

export default errorHandler;
