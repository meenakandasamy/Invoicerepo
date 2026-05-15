import { ZodError } from 'zod';
import type { ZodSchema } from 'zod';

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; issues?: ZodError['issues'] };

export class Validator {
  static parse<T>(schema: ZodSchema<T>, data: unknown): ParseResult<T> {
    try {
      const parsed = schema.parse(data);
      return { success: true, data: parsed };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          error: 'Validation failed',
          issues: error.issues,
        };
      }
      return {
        success: false,
        error: 'Unknown error during validation',
      };
    }
  }
}
