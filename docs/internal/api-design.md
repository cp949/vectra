# vectra API 설계

이 문서는 `vectra`의 공개 API 스타일을 정의한다. 좌표와 도형의 입출력은 [ADR 0010](./adr/0010-flat-shape-input.md)의 v2 규격을 따른다.

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
| API-009 | 좌표 입력은 `Point`를 사용한다. |
| API-010 | Shape 입력과 출력은 ADR 0010의 고정된 형식을 따른다. |
| API-011 | Public 함수끼리 직접 import하지 않는다. Companion `xxx` → `xxxInto` leaf import는 예외. |
| API-012 | Catalog 기본값은 "제공한다". 제외에는 명시적인 이유가 필요하다. |
| API-013 | 같은 계산이 둘 이상의 domain에서 자연스러우면 cross-domain equivalent를 허용한다. |
| API-014 | 각도는 radian을 기본 단위로 사용한다. |
| API-015 | Random 함수는 `rng?: () => number`를 받고 object 결과는 `Into`로 기록한다. |
| API-016 | 입력 전체 스캔이 호출 비용을 지배하는 조회는 사전 계산 입력을 받는 별도 함수로 제공한다. |
| API-017 | ray 교점 거리 조회는 `t`를 직접 반환하고, 교점이 없으면 `Infinity`를 반환한다. |

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
- 외부 class instance 사용
- 배열/collection 처리
- `out`과 input이 같은 객체인 aliasing 처리
- subpath import와 domain barrel import

### Sketch에서 확인할 것

- `Into` 함수가 caller-provided output을 그대로 반환하는가?
- 반환 타입이 전달한 output의 구체 타입을 보존하는가?
- collection method(`map`, `filter`, `reduce`) 안에서 자연스럽게 쓸 수 있는가?
- 외부 object의 method chaining을 깨지 않는가?
- structural input/output 정책이 제품 경계와 맞는가?

예:

```ts
sprites.map((sprite) => Rectx.centerInto(sprite.position, bounds));

const out = Segmentx.closestPointInto(pointer, segment, pointer);
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
좌표, shape, bounds처럼 caller가 plain object, 외부 renderer object, class instance를
output으로 넘길 수 있으면 `Into` 대상이다. 반대로 결과 shape가 library-defined plain result로
고정되어 caller-side object 다형성이 없으면 API-006에 따라 직접 반환한다.

```ts
vec.addInto(out, a, b);
segment.closestPointInto(out, line, point);
bounds.fromPointsInto(out, points);
```

`Into` 함수는 output의 구체 타입을 보존한다.

```ts
function centerInto<Out extends PointWritable>(out: Out, rect: Rect): Out;
function copyInto<Out extends CircleWritable>(out: Out, circle: Circle): Out;
```

### 좌표 output 세부 정책

좌표 출력 형식은 [ADR 0010의 출력 규칙](./adr/0010-flat-shape-input.md#출력)을 따른다.

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

// PointWritable을 충족하는 호출자 객체에 기록한다.
closestPointInto<Out extends PointWritable>(out: Out, segment: Segment, point: Point): Out
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

### Point 배열 출력: clear 후 push가 기본이다

point 배열을 `out`으로 받는 collection `xxxInto`는 `out.length = 0` 뒤 새 point object를 push한다.

- 대상: point 배열을 반환하는 `*PointsInto`, `rect/perimeterPointsInto`, curve의 `*PolylineInto` 등.
- 결과 길이는 입력으로 정해진다. 호출 전 `out`의 길이와 내용은 결과에 영향을 주지 않는다.
- 새 object를 만든다. caller가 쥐고 있던 이전 원소를 수정하지 않는다.
- Polyline의 `transformPointsInto`는 입력과 `out`이 같은 배열이어도 안전하다.
- 대가로 호출마다 point object를 할당한다.
- 출력 배열의 원소 타입을 제네릭으로 열지 않는다. 함수가 만드는 값이 곧 원소 타입이다. 예: `PointWritable[]`, `PathCommand[]`, `IntersectionHit[]`.
- 이유: `Out extends MoveCommand[]`처럼 좁은 원소 타입을 받으면 반환 타입이 실제로 push한 command와 달라진다.

예외는 기존 원소를 재사용하는 함수다. 호출 전 `out`의 내용이 결과에 영향을 준다.

| 함수                                                               | `out.length`가 짧을 때          | `out.length`가 길 때 |
| ------------------------------------------------------------------ | ------------------------------- | -------------------- |
| `matrix/transformPointsInto`                                       | `RangeError`. `out`은 수정 안 함 | 초과 항목을 수정 안 함 |
| `adapter/flat/decodeFlatCoordsInto`, `adapter/flat/fromFloat32ArrayInto` | 새 object를 할당해 채운다 | 초과 항목을 수정 안 함 |

- 공통: `out[i]`가 있으면 `x`, `y`만 덮어쓴다. `out`의 길이를 줄이지 않는다.
- `matrix/transformPointsInto`: `out[i]`는 writable point 객체다. 호출 전에 caller가 준비한다.
- `matrix/transformPointsInto`: 같은 index의 입력을 먼저 읽고 기록하므로 `out[i] === points[i]` aliasing만 안전하다.
- `adapter/flat`의 두 함수: `out[i]`는 `PointWritable`이어야 한다.
- `matrix/transformPointsInto`는 point object를 할당하지 않는다. `adapter/flat`의 두 함수는 `out`이 짧을 때만 할당한다.

새 collection `Into`는 clear 후 push를 따른다. 호출 전 `out`을 재사용하는 buffer로 쓰게 해야 하는 경우에만 원소 재사용을 쓴다.

## API-009: 좌표 입력 (`Point`)

좌표 입력과 출력은 [ADR 0010](./adr/0010-flat-shape-input.md)의 `{ x, y }` 형식을 따른다.
입력 필드는 읽기 전용이다. 출력 필드는 쓰기 가능하다.

## API-010: Shape 입력과 출력

도형별 필드와 점 목록 형식은 [ADR 0010](./adr/0010-flat-shape-input.md)의 표를 따른다.
Polygon의 `transformPointsInto`는 입력과 `out`이 같은 좌표 배열이어도 안전하다.
Polygon 목록은 단일 닫힌 outer ring을 나타낸다. 점이 3개 미만이면 빈 polygon으로 처리한다.

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
핵심이거나, 고정된 shape 입력과 `Into` output으로 옮기면 의미가 깨지는 경우에만 사용한다.

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

## API-016: 반복 조회용 사전 계산 입력

입력 전체 스캔이 호출 비용을 지배하는 조회는 사전 계산 입력을 받는 별도 함수로 제공한다.

- 기존 함수의 동작과 시그니처는 바꾸지 않는다. 기존 함수의 검증은 JSDoc 계약이다.
- 이름은 기존 이름에 `ByTable`을 붙인다. 예: `pointAtLengthInto` → `pointAtLengthByTableInto`.
- 새 함수는 기존 함수와 같은 결과를 낸다. 결과 차이는 `±1e-12` 안이어야 한다.
- `Into`와 allocating companion 쌍은 API-004~008을 그대로 따른다.
- 검증을 생략하는 공개 함수(`unchecked`, `unsafe`류)를 만들지 않는다.
  - 이유: 검증하는 함수와 이름만 다른 동등 함수가 생긴다. 호출자가 검증 생략을 고르면 NaN이 조용히 전파된다.
  - 대신 표를 한 번 검증하고 조회 함수를 돌려주는 factory를 둔다. 예: `interpolation/createTableSampler`.
  - 선례: `random/createRng`, `noise/createNoise2`. 반환값은 객체가 아니라 함수다.
  - factory는 입력 표를 복사한다. 검증 뒤에 호출자가 표를 바꿔도 검증 결과가 깨지지 않는다.
- polyline domain은 좌표 non-finite를 검증하지 않는다. 이 정책 때문에 `polyline/*ByTable*`은 표 내용을 검증하지 않는다.
- 표 개수가 vertex 개수와 다르면 `RangeError`다. O(1)로 확인할 수 있고 오래된 표를 쓴 실수를 잡는다.
- 표 내용(비단조, NaN)은 O(n)이라 확인하지 않는다. 결과는 정의되지 않고 throw하지 않는다. 표를 다시 만드는 것은 호출자 책임이다.
- 새 조회 함수는 기존 함수의 segment 선택 규칙을 그대로 따른다. 예: boundary에서 앞쪽 non-zero segment.
- `normalAtLengthInto`의 사전 계산 버전은 두지 않는다. `tangentAtLengthByTableInto`의 결과 `(tx, ty)`에서 `(-ty, tx)`를 만들면 된다.
  point와 normal이 함께 필요하면 `frameAtLengthByTableInto`를 쓴다.

## API-017: ray 교점 매개변수 조회

반복 호출에서 가장 가까운 물체를 고르는 용도로, 교점 좌표 대신 `origin + t * direction`의 `t`를 돌려준다.

- `t`는 scalar다. API-005에 따라 직접 반환한다. `Into`와 allocating companion을 두지 않는다.
- 이름은 `ray<Shape>HitT`다. 예: `rayCircleHitT`, `raySegmentHitT`. 위치는 `intersects` domain이다.
- 시그니처는 `(ray, shape, tMin = 0, epsilon?)`다. 교점 판정에 epsilon이 필요 없는 `rayRectHitT`, `rayBoundsHitT`는 `epsilon`이 없다.
- 결과는 `t ≥ tMin`인 가장 작은 교점의 `t`다. 교점이 없으면 `Infinity`다.
  - 이유: `t < best`와 `Math.min`에 그대로 쓴다. `NaN`은 `Math.min`을 오염시킨다.
  - non-finite 입력은 throw하지 않는다. 비교가 모두 false가 되어 `Infinity`가 된다.
- `t`와 `tMin`은 방향 벡터 `(dx, dy)`의 길이 단위다. direction을 정규화하지 않는다.
- `tMin`은 inclusive다. 반사·굴절 직후 출발 면(`t ≈ 0`)을 거르는 용도다.
  - 점을 반환하는 기존 함수는 출발 면을 거를 수 없다. 예: `closestRayPolygonIntersectionInto`는 변 위에서 떠난 ray에 `t = 0`을 반환한다.
  - 거리 상한(`tMax`)은 두지 않는다. 호출자가 `t < best`로 거른다.
- origin이 도형 안쪽이면 exit 교점의 `t`다. tangent는 접점의 `t`다.
- 평행 판정은 기존 점 반환 함수와 같다. 평행이면 교점이 없다. collinear overlap도 교점으로 보지 않는다.
  - segment 파라미터는 `[0, 1]` closed 구간을 정확 비교한다. 끝점 접촉은 교점이다.
  - `rayPolygonHitT`는 edge마다 segment 규칙을 적용한 최솟값이다. collinear edge 양 끝의 이웃 edge가 vertex 교점을 만든다.
  - circle과 ellipse는 discriminant가 `±epsilon²` 안이면 tangent로 본다.
  - rect와 bounds는 closed box다. 모서리·변 접촉은 교점이다.
- `tMin = 0`일 때 `origin + t * direction`은 기존 점 반환 함수의 첫 교점과 같아야 한다. `±1e-9` 안이며 시험이 난수 입력으로 고정한다.
- 여러 물체 중 가장 가까운 것을 고르는 일은 호출자가 한다. 물체 순회와 순위 매기기는 제품 범위 밖이다. [제품 범위](./product-scope.md)의 "Spatial and query"를 따른다.
- 구현은 ray 필드를 직접 읽는다. 임시 객체나 배열을 만들지 않는다.
