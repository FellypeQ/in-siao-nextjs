export class AppError extends Error {
  statusCode: number
  code: string

  constructor(message: string, statusCode = 400, code = "APP_ERROR") {
    super(message)
    this.name = "AppError"
    this.statusCode = statusCode
    this.code = code
  }
}

export function toErrorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      },
      { status: error.statusCode }
    )
  }

  if (process.env.NODE_ENV === "development") {
    console.error("[INTERNAL_SERVER_ERROR] Erro nao tratado:", error)
  }

  return Response.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno do servidor"
      }
    },
    { status: 500 }
  )
}
