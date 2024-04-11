import { Comparable, type Comparator } from "./utils";

class Entry<K, V> {
  static BLACK = false;
  static RED = true;

  key: K;
  value: V;
  left: Entry<K, V> | undefined;
  right: Entry<K, V> | undefined;
  parent: Entry<K, V> | undefined;
  color: boolean = Entry.BLACK;

  constructor(key: K, value: V, parent: Entry<K, V> | undefined) {
    this.key = key;
    this.value = value;
    this.parent = parent;
  }

  equals(other: Entry<K, V>): boolean {
    return (
      other instanceof Entry &&
      this.key === other.key &&
      this.value === other.value
    );
  }
}

export class TreeMap<K, V> {
  #comparator: Comparator<K>;
  #root: Entry<K, V> | undefined;
  #size: number = 0;
  #modCount: number = 0;

  constructor(
    ...params: K extends Comparable ? [Comparator<K>?] : [Comparator<K>]
  ) {
    const comparator = params[0];
    this.#comparator =
      comparator ??
      ((a: K, b: K) => {
        if (a > b) return 1;
        else if (a < b) return -1;
        return 0;
      });
  }

  constainsKey(key: K): boolean {
    return this.getEntry(key) !== undefined;
  }

  getEntry(key: K): Entry<K, V> | undefined {
    const cpr = this.#comparator;
    const k = key;
    let p = this.#root;

    while (p) {
      const cmp = cpr(k, p.key);
      if (cmp > 0) {
        p = p.right;
      } else if (cmp < 0) {
        p = p.left;
      } else {
        return p;
      }
    }

    return undefined;
  }

  // TODO: getCeilingEntry
  // TODO: getFloorEntry
  // TODO: getHigherEntry
  // TODO: getLowerEntry

  put(key: K, value: V): V | undefined {
    return this.#putAndReplayOldMaybe(key, value, true);
  }

  /**
   * Removes the mapping for this key from this TreeMap if present.
   *
   * @param  key key for which mapping should be removed
   * @return the previous value associated with {@code key}, or
   *         {@code null} if there was no mapping for {@code key}.
   *         (A {@code null} return can also indicate that the map
   *         previously associated {@code null} with {@code key}.)
   * @throws ClassCastException if the specified key cannot be compared
   *         with the keys currently in the map
   * @throws NullPointerException if the specified key is null
   *         and this map uses natural ordering, or its comparator
   *         does not permit null keys
   */
  remove(key: K): V | undefined {
    const p = this.getEntry(key);
    if (!p) return undefined;

    const oldValue = p.value;
    this.#deleteEntry(p);
    return oldValue;
  }

  /**
   * Removes all of the mappings from this map.
   * The map will be empty after this call returns.
   */
  clear() {
    this.#modCount++;
    this.#size = 0;
    this.#root = undefined;
  }

  #addEntry(key: K, value: V, parent: Entry<K, V>, addToLeft: boolean) {
    const e = new Entry<K, V>(key, value, parent);
    if (addToLeft) parent.left = e;
    else parent.right = e;
    this.#fixAfterInsertion(e);
    this.#size++;
    this.#modCount++;
  }

  #addEntryToEmptyMap(key: K, value: V) {
    if (key) {
      this.#root = new Entry<K, V>(key, value, undefined);
      this.#size = 1;
      this.#modCount++;
    }
  }

  #putAndReplayOldMaybe(key: K, value: V, replaceOld: boolean): V | undefined {
    let t = this.#root;
    if (!t) {
      this.#addEntryToEmptyMap(key, value);
      return undefined;
    }

    let cmp: number;
    let parent: Entry<K, V>;
    const cpr = this.#comparator;
    do {
      parent = t;
      cmp = cpr(key, t.key);
      if (cmp < 0) t = t.left;
      else if (cmp > 0) t = t.right;
      else {
        const oldValue: V = t.value;
        if (replaceOld || !oldValue) {
          t.value = value;
        }
        return oldValue;
      }
    } while (t);

    this.#addEntry(key, value, parent, cmp < 0);
    return undefined;
  }

  getFirstEntry(): Entry<K, V> | undefined {
    let p = this.#root;
    if (p)
      while(p.left)
        p = p.left;
    return p;
  }

  getLastEntry(): Entry<K, V> | undefined {
    let p = this.#root;
    if (p)
      while(p.right)
        p = p.right;
    return p;
  }

  /**
   * Returns the successor of the specified Entry, or null if no such.
   */
  static successor<K, V>(t: Entry<K, V>): Entry<K, V> | undefined {
    if (!t) {
      return undefined;
    } else if (t.right) {
      let p = t.right;
      while (p.left) {
        p = p.left;
      }
      return p;
    } else {
      let p = t.parent;
      let ch = t;
      while (p && ch === p.right) {
        ch = p;
        p = p.parent;
      }
      return p;
    }
  }

  static predecessor<K, V>(t: Entry<K, V>): Entry<K, V> | undefined {
    if (!t) {
      return undefined;
    } else if (t.left) {
      let p = t.left;
      while (p.right) {
        p = p.right;
      }
      return p;
    } else {
      let p = t.parent;
      let ch = t;
      while (p && ch === p.left) {
        ch = p;
        p = p.parent;
      }
      return p;
    }
  }

  /**
   * Balancing operations.
   *
   * Implementations of rebalancings during insertion and deletion are
   * slightly different than the CLR version.  Rather than using dummy
   * nilnodes, we use a set of accessors that deal properly with null.  They
   * are used to avoid messiness surrounding nullness checks in the main
   * algorithms.
   */

  static #colorOf<K, V>(p: Entry<K, V> | undefined): boolean {
    return !p ? Entry.BLACK : p.color;
  }

  static #setColor<K, V>(p: Entry<K, V> | undefined, c: boolean) {
    if (p) p.color = c;
  }

  static #parentOf<K, V>(p: Entry<K, V> | undefined): Entry<K, V> | undefined {
    return p?.parent;
  }

  static #leftOf<K, V>(p: Entry<K, V> | undefined): Entry<K, V> | undefined {
    return p?.left;
  }

  static #rightOf<K, V>(p: Entry<K, V> | undefined): Entry<K, V> | undefined {
    return p?.right;
  }

  /**
   * @assume p has right child and parent
   */
  #rotateLeft(p: Entry<K, V> | undefined) {
    if (p) {
      const r = p.right;
      p.right = r!.left;
      if (r?.left) r.left.parent = p;
      r!.parent = p.parent;
      if (!p.parent) this.#root = r;
      else if (p.parent.left === p) p.parent.left = r;
      else p.parent.right = r;
      r!.left = p;
      p.parent = r;
    }
  }

  /**
   * @assume p has left child
   */
  #rotateRight(p: Entry<K, V> | undefined) {
    if (p) {
      const l = p.left;
      p.left = l!.right;
      if (l!.right) l!.right.parent = p;
      l!.parent = p.parent;
      if (!p.parent) this.#root = l;
      else if (p.parent.right === p) p.parent.right = l;
      else p.parent.left = l;
      l!.right = p;
      p.parent = l;
    }
  }

  #fixAfterInsertion(x: Entry<K, V>) {
    x.color = Entry.RED;

    while (x && x !== this.#root && x.parent!.color === Entry.RED) {
      if (
        TreeMap.#parentOf(x) ===
        TreeMap.#leftOf(TreeMap.#parentOf(TreeMap.#parentOf(x)))
      ) {
        // parent comes from left branch
        const y = TreeMap.#rightOf(TreeMap.#parentOf(TreeMap.#parentOf(x)));
        if (TreeMap.#colorOf(y) === Entry.RED) {
          TreeMap.#setColor(x, Entry.BLACK);
          TreeMap.#setColor(y, Entry.BLACK);
          TreeMap.#setColor(TreeMap.#parentOf(TreeMap.#parentOf(x)), Entry.RED);
        } else {
          if (x === TreeMap.#rightOf(TreeMap.#parentOf(x))) {
            x = TreeMap.#parentOf(x)!;
            this.#rotateLeft(x);
          }
          TreeMap.#setColor(TreeMap.#parentOf(x), Entry.BLACK);
          TreeMap.#setColor(TreeMap.#parentOf(TreeMap.#parentOf(x)), Entry.RED);
          this.#rotateRight(TreeMap.#parentOf(TreeMap.#parentOf(x)));
        }
      } else {
        // parent comes from right branch
        const y = TreeMap.#leftOf(TreeMap.#parentOf(TreeMap.#parentOf(x)));
        if (TreeMap.#colorOf(y) == Entry.RED) {
          TreeMap.#setColor(TreeMap.#parentOf(x), Entry.BLACK);
          TreeMap.#setColor(y, Entry.BLACK);
          TreeMap.#setColor(TreeMap.#parentOf(TreeMap.#parentOf(x)), Entry.RED);
          x = TreeMap.#parentOf(TreeMap.#parentOf(x))!;
        } else {
          if (x == TreeMap.#leftOf(TreeMap.#parentOf(x))) {
            x = TreeMap.#parentOf(x)!;
            this.#rotateRight(x);
          }
          TreeMap.#setColor(TreeMap.#parentOf(x), Entry.BLACK);
          TreeMap.#setColor(TreeMap.#parentOf(TreeMap.#parentOf(x)), Entry.RED);
          this.#rotateLeft(TreeMap.#parentOf(TreeMap.#parentOf(x)));
        }
      }
    }

    this.#root!.color = Entry.BLACK;
  }

  #deleteEntry(p: Entry<K, V>) {
    this.#modCount++;
    this.#size--;

    // If strictly internal, copy successor's element to p and then make p
    // point to successor.
    if (p.left && p.right) {
      const s = TreeMap.successor(p)!;
      p.key = s.key;
      p.value = s.value;
      p = s;
    }

    // Start fixup at replacement node, if it exists.
    const replacement = p.left ? p.left : p.right;

    if (replacement) {
      // Link replacement to parent
      replacement.parent = p.parent;
      if (!p.parent) this.#root = replacement;
      else if (p == p.parent.left) p.parent.left = replacement;
      else p.parent.right = replacement;

      // Null out links so they are OK to use by fixAfterDeletion.
      p.left = undefined;
      p.right = undefined;
      p.parent = undefined;

      // Fix replacement
      if (p.color === Entry.BLACK) this.#fixAfterDeletion(replacement);
    } else if (!p.parent) {
      // return if we are the only node.
      this.#root = undefined;
    } else {
      //  No children. Use self as phantom replacement and unlink.
      if (p.color === Entry.BLACK) this.#fixAfterDeletion(p);

      if (p.parent) {
        if (p == p.parent.left) p.parent.left = undefined;
        else if (p == p.parent.right) p.parent.right = undefined;
        p.parent = undefined;
      }
    }
  }

  #fixAfterDeletion(x: Entry<K, V>) {
    while (x !== this.#root && TreeMap.#colorOf(x) === Entry.BLACK) {
      if (x == TreeMap.#leftOf(TreeMap.#parentOf(x))) {
        let sib = TreeMap.#rightOf(TreeMap.#parentOf(x));

        if (TreeMap.#colorOf(sib) == Entry.RED) {
          TreeMap.#setColor(sib, Entry.BLACK);
          TreeMap.#setColor(TreeMap.#parentOf(x), Entry.RED);
          this.#rotateLeft(TreeMap.#parentOf(x));
          sib = TreeMap.#rightOf(TreeMap.#parentOf(x));
        }

        if (
          TreeMap.#colorOf(TreeMap.#leftOf(sib)) == Entry.BLACK &&
          TreeMap.#colorOf(TreeMap.#rightOf(sib)) == Entry.BLACK
        ) {
          TreeMap.#setColor(sib, Entry.RED);
          x = TreeMap.#parentOf(x)!;
        } else {
          if (TreeMap.#colorOf(TreeMap.#rightOf(sib)) == Entry.BLACK) {
            TreeMap.#setColor(TreeMap.#leftOf(sib), Entry.BLACK);
            TreeMap.#setColor(sib, Entry.RED);
            this.#rotateRight(sib);
            sib = TreeMap.#rightOf(TreeMap.#parentOf(x));
          }
          TreeMap.#setColor(sib, TreeMap.#colorOf(TreeMap.#parentOf(x)));
          TreeMap.#setColor(TreeMap.#parentOf(x), Entry.BLACK);
          TreeMap.#setColor(TreeMap.#rightOf(sib), Entry.BLACK);
          this.#rotateLeft(TreeMap.#parentOf(x));
          x = this.#root!;
        }
      } else {
        // symmetric
        let sib = TreeMap.#leftOf(TreeMap.#parentOf(x));

        if (TreeMap.#colorOf(sib) == Entry.RED) {
          TreeMap.#setColor(sib, Entry.BLACK);
          TreeMap.#setColor(TreeMap.#parentOf(x), Entry.RED);
          this.#rotateRight(TreeMap.#parentOf(x));
          sib = TreeMap.#leftOf(TreeMap.#parentOf(x));
        }

        if (
          TreeMap.#colorOf(TreeMap.#rightOf(sib)) == Entry.BLACK &&
          TreeMap.#colorOf(TreeMap.#leftOf(sib)) == Entry.BLACK
        ) {
          TreeMap.#setColor(sib, Entry.RED);
          x = TreeMap.#parentOf(x)!;
        } else {
          if (TreeMap.#colorOf(TreeMap.#leftOf(sib)) == Entry.BLACK) {
            TreeMap.#setColor(TreeMap.#rightOf(sib), Entry.BLACK);
            TreeMap.#setColor(sib, Entry.RED);
            this.#rotateLeft(sib);
            sib = TreeMap.#leftOf(TreeMap.#parentOf(x));
          }
          TreeMap.#setColor(sib, TreeMap.#colorOf(TreeMap.#parentOf(x)));
          TreeMap.#setColor(TreeMap.#parentOf(x), Entry.BLACK);
          TreeMap.#setColor(TreeMap.#leftOf(sib), Entry.BLACK);
          this.#rotateRight(TreeMap.#parentOf(x));
          x = this.#root!;
        }
      }
    }

    TreeMap.#setColor(x, Entry.BLACK);
  }
}
