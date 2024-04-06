## Welcome

collections-jdk is a project inspired by JDK Collections.

## Example Usage
```
npm install collections-jdk
```

```
import { PriorityQueue } from 'collections-jdk';

const pq0 = new PriorityQueue(); // not ok - didn't specify element type
const pq2 = new PriorityQueue({from: [3, 4, 5]}) // not ok - didn't specify element type
const pq3 = new PriorityQueue<number>(); // ok - number is comparable
const pq4 = new PriorityQueue<{ id: number }>() // not ok - object is not comparable, need to specify comparator
const pq5 = new PriorityQueue<{ id: number }>({ comparator: (a, b) => {
  return a.id - b.id;
}}) // ok
const pq6 = new PriorityQueue({ from: [1, 2, 3] as number[] }) // ok
const pq6 = new PriorityQueue({ from: [{ id: 1 }] as Record<string, number>[] }) // not ok - object is not comparable


pq5.add({ id: 3});
pq5.peek(); // { id: 3 }
pq5.add({ id: 4});
pq5.peek(); // { id: 4 }
pq5.add({ id: 5});
pq5.peek(); // { id: 5 }
pq5.pop();
pq5.pop();
pq5.peek(); // { id: 3 }
```


## Why choose this repo

Well, mainly 2 reasons.

1. `collections-jdk` is strictly type-scripted. 
For TS users, `collections-jdk` guarantees 100% fast fail with wrong data types
2. collections-jdk is designed to be analogous to Java Collections. Most implementations in JDK Collections will be rebuilt here


## FAQ

<div align="left">
  <p style="line-height: 1.6;">
    Q: What runtime does collections-ts support?<br>
    A: We aim to support all common runtime of js, node.js, deno, bun, broswer etc.
  </p>
</div>

<div align="left">
  <p style="line-height: 1.6;">
    Q: Can JS users use this?<br>
    A: Yes! collections-jdk aim to support JS users, but it's highly recommended to use this package with TS files
  </p>
</div>


## All kinds of contribution are welcome

Pull request, bugs/issues, or next Data Structure to implement. You decide.
