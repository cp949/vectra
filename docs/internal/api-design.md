# vectra API 설계

이 문서는 `vectra`의 공개 API 스타일을 정의한다.

## 규칙 빠른 참조

규칙 ID는 작업 문서, review, TODO에서 API 설계 원칙을 짧게 부르기 위한 안정적인
참조 이름이다. 새 규칙은 기존 번호의 의미를 바꾸지 않고 뒤에 추가한다.

| ID | 규칙 |
| --- | --- |
| API-001 | 공개 API는 다양한 범위의 geometry/math function catalog이다. |
| API-002 | 새 public API는 예상 call-site sketch로 먼저 검증한다. |
| API-003 | Leaf subpath는 1급 import 경로이고 domain barrel은 re-export만 한다. |
| API-004 | Caller-side 객체 다형성이 있는 object result는 `Into` 함수가 writable output에 기록한다. |
| API-005 | Scalar, boolean, enum result는 직접 반환한다. |
| API-006 | Output 타입 다형성이 없으면 `Into` 없이 직접 반환한다. |
| API-007 | `Into`가 단일 caller-side object를 기록하면 allocating companion `xxx`를 함께 제공한다. |
| API-008 | Collection / multi-output도 `xxxInto`와 `xxx`를 함께 제공한다. |
| API-009 | 좌표 입력은 `XYInput`을 사용한다. 숫자 나열 overload는 public input에 포함하지 않는다. |
| API-010 | Shape 입력은 `XxxLike`, output은 `XxxWritable`을 사용한다. |
| API-011 | Public 함수끼리 직접 import하지 않는다. Companion `xxx` → `xxxInto` leaf import는 예외. |
| API-012 | Catalog 기본값은 "제공한다". 제외에는 명시적인 이유가 필요하다. |
| API-013 | 같은 계산이 둘 이상의 domain에서 자연스러우면 cross-domain equivalent를 허용한다. |
| API-014 | 각도는 radian을 기본 단위로 사용한다. |
| API-015 | Random 함수는 `rng?: () => number`를 받고 object 결과는 `Into`로 기록한다. |

## API-001: 기본 방향

공개 API는 다양한 범위의 geometry/math function catalog이다.

`vectra`는 프로젝트마다 반복해서 직접 구현하기 성가신 geometry/math helper를 폭넓게
제공한다.

공식 사용 패턴은 domain barrel import이다.

```ts
import * as Segmentx from "@cp949/vectra/segment";

Segmentx.closestPointInto(out, segment, point);
```

root import는 편의용으로만 둔다.

## API-002: 설계 방법

새 public API는 예상 call-site sketch로 먼저 검증한다.

타입 정의만 보고 결정하지 않는다. 사용자가 실제로 쓰게 될 코드 모양으로 검증한다.

### Sketch 항목

- plain object 사용
- mutable tuple 사용
- 외부 class instance 사용
- 배열/collection 처리
- `out`과 input이 같은 객체인 aliasing 처리
- subpath import와 domain barrel import

### Sketch에서 확인할 것

- `Into` 함수가 caller-provided output을 그대로 반환하는가?
- 반환 타입이 `XYWritable` 같은 넓은 union으로 뭉개지지 않고 구체 타입을 보존하는가?
- collection method(`map`, `filter`, `reduce`) 안에서 자연스럽게 쓸 수 있는가?
- 외부 object의 method chaining을 깨지 않는가?
- structural input/output 정책이 제품 경계와 맞는가?

예:

```ts
writeXY(point, 100, 100);
writeXY(tuple, 100, 100);
writeXY(new Point(0, 0), 100, 100).translateX(10);

points.map((point) => writeXY(point, 100, 100));
sprites.map((sprite) => Rectx.centerInto(sprite.position, bounds));

const out = Segmentx.closestPointInto(pointer, line, pointer);
```

## API-003: Import / Module 규칙

Package import는 root/domain barrel만 공개한다. Source leaf module은 유지하지만 package leaf subpath는 공개하지 않는다.

```ts
import * as Rectx from "@cp949/vectra/rect";

Rectx.someFunction(out, input);
```

- domain barrel은 구현을 담지 않는다.
- leaf module은 domain barrel을 import하지 않는다.
- 파일명은 kebab-case, export 함수명은 camelCase를 기본으로 한다.

## API-004: Caller-side object result → `Into`

Caller-side마다 다르게 제공할 가능성이 있는 객체 결과는 `Into` 함수가 caller-provided writable
output에 기록한다.

판단 기준은 반환값이 object인지가 아니라 **caller가 output storage를 선택할 수 있는가**이다.
좌표, shape, bounds처럼 caller가 tuple, plain object, 외부 renderer object, class instance를
output으로 넘길 수 있으면 `Into` 대상이다. 반대로 결과 shape가 library-defined plain result로
고정되어 caller-side object 다형성이 없으면 API-006에 따라 직접 반환한다.

```ts
vec.addInto(out, a, b);
segment.closestPointInto(out, line, point);
bounds.fromPointsInto(out, points);
```

`Into` 함수는 output의 구체 타입을 보존한다.

```ts
function centerInto<Out extends XYWritable>(out: Out, input: ShapeLike): Out;
function copyInto<Out extends CircleWritable<XYWritable>>(out: Out, circle: CircleLike): Out;
```

`centerInto([0, 0], shape)`는 mutable tuple을 반환하고,
`centerInto(new Point(0, 0), shape)`는 `Point`를 반환한다.

### 좌표 output 세부 정책

- `XYInput` tuple은 readonly tuple을 허용한다.
- `XYWritable` tuple은 mutable tuple만 허용한다.
- `writeXY`는 배열이면 `[0]`, `[1]`에 기록하고, 배열이 아니면 `x`, `y`에 기록한다.
- 배열과 `x`, `y` field를 동시에 가진 hybrid value는 배열 storage를 우선한다.
- `XYObjectWritable`에서 배열을 배제하기 위한 `length?: never` 같은 타입 장치는 두지 않는다.
- 상세 결정은 [ADR 0006](./adr/0006-xy-writable-output-policy.md)을 따른다.

## API-005: Scalar / boolean / enum → 직접 반환

Scalar, boolean, enum result는 직접 반환한다.

```ts
vec.length(input);
vec.dot(a, b);
intersects.intersectsSegmentSegment(a, b);
polygon.area(points);
```

## API-006: Output 다형성 없으면 직접 반환

Output 타입 다형성이 없으면 `Into` 없이 직접 반환한다.

`Into`는 caller가 output storage 타입을 선택할 수 있을 때 가치가 있다. Caller가 다른
타입을 쓸 여지가 없으면 `Into`를 제공하지 않는다.

```ts
// number[] — caller가 다른 타입을 쓸 여지 없음 → 직접 반환
solveQuadratic(a, b, c): number[]
solveCubic(a, b, c, d): number[]

// fixed plain result object — caller-side object 다형성 없음 → 직접 반환
segmentSegmentDetail(a, b, epsilon?): SegmentSegmentDetail

// XYWritable — tuple / object / external class 모두 가능 → Into 제공
closestPointInto(out: XYWritable, ...): Out
```

## API-007: 단일 object `Into` → companion 제공

`Into`가 단일 caller-side object를 기록하면 allocating companion `xxx`를 함께 제공한다.

판단 기준: `xxxInto`의 반환 타입 이름이 아니라 **caller-provided output에 단일 object를
기록하는가** 여부. 여기서 object는 API-004의 caller-side object 다형성이 있는 output을
뜻한다. Fixed plain result object는 `Into`/companion 대상이 아니라 API-006 직접 반환 대상이다.
`xxxInto`가 `boolean`을 반환하더라도 caller-provided output에 단일 object를 기록하면 companion
대상이다.

### 시그니처 패턴

```txt
xxxInto(out, ...): Out      →  xxx(...): PlainObject
xxxInto(out, ...): boolean  →  xxx(...): PlainObject | undefined
```

```ts
const sum = vec.add(a, b);                                  // { x, y } 새 object 반환
vec.addInto(out, a, b);                                     // caller-provided output에 기록

const closest = polygon.closestPoint(polygon, query);       // 실패하면 undefined
const ok = polygon.closestPointInto(out, polygon, query);   // 성공하면 out에 기록하고 true
```

companion 반환값은 plain structural object. `vectra` 전용 instance 아님.

### 구현 규칙

- `Into` 함수가 계산 source of truth.
- companion은 seed output을 만들고 대응 `xxxInto(seed, ...)`를 호출한다.
- boolean-primary: `xxxInto`가 `false`를 반환하면 companion은 `undefined`를 반환한다.
- companion leaf module은 같은 domain의 대응 `xxx-into` leaf module을 직접 import할 수 있다.
- domain barrel import는 금지한다.
- 새 public caller-side object-output 함수는 `Into`와 companion을 같은 작업 범위에서 함께
  설계한다. 보류할 경우 API surface 문서에 이유를 남긴다.

## API-008: Collection / multi-output → `Into` + companion

Collection / multi-output도 `xxxInto`와 `xxx`를 함께 제공한다.

- `xxxInto`는 caller-provided output을 재사용한다. 성능 최적화가 필요한 caller는 `xxxInto`를 사용한다.
- `xxx`는 plain structural collection 또는 해당 interop container를 새로 만들어 반환한다. 편의성이 필요한 caller는 allocating companion `xxx`를 사용한다.
- buffer / typed-array도 companion 제공 대상이다.

```ts
// Into: caller-provided output 재사용
cornersInto(out, rect);
sidesInto(out, polygon);
intersectionsInto(out, polyline, other);

// companion: 새 collection 반환
const pts = corners(rect);
const segs = sides(polygon);
const hits = intersections(polyline, other);
```

판단 기준은 API-007과 같다. collection / multi-output도 companion을 기본으로 제공한다.
catalog 기본값("제공한다", API-012)은 collection output에도 동일하게 적용된다.

## API-009: 좌표 입력 (`XYInput`)

좌표 입력은 `XYInput`을 사용한다. 숫자 나열 overload는 public input에 포함하지 않는다.

```ts
export interface XYLike {
  readonly x: number;
  readonly y: number;
}

export type XYTuple = readonly [x: number, y: number];
export type XYInput = XYLike | XYTuple;

export interface XYObjectWritable {
  x: number;
  y: number;
}

export type XYTupleWritable = [x: number, y: number];
export type XYWritable = XYObjectWritable | XYTupleWritable;
```

```txt
public input:   { x, y }  /  [x, y]
not public:     addInto(out, ax, ay, bx, by)
```

## API-010: Shape 입력 (`XxxLike` / `XxxWritable`)

Shape 입력은 `XxxLike`, output은 `XxxWritable`을 사용한다.

입력은 넓게 받는다. 값은 `vectra` 타입별 structural contract와 맞아야 한다.

`XxxLike`: read-only structural union (input). `XxxWritable`: caller-provided output 타입.
일부 shape는 canonical object와 의미가 같은 tuple shorthand도 허용한다.

아래는 Segment를 대표 패턴으로 보여준다. 다른 shape(Rect, Bounds, Circle, Matrix 등)도
같은 패턴을 따른다.

```ts
export type SegmentTuple = readonly [a: XYInput, b: XYInput];

export type SegmentLike =
  | {
      readonly a: XYInput;
      readonly b: XYInput;
    }
  | SegmentTuple;

export interface SegmentWritable<
  A extends XYWritable = XYObjectWritable,
  B extends XYWritable = XYObjectWritable,
> {
  a: A;
  b: B;
}
```

ordered point list(`PolylineLike`, `PolygonLike`)는 `{ points }` canonical object와 bare
point array를 모두 허용한다.

```ts
export type PolylineLike =
  | readonly XYInput[]
  | {
      readonly points: readonly XYInput[];
    };

export type PolygonLike =
  | readonly XYInput[]
  | {
      readonly points: readonly XYInput[];
    };
```

```ts
closestPointInto(out, { points }, query);
closestPointInto(out, points, query);
closestPointInto(out, stroke.vertices, query);
closestPointInto(out, path.anchors, query);
polygon.area(points);
polygon.containsPoint(shape.vertices, query);
```

`PolygonLike`에서 bare point array는 단일 닫힌 outer ring shorthand로 해석된다. 3점 미만은
structural empty polygon으로 유지한다.

## API-011: Public 함수 상호 참조 금지

Public 함수끼리 직접 import하지 않는다. Companion `xxx` → `xxxInto` leaf import는 예외.

공유 계산은 낮은 internal helper로 내린다.

```txt
internal scalar / xy primitive
  → vec
  → segment / rect / bounds / circle
  → polyline / polygon
```

`src/segment/closest-point-into.ts`가 `src/segment/index.ts`를 import하는 식의 public barrel 의존은
금지한다.

### 예외와 전환 기준

다음 패턴은 기존 surface에 남아 있는 허용 예외다. 새 public leaf는 예외를 추가하지 말고 internal
helper를 먼저 검토한다.

- companion `xxx`가 대응 `xxxInto` leaf를 import하는 경우.
- cross-type companion이 seed output 생성을 위해 다른 domain의 `createX` factory를 import하는 경우.
- API-013 cross-domain equivalent를 유지하기 위한 기존 public leaf import. 새 equivalent는 shared
  internal helper를 먼저 만들고 양쪽 public leaf를 wrapper로 둔다.

이 예외들은 구조 debt다. `pnpm import-boundary:check`는
`scripts/fixtures/public-import-boundary-baseline.json` snapshot과 실제 public leaf import 목록이 달라지면
실패한다. 정당한 예외 추가는 `pnpm import-boundary:update`로 snapshot을 갱신하고 review한다.

## API-012: Catalog 기본값 "제공한다"

Catalog 기본값은 "제공한다". 제외에는 명시적인 이유가 필요하다.

참고 라이브러리들이 제공하는 geometry 함수들의 합집합을 catalog 목표로 삼는다. 함수는
문제 단위 subpath로 나눈다.

```txt
@cp949/vectra/vec
@cp949/vectra/segment
@cp949/vectra/rect
@cp949/vectra/bounds
@cp949/vectra/circle
@cp949/vectra/polyline
@cp949/vectra/polygon
@cp949/vectra/random
```

### Catalog scope 분류

```txt
include       = vectra catalog에 제공할 목표
adapter-only  = core가 아니라 특정 framework/SVG/DOM adapter에 둔다
exclude       = vectra가 의도적으로 제공하지 않을 기능
```

`adapter-only`는 외부 format/protocol/framework object와 `vectra` structural data 사이의
입출력 변환으로만 의미가 있는 기능이다. adapter는 DOM, renderer, editor state, document
model을 소유하거나 mutate하지 않는다.

`exclude`는 geometry 계산이 아니거나, 특정 framework object model에 묶였거나, side effect가
핵심이거나, structural `Like` input과 `Into` output으로 옮기면 의미가 깨지는 경우에만 사용한다.

## API-013: Cross-domain equivalent 허용

같은 계산이 둘 이상의 domain에서 자연스러우면 cross-domain equivalent를 허용한다.

이는 구현 중복이 아니라 discovery surface다.

```ts
vec.lerpInto(out, a, b, t);
interpolation.lerpPointInto(out, a, b, t);
```

같은 domain 안에서 이름만 다른 동등 함수는 허용하지 않는다. `alias`, `compatibility`,
`discoverability` 같은 명칭으로 same-domain 중복을 정당화하지 않는다.

### 허용 기준

- 같은 계산이 둘 이상의 domain에서 core vocabulary로 자연스럽다.
- 각 함수의 이름이 caller의 domain mental model과 맞는다.
- 정책이 완전히 같거나 차이가 문서에 명확히 드러난다.
- 구현은 shared internal helper로 내리고 public leaf는 얇은 wrapper로 둔다.
- 각 domain 문서에 owner/alias/cross-reference를 남긴다.

### 금지 기준

- 같은 domain 안에서 이름만 다른 동등 함수다.
- 이름만 다르고 clamp, epsilon, boundary, failure 정책이 미묘하게 다르다.
- light domain equivalent가 heavy dependency를 끌어들인다.
- 같은 구현을 복사해 정책 drift 가능성을 만든다.
- 한쪽 domain에서만 유지보수되어 다른쪽 alias가 stale해질 가능성이 크다.

중복을 없애는 것보다 정책 불일치와 구현 복제를 막는 것이 더 중요하다.

## API-014: 각도는 radian

각도는 radian을 기본 단위로 사용한다.

```ts
degToRad(90);
radToDeg(Math.PI / 2);
```

## API-015: Random 함수 rng 정책

Random 함수는 `rng?: () => number`를 받고 object 결과는 `Into`로 기록한다.

- `rng`는 `[0, 1)` 값을 반환한다고 가정한다.
- `rng` 없으면 `globalThis.crypto.getRandomValues`를 우선 사용하고, 불가하면 `Math.random`으로
  fallback한다.
- `Math.random` fallback은 암호학적으로 안전하지 않다. 보안/금전/공정성 critical draw에는
  사용하지 않는다.
- integer sampling에서 modulo bias를 피해야 한다. crypto-backed path는 `Uint32Array`와
  rejection sampling을 사용한다.
- `createRng(seed)` factory는 caller가 소유할 `RandomSource`를 생성한다. `vectra`는 전역
  random state를 관리하지 않는다.
- 문서에는 half-open/inclusive boundary, uniform distribution 여부, sampling 방법을 명시한다.
- scalar result는 직접 반환한다.

```ts
random.float(0, 10, rng);
random.int(0, 10, rng);
random.angle(rng);
random.pointInCircleInto(out, circle, rng);
random.pointInTriangleInto(out, a, b, c, rng);
random.pointOnSegmentInto(out, segment, rng);
```

### Catalog 계층

```txt
simple random data    = random, float, int, sign, angle
selection/permutation = choice, pick, shuffle, permutation, weighted choice
distributions         = uniform, normal, exponential, triangular, poisson 등
geometry sampling     = pointOnSegmentInto, pointInRectInto, pointInCircleInto 등
generator boundary    = createRng(seed), rng state export/import 후보
```
