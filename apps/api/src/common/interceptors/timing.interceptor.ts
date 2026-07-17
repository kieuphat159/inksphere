import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  runWithTiming,
  startTiming,
  formatTimingReport,
  logCheckpoint,
  getElapsedMs,
} from 'src/common/timing.context';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('TimingInterceptor');
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Determine request info based on context type (HTTP or GraphQL)
    let method = 'UNKNOWN';
    let url = 'UNKNOWN';

    const ctxType = context.getType<'http' | 'graphql' | 'ws'>();

    if (ctxType === 'http') {
      const req = context.switchToHttp().getRequest();
      method = req.method ?? 'HTTP';
      url = req.originalUrl ?? req.url ?? 'unknown';
    } else if (ctxType === 'graphql') {
      method = 'GRAPHQL';
      // Try to get query info from GraphQL context
      const gqlContext = context.getArgByIndex(2);
      if (gqlContext?.req) {
        url =
          gqlContext.req.body?.operationName ??
          gqlContext.req.originalUrl ??
          'gql';
      } else {
        url = 'gql';
      }
    }

    const timing = startTiming(method, url);

    return new Observable((observer) => {
      runWithTiming(timing, () => {
        logCheckpoint('request-received');

        const sub = next
          .handle()
          .pipe(
            tap({
              subscribe: () => {
                logCheckpoint('handler-subscribed');
              },
              next: () => {
                logCheckpoint('handler-resolved');
              },
              complete: () => {
                // Request completed successfully
                const totalMs = getElapsedMs(timing);

                this.logger.log(formatTimingReport(timing));
              },
              error: () => {
                // Request failed - still log timing
                const totalMs = getElapsedMs(timing);

                this.logger.error(formatTimingReport(timing));
              },
            }),
          )
          .subscribe(observer);

        return () => sub.unsubscribe();
      });
    });
  }
}
