export class AppError extends Error {
  private origin: string = '';
  constructor(message: string, origin?: unknown) {
    super(message);
    this.name = 'AppError';
    this.stack = new Error().stack;

    // @ts-ignore
    this.origin = (origin && origin.message) || '';
  }
}
