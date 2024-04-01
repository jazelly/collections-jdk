export function assertEqual(arg0: string | number | boolean, arg1: string | number | boolean) {
  if (arg0 !== arg1) {
    throw new Error(`Assertion failed: ${arg0} !== ${arg1}`);
  }
}