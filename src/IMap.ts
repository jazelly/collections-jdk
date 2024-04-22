import { JObject } from "./Object";

export interface IMap<K extends JObject, V extends JObject> extends JObject {
    size: () => number;
    isEmpty: () => boolean;
    containsKey: (key: K) => boolean;
    containsValue?: (value: V) => boolean;
    get: (key: JObject) => V | null;
    put: (key: K, value: V) => V;
    remove: (key: K) => V;
    putAll: (m: IMap<K, V>) => void;
}

export interface IEntry<K extends JObject, V extends JObject> extends JObject {
    getKey(): K;
    getValue(): V;
    setValue(value: V): V;
}