# literal union 반환 타입 함수의 NaN 입력 처리 정책 누락

태그: `literal-union`, `NaN`, `non-finite`, `return-type`, `policy`

## 함정

`-1 | 0 | 1`처럼 literal union을 반환하는 함수가 NaN/Infinity 입력을 받을 때, 처리 정책을
명시하지 않는 실수.

TypeScript 타입 시스템상 NaN은 `number`이지만 `-1 | 0 | 1` union에는 포함되지 않는다.
JavaScript 런타임에서 `NaN`을 그대로 반환하면 타입 위반이 된다.

```ts
// 함정: NaN 입력 시 cross product 계산이 NaN이 되어 비교가 실패
function side(line: InfiniteLineLike, point: XYInput): -1 | 0 | 1 {
  const d = signedDistance(line, point);
  // d가 NaN이면 어떤 branch도 타지 않고 undefined처럼 동작
  if (d > 0) return 1;
  if (d < 0) return -1;
  return 0; // NaN은 여기로 떨어지지만 다른 컴파일러가 -1|0|1을 강제
}
```

위 코드는 NaN 입력에서 `0`을 반환하나, 이것이 의도적인 정책인지 우발적인 동작인지 불분명하다.

## 증상

- 계획서에 "non-finite 입력 → NaN pass-through"라고 쓰면서 반환 타입이 `-1 | 0 | 1`인 함수를 구현하면 contradiction.
- 구현자가 정책 없이 임의로 `0`을 반환하거나, TypeScript 오류를 피하려고 `as -1 | 0 | 1`로 캐스팅하는 코드를 작성한다.
- NaN 입력 테스트가 없어서 이 동작이 드러나지 않는다.

## 방지

literal union을 반환하는 query 함수를 설계할 때:

1. **정책을 명시한다**: "NaN 입력 시 `0` 반환 (degenerate 취급)" 또는 "NaN 입력 시 throw"처럼 구체적으로 결정한다.
2. **계획서 완료 조건에 포함한다**: policy-only TASK라면 완료 조건에 "NaN 입력 반환 정책이 명시되었다"를 추가한다.
3. **JSDoc에 명시한다**: 결정된 정책을 함수 JSDoc에 기록해 호출자가 예측할 수 있게 한다.

권장 패턴:

```ts
// NaN 입력 → 0 반환 (degenerate 취급). JSDoc에 명시.
function side(line: InfiniteLineLike, point: XYInput, epsilon = 1e-9): -1 | 0 | 1 {
  const d = signedDistanceToPoint(line, point);
  if (d > epsilon) return 1;
  if (d < -epsilon) return -1;
  return 0; // NaN이면 여기로 떨어짐 — 의도적 정책
}
```

## 관련 작업

- `_works/S3-RM-027/20260522-01-circle-line-follow-up/` (TASK-01/TASK-03 계획서 리뷰)
