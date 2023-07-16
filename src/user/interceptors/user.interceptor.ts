import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';

export class UserInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, handler: CallHandler<any>) {
    const req = context.switchToHttp().getRequest();
    const token = req?.headers?.authorization?.split('Bearer ')[1];
    const user = await jwt.decode(token);
    req.user = user;
    return handler.handle();
  }
}
