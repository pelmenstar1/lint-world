export class LintWorldError extends Error {
  constructor(message: string) {
    super(message);

    this.name = 'LintWorldError';
  }
}
