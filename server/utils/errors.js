export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function errorMiddleware(err, _req, res, _next) {
  const status = err?.status ?? 500;
  const message = err?.message ?? "Server error";
  if (status >= 500) console.error(err);
  res.status(status).json({ error: message });
}
