import { Elysia } from "elysia";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = new Elysia({ name: "error-handler" })
  .error({ APP_ERROR: AppError })
  .onError(({ code, error, set }) => {
    switch (code) {
      case "APP_ERROR":
        set.status = error.statusCode;
        return { error: error.message };

      case "VALIDATION":
        set.status = 422;
        return { error: "Validation failed", details: error.message };

      case "NOT_FOUND":
        set.status = 404;
        return { error: "Not found" };

      default:
        console.error("Unhandled error:", error);
        set.status = 500;
        return { error: "Internal server error" };
    }
  });
