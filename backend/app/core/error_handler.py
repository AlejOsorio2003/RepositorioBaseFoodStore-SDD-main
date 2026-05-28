from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.exceptions import DomainError

_STATUS_TITLES = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    422: "Unprocessable Entity",
    429: "Too Many Requests",
    500: "Internal Server Error",
}


def _problem_response(status_code: int, detail: object, instance: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "type": f"https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/{status_code}",
            "title": _STATUS_TITLES.get(status_code, "Error"),
            "status": status_code,
            "detail": detail,
            "instance": instance,
        },
        headers={"Content-Type": "application/problem+json"},
    )


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        return _problem_response(exc.status_code, exc.detail, str(request.url.path))

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        # Pydantic v2 errors() may include non-serializable objects in ctx; sanitize them
        errors = []
        for error in exc.errors():
            sanitized = {k: v for k, v in error.items() if k != "ctx"}
            ctx = error.get("ctx")
            if ctx:
                sanitized["ctx"] = {ck: str(cv) if not isinstance(cv, (str, int, float, bool, type(None))) else cv for ck, cv in ctx.items()}
            errors.append(sanitized)
        return _problem_response(status.HTTP_422_UNPROCESSABLE_ENTITY, errors, str(request.url.path))

    @app.exception_handler(DomainError)
    async def domain_error_handler(request: Request, exc: DomainError) -> JSONResponse:
        return _problem_response(exc.status_code, exc.detail, str(request.url.path))

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        return _problem_response(500, str(exc), str(request.url.path))
