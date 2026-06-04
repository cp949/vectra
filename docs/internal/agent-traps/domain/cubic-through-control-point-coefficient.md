# cubic through point: symmetric `2/3` handle 계수는 `t = 0.5`에서 through 점을 통과하지 않는다

태그: `cubic-bezier`, `through-point`, `control-point`, `interpolation`, `contract`

## 함정

`cubicThroughCommandsInto`처럼 caller가 `through` 점을 정확히 지나도록 cubic Bezier control
point를 계산해야 하는 함수에서, `P1 = from + (through - from) * 2/3`, `P2 = to + (through - to) * 2/3`
같은 symmetric `2/3` 계수를 그대로 쓰면 cubic을 parameter `t`에서 evaluate했을 때 through 점을
지나지 않는다.

`2/3` 계수는 `t = 0.5`에서 `B(0.5) = (from + 2 * through + to) / 4`를 만들어 through에서 어긋난다.
일반 `t`에서 정확 통과가 contract라면 양쪽 계수가 `t`에 의존해야 한다.

## 증상

```ts
const out: PathCommand[] = [];
cubicThroughCommandsInto(out, [0, 0], [3, 6], [6, 0]);
const sample = evaluateCubicAt(out, 0.5);
// 기대: [3, 6]
// 실제: [3, 3] (through y가 절반으로 줄어듦)
```

대표 회귀 시나리오:

- 기본 `t = 0.5`에서 visual 검증만 한 caller가 결과 곡선이 through에서 약간 떨어진 것을 늦게
  발견.
- "through를 통과하는 cubic" contract test 자체를 누락한 채 control point 좌표만 검증한 unit
  test가 통과해버린다.

## 방지

- `controlScale = 1`(또는 본 contract scale 기본값)에서 cubic을 parameter `t`에서 evaluate한
  결과가 through에 정확히 일치하는 evaluate test를 먼저 둔다. 좌표 비교는 ULP 또는 relative
  tolerance를 사용한다.
- `t`별 양쪽 계수를 사용한다:
  - `P1 = from + (through - from) * ((1 + 2t) / (3t)) * controlScale`
  - `P2 = to + (through - to) * ((3 - 2t) / (3(1 - t))) * controlScale`
- `t = 0.5`에서 두 계수는 `4/3`으로 같아진다. `2/3`은 잘못된 단순화다.
- caller intent가 "through 정확 통과"가 아닌 경우(예: shape 근사용)에도 contract test로
  `controlScale = 1` 통과 여부를 별도 검증한다.

## 관련 작업

- `_works/S3-RM-028/20260522-01-path-follow-up/` TASK-05 리뷰-수정 B1.
  기존 `2/3` symmetric 계수를 `((1 + 2t) / (3t))`, `((3 - 2t) / (3(1 - t)))`로 수정하고 실패
  테스트 2건 추가.
