import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  protected getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();

    if (ctx?.req) {
      return { req: ctx.req, res: ctx.req.res };
    }

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    return { req, res };
  }
}
