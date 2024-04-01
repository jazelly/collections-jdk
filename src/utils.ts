export type Comparable = string | number | bigint;

export type IsUndefined<T> = T extends undefined ? true : false;

export type OptionalAll<T> = {
  [K in keyof T]?: T[K];
};

export type RequiredObject<T> = {
  [K in keyof T as {} extends Pick<T, K> ? never: K]: T[K]
};