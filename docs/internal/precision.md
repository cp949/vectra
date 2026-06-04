# vectra Precision 정책

Geometry 라이브러리는 tolerance 규칙이 명확해야 한다. `vectra`는 precision 정책을
문서화한다.

## Epsilon 기본 방향

nonzero tolerance가 필요한 helper의 일반 기본값:

```ts
const EPSILON = 1e-9;
```

이 값은 전역 강제값이 아니다. 함수별 numeric 의미가 다르면 기본값을 따로 둔다.

현재 정책:

- `vec.nearEquals`, line-family containment/relation, `matrix.nearEquals`: 기본 `1e-9`
- `triangle.containsPoint`, `triangle.isDegenerate`, `polygon.containsPoint`: 기본 `0`
- `matrix.isInvertible`, `matrix.isIdentity`: 기본 `0`
- `ellipse.nearEquals`: 기본 `1e-10`

새 함수는 API surface 문서에 epsilon의 단위와 기본값을 명시한다. 예를 들어 length
tolerance인지, squared length tolerance인지, cross product 절대값 tolerance인지 구분한다.

## Equality

정확한 equality와 approximate equality는 별도의 API로 분리한다.

```ts
vec.equals(a, b);          // component exact equality
vec.nearEquals(a, b);      // domain default epsilon 사용
vec.nearEquals(a, b, eps); // caller-provided epsilon 사용
```

## Tolerance가 필요한 연산

기하학적 애매함이 있는 연산은 optional tolerance를 받을 수 있어야 한다.

예:

- point-on-segment check
- line / segment intersection
- boundary 근처 containment
- zero-length detection
- matrix inversion check

## Degenerate Geometry

일반적인 기하학 edge case에서는 throw하지 않는다.

예:

- parallel line
- zero-length segment
- empty polyline
- non-invertible matrix
- degenerate polygon

권장 반환 방식:

```ts
matrix.invertInto(out, matrix): boolean
finiteLine.singleIntersectionInto(out, a, b): boolean
polygon.containsPoint(poly, point): boolean
```

throw는 validation이 켜져 있을 때 invalid argument 같은 programmer error에만
사용한다.

## Numeric Validation

열린 결정:

- validation을 항상 켤지, dev-only로 둘지, opt-in으로 둘지

현재 public geometry helper는 대부분 non-finite input을 사전 validation하지 않는다. invalid
numeric input 처리는 caller 또는 adapter 책임으로 둔 domain이 있다. 새 domain은 이 정책을
명시적으로 유지하거나 예외를 API surface 문서에 기록한다.

## Topology Predicate 정책

### epsilon은 topology sign 판단 근거로 부적합하다

epsilon 비교는 threshold를 경계로 결과가 불연속적으로 바뀐다. 좌표가 epsilon 경계 근방에
있으면 부동소수점 연산 순서에 따라 `true`/`false`가 뒤집힌다.

polygon boolean, ring normalization, offset처럼 topology sign이 관여하는 모든 연산에서
epsilon 판정을 topology 결정 근거로 사용하지 않는다:

- **ring winding 판정**: `orient2d`의 exact sign을 사용한다.
- **hole ownership 판정**: `orient2d`의 exact sign을 사용한다.
- **segment split / collinear 판정**: `orient2d`의 exact `0` 반환을 topology state로 취급한다.
- **boundary proximity**: `nearEquals` / epsilon이 유효한 영역이다.

### orient2d — robust exact predicate

topology sign 판단 전용 predicate. `robust-predicates` 패키지의 `orient2d`를 vectra
내부 predicate로 사용한다.

```ts
orient2d(ax, ay, bx, by, cx, cy): number
// 양수 → CCW (counter-clockwise)
// 음수 → CW (clockwise)
// 0    → collinear (exact topology state)
```

`orient2d`는 내부 error-bound 계산으로 fast path가 충분하면 즉시 반환하고, 불충분하면
adaptive expansion으로 exact sign을 보장한다.

`orient2dfast`는 내부 사용 금지. public API 후보 아님.

### incircle 보류

`incircle`은 Delaunay triangulation에서 circumcircle 내부 여부를 판정하는 robust predicate다.
polygon boolean / offset / ring assembly에서 직접 요구되지 않는다. triangulation domain
진입 전 별도 gate에서 재평가한다.

## Reference-learning 근거

- precision-tolerance-degeneracy synthesis:
  epsilon, tolerance, degeneracy, robust predicate, invalid numeric input 관찰
- point-vector synthesis:
  zero vector normalization, fuzzy equality, non-finite input, squared length helper 관찰
- transform-matrix synthesis:
  singular matrix, point / vector / normal transform, homogeneous `w` 구분 관찰
- bounds-containment synthesis:
  boundary containment, empty bounds, transformed bounds, tolerance expansion 관찰
- intersection-relation synthesis:
  intersection failure result, boundary touch, robust relation state 관찰
