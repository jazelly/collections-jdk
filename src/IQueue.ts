import type { ICollection } from "./ICollection";

export interface IQueue<T> extends ICollection<T> {
  /**
   * Peek the head of the queue
   */
  peek: () => T;
}