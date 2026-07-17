import { PipeTransform, ArgumentMetadata, Injectable } from '@nestjs/common';
import DOMPurify from 'isomorphic-dompurify';

@Injectable()
export class XssSanitizationPipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return DOMPurify.sanitize(value);
    }

    if (this.isPlainObject(value)) {
      return this.sanitizeObject(value);
    }

    // Numbers, booleans, complex objects (Context, Socket, etc.) — pass through untouched
    return value;
  }

  private sanitizeObject(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'string') {
        result[key] = DOMPurify.sanitize(val);
      } else if (Array.isArray(val)) {
        result[key] = val.map((item) =>
          typeof item === 'string'
            ? DOMPurify.sanitize(item)
            : this.isPlainObject(item)
              ? this.sanitizeObject(item)
              : item,
        );
      } else if (this.isPlainObject(val)) {
        result[key] = this.sanitizeObject(val);
      } else {
        result[key] = val;
      }
    }
    return result;
  }

  private isPlainObject(obj: any): obj is Record<string, any> {
    if (typeof obj !== 'object' || obj === null) return false;
    const proto = Object.getPrototypeOf(obj);
    return proto === null || proto === Object.prototype;
  }
}
