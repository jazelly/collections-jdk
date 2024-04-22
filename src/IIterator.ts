export interface IIterator<E> {
    hasNext(): boolean;
    next(): { value: E, done: boolean };
    [Symbol.iterator](): IIterator<E>;
}