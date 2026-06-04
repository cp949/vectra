# @cp949/vectra

TypeScript geometry/math function catalog.

`vectra`는 renderer, DOM, scene graph, editor state를 소유하지 않는다.
좌표와 shape data를 받아 geometry/math 결과를 계산한다.

이 README는 npm package 페이지와 package tarball 안에서 읽히는 문서다.
repository 전체 구조와 내부 운영 문서는 root README와 `docs/`를 본다.

## 설치

```sh
npm install @cp949/vectra
```

## 지원 범위

| 항목 | 기준 |
| --- | --- |
| Runtime | Node.js `>=20.19.0`에서 검증 |
| Module format | ESM only |
| Dependencies | runtime dependency 없음 |
| Package metadata | `sideEffects: false` |
| Import | root, `types`, domain subpath export |
| Coordinates | `{ x, y }` object 또는 readonly `[x, y]` tuple |

`Float32Array` 같은 typed-array / array-like 좌표는 공식 `XYInput`이 아니다.
필요하면 caller가 `{ x, y }` 또는 `[x, y]`로 변환한다.

## 빠른 시작

```ts
import * as Vecx from '@cp949/vectra/vec';
import * as Segmentx from '@cp949/vectra/segment';

const a = { x: 0, y: 0 };
const b = [3, 4] as const;

const sum = Vecx.add(a, b);
const length = Segmentx.length([a, b]);

console.log(sum); // { x: 3, y: 4 }
console.log(length); // 5
```

## Import

권장 기본값은 domain barrel import다.

```ts
import * as Vecx from '@cp949/vectra/vec';
import * as Circlex from '@cp949/vectra/circle';
import * as Intersectx from '@cp949/vectra/intersects';
```

root import는 package-level metadata 같은 편의 export용이다.

```ts
import { VECTRA_PACKAGE_NAME } from '@cp949/vectra';

console.log(VECTRA_PACKAGE_NAME); // '@cp949/vectra'
```

leaf module import는 package exports에서 막는다.
공개 import는 package root, `types`, domain subpath만 사용한다.

## Output

object 결과는 allocating companion 또는 `*Into`로 얻는다.

```ts
import * as Vecx from '@cp949/vectra/vec';

const allocated = Vecx.add({ x: 1, y: 2 }, [3, 4]);

const out = { x: 0, y: 0 };
const returned = Vecx.addInto(out, { x: 1, y: 2 }, [3, 4]);

console.log(allocated); // { x: 4, y: 6 }
console.log(out); // { x: 4, y: 6 }
console.log(returned === out); // true
```

`*Into` 함수는 caller-owned output object를 수정하고 같은 object를 반환한다.
allocating companion은 새 object를 만든다.

## Input

좌표 입력은 `{ x, y }` object와 readonly tuple을 모두 받는다.

```ts
import type { XYInput } from '@cp949/vectra/types';
import * as Vecx from '@cp949/vectra/vec';

const a: XYInput = { x: 1, y: 2 };
const b: XYInput = [3, 4];

console.log(Vecx.distance(a, b));
```

typed-array, mutable number array, array-like object는 공식 좌표 input이 아니다.
외부 format은 caller가 `{ x, y }` 또는 readonly tuple로 변환한다.

## Degenerate geometry

`vectra`는 throw-heavy geometry API가 아니다.
계산 결과가 존재하지 않는 geometry case는 함수별 sentinel을 반환한다.

```ts
import * as Trianglex from '@cp949/vectra/triangle';

const lineTriangle = {
  a: { x: 0, y: 0 },
  b: { x: 1, y: 1 },
  c: { x: 2, y: 2 },
};

console.log(Trianglex.circumcenter(lineTriangle)); // undefined
```

정확한 sentinel은 각 함수 JSDoc을 기준으로 한다.
예외보다 `undefined`, empty result, clamped value 같은 함수별 sentinel을 우선한다.

## Domain

주요 domain:

- `vec`: 2D vector arithmetic
- `segment`: finite line segment
- `rect`, `bounds`, `circle`, `ellipse`, `triangle`: primitive shape
- `matrix`, `pose2`: 2D transform
- `polyline`, `polygon`, `path`, `curve`: path/curve 계산
- `intersects`: cross-shape relation
- `angle`, `interpolation`, `easing`, `random`: math helper
- `adapter`, `svg-path`: 외부 format 변환
- `editor-geometry`: editor-oriented pure geometry

각 domain은 `@cp949/vectra/<domain>` 형태의 subpath로 import한다.

## 제품 경계

`vectra`가 하는 일:

- structural geometry/math 계산
- caller-owned output 기록
- format과 structural data 사이의 얇은 adapter

`vectra`가 하지 않는 일:

- rendering
- DOM mutation
- scene graph
- editor state/history/selection
- physics engine
- animation/tween engine

## Package files

npm package에는 다음 파일이 포함된다.

- `dist`: ESM build output과 `.d.ts`
- `README.md`: package 사용 문서
- `LICENSE`: MIT license
- `llm.txt`: LLM용 package summary
