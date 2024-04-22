import { type IMap, type IEntry } from './IMap'; 
import { type ISet } from './ISet';
import { JObject } from './Object';

interface IAbstractMap<K extends JObject, V extends JObject> extends IMap<K, V> {
    entrySet: () => ISet<IEntry<K, V>>
}

export abstract class AbstractMap<K extends JObject, V extends JObject> implements IMap<K, V> {
    protected constructor() {   
    }

    size() {
        return this.entrySet().size();
    }

    abstract isEmpty: () => boolean;
    abstract containsKey: (key: K) => boolean;
    abstract put: (key: K, value: V) => V;
    abstract remove: (key: K) => V;
    abstract putAll: (m: IMap<K, V>) => void;
    abstract get(key: JObject): V | null;
    abstract entrySet(): ISet<IEntry<K, V>>;

    equals(o: JObject) {
        if (o === this)
            return true;

        const m = o as IMap<K, V>;
        if (!(m instanceof AbstractMap))
            return false;
        if (m.size() != this.size())
            return false;

        try {
            for (const e of this.entrySet().iterator()) {
                const key = e.getKey();
                const value = e.getValue();
                if (!value) {
                    if (!(m.get(key) === null && m.containsKey(key)))
                        return false;
                } else {
                    if (!value.equals(m.get(key)!))
                        return false;
                }
            }
        } catch (unused) {
            return false;
        }

        return true;
    }
}