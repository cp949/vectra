# Input과 Shape

`vectra`는 structural input을 받는다.
전용 class instance를 요구하지 않는다.

## `XYInput`

좌표 입력은 `{ x, y }` object와 readonly `[x, y]` tuple을 받는다.

```ts
import type { XYInput } from '@cp949/vectra/types';
import * as Vecx from '@cp949/vectra/vec';

const objectPoint: XYInput = { x: 1, y: 2 };
const tuplePoint: XYInput = [3, 4];

console.log(Vecx.distance(objectPoint, tuplePoint));
```

`Float32Array`, `number[]` 같은 typed-array / array-like 좌표는 공식 `XYInput`이 아니다.
필요하면 caller가 `{ x, y }` 또는 tuple로 변환한다.

## Shape input

shape는 `XxxLike` 계열 structural input을 받는다.
canonical object shape와 tuple shorthand를 함께 허용하는 domain이 있다.

```ts
import * as Segmentx from '@cp949/vectra/segment';
import * as Circlex from '@cp949/vectra/circle';

const segment = [{ x: 0, y: 0 }, [10, 0]] as const;
const circle = [{ x: 5, y: 0 }, 3] as const;

console.log(Segmentx.length(segment)); // 10
console.log(Circlex.containsPoint(circle, [5, 1])); // true
```

## Writable output

`*Into` output은 `XxxWritable` 계열이다.
tuple output을 쓰려면 readonly tuple이 아니라 mutable tuple이어야 한다.

```ts
import * as Vecx from '@cp949/vectra/vec';

const out: [number, number] = [0, 0];
Vecx.normalizeInto(out, { x: 3, y: 4 });

console.log(out); // [0.6, 0.8]
```
