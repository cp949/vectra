# Circumcenter guard/denominator float-전개 mismatch: degenerate guard와 D를 같은 전개로 묶는다

태그: `triangle`, `circumcenter`, `float64`, `division-by-zero`, `near-collinear`

## 함정

triangle circumcenter 계열 함수에서 degenerate guard와 circumcenter denominator `D`를
**다른 float 전개**로 쓰는 실수.

- guard: `triangleSignedArea2x` = `(bx-ax)*(cy-ay) - (by-ay)*(cx-ax)` (좌표 차 전개)
- denominator: `D = 2*(ax*(by-cy) + bx*(cy-ay) + cx*(ay-by))` (raw 좌표 전개)

둘은 수학적으로 같다(`D === 2 × signedArea2x`). 하지만 float64 반올림이 달라, near-collinear
입력에서 guard는 통과(`signedArea2x ≠ 0`)하나 `D === 0`이 되어 division-by-zero가 발생한다.
함수는 Infinity를 쓰고도 `out`을 반환해 success를 주장한다("성공 ⇒ 유한 segment" 계약 위반).

## 증상

```ts
const t = {
  a: { x: 3.8400211035452747, y: 17.281933327867037 },
  b: { x: 8.156115648087077, y: 31.91817240438104 },
  c: { x: 9.039683586890016, y: 34.91442548901669 },
};
// signedArea2x = -1.42e-14 (≠0, guard 통과), raw D = 0
eulerLineInto(out, t);   // out.b = { x: Infinity, y: -Infinity }, 반환은 out (success)
orthocenterInto(out, t); // Infinity, success
circumcircleInto(out, t);// center = (-Infinity, Infinity), radius = Infinity, success
```

## 방지

guard에 쓰인 signed area 값을 denominator에 그대로 묶는다. `2 * area2x`는 exponent만
조정하므로 `area2x ≠ 0 ⇒ D ≠ 0`이 보장되고, 정상 입력의 circumcenter 값은 불변이다.

```ts
if (hasNonFiniteVertex(triangle)) return false;   // non-finite 먼저: area2x가 NaN이면 ===0 미검출
const area2x = triangleSignedArea2x(triangle);
if (area2x === 0) return false;
const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);
const D = 2 * area2x;   // raw 좌표 전개 2*(ax*(by-cy)+...) 금지
```

- circumcenter numerator(`a2*(by-cy)+...`)는 그대로 둔다. 분모만 guard 값에 묶는다.
- circumcenter를 division하는 모든 triangle leaf는 같은 정책을 공유한다(family 일관성).
  `eulerLineInto`/`orthocenterInto`/`circumcenterInto`/`circumcircleInto`/`circumradius`/
  `ninePointCircleInto`. 하나만 고치면 "동일 실패 정책" 계약이 깨진다.
- guard가 denominator 자체인 패턴(`const D = ...; if (D === 0) return ...`)은 mismatch가 없다
  (`circle/from-three-points-into.ts`). 이 패턴은 그대로 둔다.
- near-collinear(`signedArea2x ≈ 1e-14`이지만 ≠0) 회귀 테스트를 둔다: `result !== false` 단언 +
  endpoint 유한 단언.

## 관련 작업

- `_works/S12-RM-013/20260604-01-triangle-remaining-policy-helpers/함정.md`
