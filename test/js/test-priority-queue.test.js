import { PriorityQueue } from '../../src/PriorityQueue.js';
import { assertEqual } from '../utils.js';

const pq = new PriorityQueue();

// must be max heap by default
pq.add(3);
pq.add(5);
assertEqual(pq.peek(), 5);
pq.add(8);
pq.add(5);
assertEqual(pq.peek(), 8);
pq.pop();
assertEqual(pq.peek(), 5);
pq.pop();
assertEqual(pq.peek(), 5);
pq.pop();
assertEqual(pq.peek(), 3);
