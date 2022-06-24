from fastapi import FastAPI
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from application.exceptions.common import CommonException

from .api.v1.api import router as api_router


try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

instance = FastAPI(title='Service Hub')

instance.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

instance.include_router(api_router, prefix='/api/v1')


@instance.exception_handler(CommonException)
def db_validation_handler(request: Request, error: CommonException) -> JSONResponse:
    return JSONResponse(status_code=error.status_code, content={'message': error.message})
