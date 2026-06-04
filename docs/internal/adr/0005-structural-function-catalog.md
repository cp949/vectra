# ADR 0005: Structural Function Catalog API

상태: 승인

## 배경

`vectra`는 renderer, game engine, physics engine, editor framework가 아니다.
이런 외부 시스템들은 이미 각자의 `Point`, `Vector`, `Rect`, `Circle` 객체를
가지고 있다.

기본 vector/rect object model만 제공하면 렌더러 라이브러리가 이미 가진 기능과
차별화하기 어렵다.

따라서 `vectra`의 가치는 다양한 범위의 geometry/math 함수를 제공하는 넓은 catalog에
있다.

## 결정

`vectra`는 넓은 geometry/math function catalog로 설계한다.

핵심 원칙:

- 입력은 `{ x, y }`, `[x, y]`를 structural input으로 받는다.
- 복합 geometry도 `FiniteLineLike`, `RectLike`, `BoundsLike`, `CircleLike` 같은
  structural shape로 모델링한다.
- object 결과는 새 객체로 반환하지 않고 `Into` 함수가 caller-provided writable
  output에 기록한다.
- scalar/boolean 결과는 직접 반환한다.
- `Into` output은 `XYWritable`처럼 writable structural object를 허용한다.
- 함수는 적은 core가 아니라 넓은 catalog를 지향한다.
- 참고 라이브러리들이 제공하는 geometry 함수들의 합집합을 catalog 목표로 삼고,
  제공하지 않을 함수는 명시적인 제외 이유를 문서화한다.
- package는 side-effect-free로 유지하고 domain barrel import를 1급 사용 경로로 둔다.

예:

```ts
import * as FiniteLinex from "@cp949/vectra/finite-line";

FiniteLinex.closestPointInto(outPoint, seg, pointer);
FiniteLinex.intersectsFiniteLine(a, b);
```

## Type Shape

좌표:

```ts
export interface XYLike {
  readonly x: number;
  readonly y: number;
}

export type XYTuple = readonly [x: number, y: number];
export type XYInput = XYLike | XYTuple;

export interface XYWritable {
  x: number;
  y: number;
}
```

finite-line:

```ts
export type FiniteLineTuple = readonly [a: XYInput, b: XYInput];

export type FiniteLineLike =
  | {
      readonly a: XYInput;
      readonly b: XYInput;
    }
  | FiniteLineTuple;

export interface FiniteLineWritable {
  a: XYWritable;
  b: XYWritable;
}
```

rectangle:

```ts
export interface RectLike {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface RectWritable {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

bounds:

```ts
export type BoundsTuple = readonly [min: XYInput, max: XYInput];

export type BoundsLike =
  | {
      readonly min: XYInput;
      readonly max: XYInput;
    }
  | BoundsTuple;

export interface BoundsWritable {
  min: XYWritable;
  max: XYWritable;
}
```

circle:

```ts
export type CircleTuple = readonly [center: XYInput, radius: number];

export type CircleLike =
  | {
      readonly center: XYInput;
      readonly radius: number;
    }
  | CircleTuple;

export interface CircleWritable {
  center: XYWritable;
  radius: number;
}
```

matrix:

```ts
export interface MatrixLike {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly tx: number;
  readonly ty: number;
}

export interface MatrixWritable {
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
}
```

polyline:

```ts
export type PolylineLike =
  | readonly XYInput[]
  | {
      readonly points: readonly XYInput[];
    };
```

`PolylineLike`처럼 외부 모델이 자주 다른 field 이름을 쓰는 ordered collection은,
`vectra`의 canonical object shape와 외부 모델의 자연스러운 표현을 함께 받는
compatibility union이 될 수 있다.

polygon:

```ts
export interface PolygonLike {
  readonly points: readonly XYInput[];
}
```

## Import 규칙

공식 import는 domain barrel 중심이다.

```ts
import * as FiniteLinex from "@cp949/vectra/finite-line";

FiniteLinex.closestPointInto(out, finiteLine, point);
```

root import는 편의용으로 둘 수 있지만, 문서의 1급 경로는 domain barrel import이다.

각 public function은 domain barrel에서 접근할 수 있게 한다. Source leaf module은 내부 구조로 유지하지만
package leaf subpath는 공개하지 않는다.

```ts
import * as Rectx from "@cp949/vectra/rect";

Rectx.someFunction(out, input);
```

`@cp949/vectra/<domain>`은 re-export 전용 barrel이다. barrel은 구현을 담지 않고, leaf
module은 barrel을 import하지 않는다.

## 상호 참조 규칙

많은 함수를 제공하려면 순환 참조를 피하는 dependency discipline이 필요하다.

규칙:

- 공개 함수끼리 가능한 한 서로 import하지 않는다.
- 공유 계산은 낮은 internal primitive helper로 내린다.
- domain index는 re-export만 한다.
- leaf subpath는 domain index를 거치지 않고 필요한 internal helper만 직접 import한다.
- cross-domain 알고리즘은 억지로 한쪽 domain에 넣지 않고 별도 문제 단위 subpath로
  둘 수 있다.

권장 dependency 방향:

```txt
internal scalar / xy primitive
  -> vec
  -> finite-line / rect / bounds / circle
  -> polyline / polygon
  -> optional cross-domain problem modules
```

## Random 함수

랜덤 함수도 function catalog의 일부로 제공한다.

규칙:

- 모든 geometry random 함수는 `rng?: () => number`를 받는다.
- `rng`는 `[0, 1)` 값을 반환한다고 가정한다.
- 기본값은 `Math.random`이다.
- 재현 가능한 procedural generation을 위해 seedable RNG injection을 지원한다.
- object 결과는 `Into` 함수로 기록한다.
- 문서에는 uniform distribution 여부와 sampling 방법을 명시한다.

예:

```ts
random.pointInCircleInto(out, circle, rng);
random.pointInTriangleInto(out, triangle, rng);
random.pointOnSegmentInto(out, segment, rng);
```

## 결과

- `vectra`의 차별점은 넓은 geometry/math function catalog가 된다.
- 새 object 반환 API가 없으므로 allocation 정책이 명확하다.
- subpath import와 side-effect-free module 구조를 통해 많은 함수를 낮은 결합도로 제공할
  수 있다.
