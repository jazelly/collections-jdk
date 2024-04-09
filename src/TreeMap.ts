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

    constructor (key: K, value: V, parent: Entry<K, V> | undefined) {
        this.key = key;
        this.value = value;
        this.parent = parent;
    }

    equals(other: Entry<K, V>): boolean {
        return other instanceof Entry && this.key === other.key && this.value === other.value;
    }
}

export class TreeMap<K, V> {
    #comparator: Comparator<K>;
    #root: Entry<K, V> | undefined;
    #size: number = 0;
    #modCount: number = 0;

    constructor(...params: K extends Comparable ? [Comparator<K>?] : [Comparator<K>]) {
        const comparator = params[0];
        this.#comparator = comparator ?? ((a: K, b: K) => {
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
            const cmp  = cpr(k, p.key);
            if (cmp > 0) {
                p = p.right;
            } else if (cmp < 0) {
                p = p.left
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

    #addEntry(key: K, value: V, parent: Entry<K, V>, addToLeft: boolean) {
        const e = new Entry<K, V>(key, value, parent);
        if (addToLeft)
            parent.left = e;
        else
            parent.right = e;
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
            if (cmp < 0)
                t = t.left;
            else if (cmp > 0)
                t = t.right;
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

    /**
     * rb-tree specific methods
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
            if (r?.left) 
                r.left.parent = p;
            r!.parent = p.parent;
            if (!p.parent)
                this.#root = r;
            else if (p.parent.left === p)
                p.parent.left = r;
            else
                p.parent.right = r;
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
            if (l!.right) 
                l!.right.parent = p;
            l!.parent = p.parent;
            if (!p.parent)
                this.#root = l;
            else if (p.parent.right === p)
                p.parent.right = l;
            else
                p.parent.left = l;
            l!.right = p;
            p.parent = l;
        }
    }


    #fixAfterInsertion(x: Entry<K, V>) {
        x.color = Entry.RED;

        while(x && x !== this.#root && x.parent!.color === Entry.RED) {
            if (TreeMap.#parentOf(x) === TreeMap.#leftOf(TreeMap.#parentOf(TreeMap.#parentOf(x)))) { // parent comes from left branch
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
            } else { // parent comes from right branch
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

}