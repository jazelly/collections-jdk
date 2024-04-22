import { TreeMap } from '../../src/TreeMap.js';
import { assertEqual } from '../utils.js';

// @ts-expect-error no type provided
const tmapError = new TreeMap();
const tmap = new TreeMap<number, number>();

// TODO: dynamic type for getFirstEntry
tmap.put(10, 3);
tmap.put(19, 3);
assertEqual(tmap.getFirstEntry()!.key, 10);
assertEqual(tmap.getLastEntry()!.key, 19);
tmap.put(11, 3);
tmap.put(12, 3);
assertEqual(tmap.getFirstEntry()!.key, 10);
assertEqual(tmap.getLastEntry()!.key, 19);
tmap.put(14, 3);
tmap.put(15, 3);
assertEqual(tmap.getFirstEntry()!.key, 10);
assertEqual(tmap.getLastEntry()!.key, 19);
tmap.put(17, 3);
tmap.put(20, 3);
assertEqual(tmap.getFirstEntry()!.key, 10);
assertEqual(tmap.getLastEntry()!.key, 20);
tmap.remove(20);
tmap.put(3, 3);
tmap.put(19, 0);
assertEqual(tmap.getFirstEntry()!.key, 3);
assertEqual(tmap.getLastEntry()!.value, 0);

console.log('treemap ok');