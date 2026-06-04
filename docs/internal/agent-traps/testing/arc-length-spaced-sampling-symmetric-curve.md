# arc-length spaced sampling이 uniform-t와 다름을 검증할 때 대칭 곡선을 쓰면 구분이 사라진다

태그: `testing`, `arc-length`, `sampling`, `bezier`, `fixture`

## 함정

`*SpacedPoints*`(arc-length 균등 분포) 같은 helper가 `*Sample*`(uniform `t` 분포)과 다르다는 것을
검증할 때, fixture로 대칭 Bezier를 쓰면 arc-length midpoint가 정확히 `t=0.5`와 일치한다. 대칭
곡선은 속도 프로파일이 대칭이라 parameter 중앙과 arc-length 중앙이 같아져, "spaced ≠ uniform"
assertion이 `~1e-8` 차이로 실패한다.

```ts
// 함정: 대칭 곡선 (0,0),(0,4),(4,4) — 대각선 대칭이라 arc-length mid == t=0.5
const spaced = quadraticSpacedPoints(P0, P1, P2, 5);
const uniformMid = quadraticPointAtTInto({ x: 0, y: 0 }, P0, P1, P2, 0.5);
expect(Math.hypot(spaced[2].x - uniformMid.x, spaced[2].y - uniformMid.y)).toBeGreaterThan(1e-3);
// AssertionError: expected 2.1e-8 to be greater than 0.001
```

## 증상

- spaced sampling 구현은 정확한데 fixture 선택 때문에 distinguishing test가 실패한다.
- 차이가 `0`이 아니라 `~1e-8`(binary search tolerance 수준)로 나와 "거의 같다".

## 방지

- spaced ≠ uniform 구분을 검증하려면 속도가 단조롭게 변하는 **비대칭** 곡선을 쓴다.
  예: quadratic `(0,0),(2,0),(2,6)` — `t=0`에서 속도 4, `t=1`에서 속도 12. arc-length mid가
  `t=0.5`에서 충분히 벗어난다.
- 등속 직선(예: `(0,0),(1,0),(2,0)`)은 arc-length 균등 좌표 검증에는 좋지만, uniform과 구분되지
  않으므로 distinguishing test fixture로는 쓰지 않는다.
- arc-length 기반 helper(spaced points, length-parametrized sampling 등)의 contract는 endpoint
  고정 + 직선 균등 + 비대칭 곡선에서 기존 `*TAtLength` mapping 동치로 검증한다.

## 관련 작업

- `_works/S2-RM-029/20260528-01-curve-spaced-sampling-lookup/함정.md` TASK-01.
  `quadraticSpacedPoints` distinguishing test가 대칭 곡선 `(0,0),(0,4),(4,4)`에서 실패 →
  비대칭 `(0,0),(2,0),(2,6)`으로 교체.
