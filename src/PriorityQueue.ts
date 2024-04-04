import type { IPriorityQueue } from './IPriorityQueue';
import type { Comparable, Equal } from './utils';

type Comparator<T> = (a: T, b: T) => number;

type PriorityQueueParams<T> = T extends Comparable
? [{
    from?: Array<T>;
    comparator?: Comparator<T>;
  }?]
  : Equal<T, unknown> extends true
    ? [never]
    : [{
      from?: Array<T>;
      comparator: Comparator<T>;
    }]

export class PriorityQueue<T> implements IPriorityQueue<T> {
  /**
   * The given array that the PQ is built on
   */
  #q: Array<T>;
  /**
   * Comparator function
   * @params a, b
   * @return A negative value indicates that `a` should come before `b`
   *         A positive value indicates that `a` should come after `b`
   *         0 indicates a == b and `a` will come after `b`
   */
  #comparator: Comparator<T>;

  /**
   * @param params an object containing
   *        comparator: mandatory if element is not comparable
   *        from: optional array - if provided, the queue will be construcuted based on the array
   */
  constructor(...params: PriorityQueueParams<T>) {
    const defaultQ = new Array<T>();
    const defaultComparator: Comparator<T> = (a, b) => {
      if (a === b) return 0;
      if (a > b) return -1;
      return 1;
    };

    const options = params[0]
  
    if (!options) {
      this.#q = defaultQ;
      this.#comparator = defaultComparator;
    } else {
      const { comparator, from } = options;
      if (Array.isArray(from)) {
        this.#q = from;
        this.heapifyAll();
      } else {
        this.#q = defaultQ;
      }
      this.#comparator = comparator ?? defaultComparator;
    }
  }

  isEmpty() {
    return this.#q.length === 0;
  }

  size() {
    return this.#q.length;
  }

  pop(): T | null {
    if (this.#q.length === 0) {
      return null;
    }

    let max = this.#q[0];
    this.#q[0] = this.#q[this.#q.length - 1];
    this.#q.pop();

    let i = 0;
    while (true) {
        let left = 2 * i + 1;
        let right = 2 * i + 2;
        let largest = i;

        if (this.#isValidIndex(left) && this.#comparator(this.#q[left], this.#q[largest]) <= 0) {
            largest = left;
        }

        if (this.#isValidIndex(right) && this.#comparator(this.#q[right], this.#q[largest]) <= 0) {
            largest = right;
        }

        if (largest !== i) {
            [this.#q[i], this.#q[largest]] = [this.#q[largest], this.#q[i]];
            i = largest;
        } else {
            break;
        }
    }

    return max;
  }

  peek(): T {
    return this.#q[0];
  }

  add(t: T): boolean {
    this.#q.push(t);

    let i = this.#q.length - 1;
    
    while (i > 0) {
        const parent = this.#getParentIndex(i);

        if (this.#isValidIndex(parent) && this.#comparator(this.#q[i], this.#q[parent]) <= 0) {
            [this.#q[i], this.#q[parent]] = [this.#q[parent], this.#q[i]];
            i = parent;
        } else {
            break;
        }
    }

    return true;
  }

  /**
   * Heap sort the queue
   */
  heapifyAll() {
    const n = this.#q.length;
    const lastParent = this.#getParentIndex(n);
    for (let i = lastParent; i >= 0; i--) {
      this.#heapify(i);
    }
  }

  #heapify(i: number) {
    let largest = i;

    const left = this.#getLeftChildIndex(i);
    const right = this.#getRightChildIndex(i);

    if (this.#isValidIndex(left) && this.#q[left] > this.#q[largest]) {
      largest = left;
    }

    if (this.#isValidIndex(right) && this.#q[right] > this.#q[largest]) {
      largest = right;
    }

    if (largest !== i) {
      [this.#q[i], this.#q[largest]] = [this.#q[largest], this.#q[i]];
    }

    this.#heapify(largest);
  }

  #getLeftChildIndex(i: number) {
    return i * 2 + 1;
  }

  #getRightChildIndex(i: number) {
    return i * 2 + 2;
  }

  #getParentIndex(i: number) {
    return Math.floor((i-1) / 2);
  }

  #isValidIndex(i: number) {
    return i >= 0 && i < this.#q.length;
  }
}