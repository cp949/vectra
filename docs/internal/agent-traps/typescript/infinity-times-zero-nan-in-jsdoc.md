# `Infinity * 0 = NaN`을 분기 진술 없이 JSDoc에 "pass-through"로 일반화

태그: `float64`, `ieee754`, `jsdoc`, `infinity`, `nan`, `non-finite`

## 함정

`r * (1 - cos(θ/2))`, `r * sin(θ)`, `a * b` 같은 곱셈 형태의 수식에서 한 인수가
`±Infinity`이고 다른 인수가 정확히 `0`이 되는 입력에서 결과는 `Infinity * 0 = NaN`이다.
JSDoc에 "non-finite pass-through" 또는 "수식 결과를 그대로 반환"이라고 일반화해 적으면
이 분기를 caller가 잘못 추론한다.

특히 early-return guard(`if (r <= 0) return 0;`)가 `+Infinity` 또는 `-Infinity` 한쪽만
트리거되는 경우 분기 동작이 비대칭이라 한 진술로 묶기 어렵다.

## 증상

- JSDoc은 "radius = ±Infinity이면 수식 결과를 그대로 반환"이라 적었지만 실제는:
  - `radius = -Infinity` → `r <= 0` early-return으로 `0` (수식 미실행)
  - `radius = +Infinity, θ = 0` → `Infinity * (1 - cos(0)) = Infinity * 0 = NaN`
  - `radius = +Infinity, θ = 4π` → `Infinity * (1 - cos(2π)) = Infinity * 0 = NaN`
  - `radius = +Infinity, θ = π/2` → `Infinity * 0.293... = Infinity`
- caller가 "+Infinity radius는 항상 Infinity"로 오해할 수 있다.
- 리뷰 사이클에서 한 라운드가 일반화 표현을 도입하고 다음 라운드가 회귀로 잡는 패턴이
  반복된다.

## 방지

곱셈 형태 수식의 JSDoc 작성 시 다음을 분리 명시한다.

1. early-return guard가 트리거되는 입력 (`r <= 0`에서 `-Infinity`)
2. 수식이 그대로 실행되는 입력 중 `Infinity * 0`이 되는 angle/scalar 케이스
3. 그 외 finite angle에서의 일반 결과

회귀 방지 테스트는 `Infinity * 0 = NaN`이 되는 정확한 입력 (`angle = 0`, `angle = 4π`,
`angle = 8π` 등 `1 - cos(|θ|/2) === 0`인 모든 angle)을 최소 한 개 포함한다.

## 예시

나쁨:
```ts
/**
 * NaN/Infinity는 pass-through한다. radius = ±Infinity이면 수식 결과를 그대로 반환한다.
 */
export function sagitta(circle: CircleLike, centralAngle: number): number {
  const r = readCircleRadius(circle);
  if (r <= 0) return 0;
  return r * (1 - Math.cos(Math.abs(centralAngle) / 2));
}
```

좋음:
```ts
/**
 * NaN/Infinity는 pass-through한다. radius = -Infinity이면 empty 분기(`r <= 0`)로 0을
 * 반환한다. radius = +Infinity이면 결과가 angle에 따라 갈린다: `1 - cos(|θ|/2)`가 정확히
 * `0`인 angle(`0`, `4π`, `8π`, …)에서는 `Infinity * 0 = NaN`, 그 외 finite angle에서는
 * Infinity.
 */
```

회귀 방지 테스트:
```ts
test('radius = +Infinity, angle = 0이면 Infinity * 0 = NaN', () => {
  expect(sagitta({ ..., radius: Infinity }, 0)).toBeNaN();
});

test('radius = +Infinity, angle = 4π이면 cos(2π) = 1 → Infinity * 0 = NaN', () => {
  expect(sagitta({ ..., radius: Infinity }, 4 * Math.PI)).toBeNaN();
});
```

## 관련 작업

- `_works/S3-RM-027/20260522-01-circle-line-follow-up/` 사후 리뷰 Round 2 → Round 3에서
  발견. Round 2가 sagitta JSDoc에 "(centralAngle = 0이면 0, 그 외 angle에서는 Infinity)"
  표현을 도입했으나 실제는 `Infinity * (1 - cos(0)) = NaN`이라 Round 3가 회귀로 잡음.
