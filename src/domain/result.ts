/**
 * @file result.ts
 * @description Pure TypeScript Result<T, E> type and utility constructors for exception-free error handling.
 */

/**
 * Represents a successful operation containing a value of type T.
 */
export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

/**
 * Represents a failed operation containing an error of type E.
 */
export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

/**
 * Result type representing either success (Ok<T>) or failure (Err<E>).
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Constructs a successful Result.
 * @param value - The success payload.
 * @returns Ok<T> result.
 */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

/**
 * Constructs a failure Result.
 * @param error - The error payload.
 * @returns Err<E> result.
 */
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

/**
 * Type guard checking if a Result is Ok.
 * @param result - The Result to inspect.
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

/**
 * Type guard checking if a Result is Err.
 * @param result - The Result to inspect.
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}

/**
 * Maps the value inside an Ok result using a transform function.
 * @param result - The Result to transform.
 * @param fn - Pure mapping function.
 */
export function mapResult<T, U, E>(result: Result<T, E>, fn: (val: T) => U): Result<U, E> {
  if (isOk(result)) {
    return ok(fn(result.value));
  }
  return result;
}
