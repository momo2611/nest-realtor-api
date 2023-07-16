import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserInfo {
  name: string;
  id: number;
  iat: number;
  exp: number;
}

export const User = createParamDecorator((data, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();

  return req.user;
});
