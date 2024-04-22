export interface Equalable {
  equals(o: object): boolean;
}

export interface ICollection<T> {
  add: (t: T) => boolean;
  isEmpty: () => boolean;
  size: () => number;
  remove?: (t: T) => T;
  contains?: (t: T) => boolean;
}
