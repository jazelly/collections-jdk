import type {IQueue} from './IQueue';

export interface IPriorityQueue<T> extends IQueue<T> {
  /**
   * Peek and remove the head of the queue
   */
  pop: () => T | null;
}