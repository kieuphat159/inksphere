import { Injectable, ServiceUnavailableException } from '@nestjs/common';

type QueueItem<T> = {
  task: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

@Injectable()
export class ChatMessageQueueService {
  private readonly concurrency = Math.max(
    Number(process.env.CHAT_QUEUE_CONCURRENCY ?? 2),
    1,
  );
  private readonly maxPending = Math.max(
    Number(process.env.CHAT_QUEUE_MAX_PENDING ?? 200),
    1,
  );
  private activeCount = 0;
  private pending: Array<QueueItem<unknown>> = [];

  enqueue<T>(task: () => Promise<T>): Promise<T> {
    if (this.pending.length >= this.maxPending) {
      throw new ServiceUnavailableException(
        'Chat queue is full. Please retry shortly.',
      );
    }

    return new Promise<T>((resolve, reject) => {
      this.pending.push({ task, resolve, reject });
      this.drain();
    });
  }

  private drain() {
    while (this.activeCount < this.concurrency && this.pending.length > 0) {
      const next = this.pending.shift();
      if (!next) {
        return;
      }

      this.activeCount += 1;
      next
        .task()
        .then(next.resolve)
        .catch(next.reject)
        .finally(() => {
          this.activeCount -= 1;
          queueMicrotask(() => this.drain());
        });
    }
  }
}
