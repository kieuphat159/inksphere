import { Injectable } from '@nestjs/common';

type Bucket = {
  count: number;
  resetAt: number;
};

@Injectable()
export class ChatRateLimitService {
  private readonly buckets = new Map<string, Bucket>();
  private hitsSinceCleanup = 0;

  consume(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const current = this.buckets.get(key);

    if (!current || current.resetAt <= now) {
      this.buckets.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      this.maybeCleanup(now);

      return {
        allowed: true,
        remaining: Math.max(limit - 1, 0),
        retryAfterMs: 0,
      };
    }

    if (current.count >= limit) {
      this.maybeCleanup(now);

      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(current.resetAt - now, 0),
      };
    }

    current.count += 1;
    this.maybeCleanup(now);

    return {
      allowed: true,
      remaining: Math.max(limit - current.count, 0),
      retryAfterMs: 0,
    };
  }

  private maybeCleanup(now: number) {
    this.hitsSinceCleanup += 1;
    if (this.hitsSinceCleanup < 200) {
      return;
    }

    this.hitsSinceCleanup = 0;
    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }
}
