import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';

@Catch()
export class AllExceptionFilter
  implements ExceptionFilter {

  catch(exception: any, host: ArgumentsHost) {

    const ctx = host.switchToHttp();

    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any =
      exception.message || 'Internal Server Error';

    if (exception instanceof HttpException) {

      const errorResponse =
        exception.getResponse();

      if (
        typeof errorResponse === 'object' &&
        errorResponse['message']
      ) {
        message = errorResponse['message'];
      }
    }

    response.status(status).json({
      status,
      message
    });
  }
}