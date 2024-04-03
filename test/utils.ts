export function assertEqual<T>(actual: T, expected: T) {
    if (actual !== expected) {
      throw new Error(`Assertion failed: ${actual} does not equal ${expected}`);
    }
  }