import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const start = Date.now();
    const startLabel = `[⏱ Guard][JwtAuthGuard] ${context.getType()}`;
    try {
      return await (super.canActivate(context) as Promise<boolean>);
    } finally {
      const elapsed = Date.now() - start;
      // eslint-disable-next-line no-console
      console.log(`${startLabel} | elapsed: ${elapsed}ms`);
    }
  }

  getRequest(context: ExecutionContext) {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    }

    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
