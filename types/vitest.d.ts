declare module 'vitest' {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
  export function expect<T>(value: T): {
    toBe(expected: any): void;
    toBeTruthy(): void;
    toBeGreaterThan(expected: number): void;
    toBeGreaterThanOrEqual(expected: number): void;
    toBeLessThanOrEqual(expected: number): void;
    toBeDefined(): void;
    toBeFalsy(): void;
    toEqual(expected: any): void;
    toContain(item: any): void;
    toHaveLength(expected: number): void;
    every(predicate: (item: any) => boolean): { toBe(expected: boolean): void };
    some(predicate: (item: any) => boolean): { toBe(expected: boolean): void };
  };
}
