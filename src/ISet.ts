import { type ICollection } from "./ICollection";
import { type IIterator } from "./IIterator";

export interface ISet<E> {
    isEmpty(): boolean;
    contains(o: E): boolean;
    size(): number;
    toArray(): E[];
    add(e: E): boolean;
    remove(o: E): boolean;
    containsAll(c: ICollection<any>): boolean;
    equals(o: object): boolean;
    iterator(): IIterator<E>;
}