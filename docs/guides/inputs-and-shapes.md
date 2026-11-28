# Input과 Shape

`vectra`는 필드 구조로 입력을 받는다. 전용 class instance를 요구하지 않는다.

## 점

`Point`는 `{ x, y }` 객체다. 좌표 배열과 typed array는 호출 전에 점 객체로 변환한다.

```ts
import type { Point } from '@cp949/vectra/types';
import * as Vecx from '@cp949/vectra/vec';

const a: Point = { x: 1, y: 2 };
const b: Point = { x: 3, y: 4 };

console.log(Vecx.distance(a, b)); // 2.8284271247461903
```

## 도형

도형은 좌표를 같은 객체에 둔다. 선분은 두 끝점의 성분을, 원은 중심의 성분과 반지름을 담는다.

```ts
import type { Circle, Segment } from '@cp949/vectra/types';
import * as Circlex from '@cp949/vectra/circle';
import * as Segmentx from '@cp949/vectra/segment';

const segment: Segment = { x1: 0, y1: 0, x2: 10, y2: 0 };
const circle: Circle = { cx: 5, cy: 0, r: 3 };

console.log(Segmentx.length(segment)); // 10
console.log(Circlex.containsPoint(circle, { x: 5, y: 1 })); // true
```

## 점 목록

`Polygon`은 닫힌 링의 x, y 좌표를 번갈아 담은 짝수 길이 배열이다. 마지막 점에서 첫 점으로 이어지는 변을 포함한다.
`Polyline`은 순서대로 이어지는 점 객체의 배열이다.

```ts
import type { Polygon, Polyline } from '@cp949/vectra/types';
import * as Polygonx from '@cp949/vectra/polygon';
import * as Polylinex from '@cp949/vectra/polyline';

const polygon: Polygon = [0, 0, 4, 0, 4, 3];
const polyline: Polyline = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 3 }];

console.log(Polygonx.area(polygon)); // 6
console.log(Polylinex.length(polyline)); // 7
```

## Writable output

`*Into` 함수에 쓰기 가능한 도형을 넘긴다. 점 출력에는 `PointWritable`을 사용한다.

```ts
import type { PointWritable } from '@cp949/vectra/types';
import * as Vecx from '@cp949/vectra/vec';

const out: PointWritable = { x: 0, y: 0 };
Vecx.normalizeInto(out, { x: 3, y: 4 });

console.log(out); // { x: 0.6, y: 0.8 }
```
