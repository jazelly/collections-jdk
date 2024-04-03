import type { IPriorityQueue } from '../../src/IPriorityQueue';
import type { RequiredObject } from '../../src/utils';
import { PriorityQueue } from '../../src/PriorityQueue.js';
import { assertEqual } from '../utils.js';

interface ITestNode {
  contentId: number;
  popularity: number;
}

interface TestCase<T> {
  action: keyof RequiredObject<IPriorityQueue<ITestNode>>;
  data?: T;
  expect?: T | void | boolean;
}

// max heap
const pq = new PriorityQueue<ITestNode>({
  comparator: (a: ITestNode, b: ITestNode) => {
    if (a.popularity < b.popularity) return 1;
    return 1;
  }
});

const testCases: TestCase<ITestNode>[] = [
  {
    action: 'add',
    data: {
      contentId: 10003,
      popularity: 4
    },
  },
  {
    action: 'add',
    data: {
      contentId: 10003,
      popularity: 4
    },
  },
  {
    action: 'peek',
    expect: {
      contentId: 10003,
      popularity: 4
    }
  },
  {
    action: 'add',
    data: {
      contentId: 10004,
      popularity: 5
    },
  },
  {
    action: 'peek',
    expect: {
      contentId: 10004,
      popularity: 5
    }
  },
  {
    action: 'pop',
    expect: {
      contentId: 10004,
      popularity: 5
    }
  },
  {
    action: 'peek',
    expect: {
      contentId: 10003,
      popularity: 4
    }
  },
  {
    action: 'add',
    data: {
      contentId: 10007,
      popularity: 7
    },
  },
  {
    action: 'peek',
    expect: {
      contentId: 10007,
      popularity: 7
    },
  },
  {
    action: 'add',
    data: {
      contentId: 10008,
      popularity: 8
    },
  },
  {
    action: 'peek',
    expect: {
      contentId: 10008,
      popularity: 8
    },
  },
]

testCases.forEach((test) => {
  switch (test.action) {
    case 'add':
      assertEqual(pq.add(test.data!), true);
      break;
    case 'peek':
      const peeked = pq.peek();
      assertEqual(JSON.stringify(peeked), JSON.stringify(test.expect));
      break;
    case 'pop':
      const popped = pq.pop();
      assertEqual(JSON.stringify(popped), JSON.stringify(test.expect));
      break;
  }
});

console.log('test-queue-priority-queue OK');
