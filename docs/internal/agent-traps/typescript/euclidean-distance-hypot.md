# Euclidean 거리/길이는 `Math.sqrt(dx * dx + dy * dy)` 대신 `Math.hypot(dx, dy)`를 쓴다

태그: `float64`, `overflow`, `underflow`, `distance`, `Math.hypot`

## 함정

2D 거리, 벡터 길이, tangent 길이, chord 길이를 직접 제곱합으로 계산하는 실수.

```ts
// 함정: dx * dx 또는 dy * dy 단계에서 overflow/underflow 가능
const distance = Math.sqrt(dx * dx + dy * dy);
```

`dx`와 `dy`가 finite여도 제곱 단계에서 `Infinity`가 되거나 0으로 underflow될 수 있다.

```ts
Math.sqrt(1e308 * 1e308 + 1e308 * 1e308); // Infinity
Math.hypot(1e308, 1e308);                 // 1.4142135623730951e+308

Math.sqrt(1e-200 * 1e-200 + 1e-200 * 1e-200); // 0
Math.hypot(1e-200, 1e-200);                   // 1.414213562373095e-200
```

## 증상

- 큰 좌표에서 실제 finite 거리인데 `Infinity`가 반환된다.
- 작은 좌표에서 실제 nonzero 거리인데 0이 반환된다.
- 거리 비교, tolerance 판정, normalize, closest-point 계산이 잘못된 branch로 간다.
- 테스트가 작은 정수 좌표만 쓰면 회귀가 드러나지 않는다.

## 방지

2D Euclidean 거리/길이는 기본적으로 `Math.hypot(dx, dy)`를 사용한다.

```ts
const distance = Math.hypot(dx, dy);
```

3D 이상도 제곱합을 직접 만들지 말고 `Math.hypot(dx, dy, dz)`를 우선한다.

```ts
const distance3 = Math.hypot(dx, dy, dz);
```

단, non-finite pass-through 정책 함수에서는 `Math.hypot`의 `Infinity` 우선 동작을 확인한다.

```ts
Math.sqrt(Infinity * Infinity + NaN * NaN); // NaN
Math.hypot(Infinity, NaN);                  // Infinity
```

finite-only 계약 함수는 거리 계산 전에 `Number.isFinite` 또는 domain helper로 입력을 검증한다.
pass-through 계약 함수는 `NaN`만 보지 말고 `Infinity` / `-Infinity` / `NaN + Infinity` 혼합 케이스
테스트 필요 여부를 판단한다.

거리 제곱 자체가 필요한 함수(`distanceSq`, 비교 최적화 등)는 이름과 계약을 squared distance로
명시하고, overflow가 의미 있는지 별도 테스트한다.

## 관련 작업

- unstaged `Math.sqrt(dx * dx + dy * dy)` → `Math.hypot(dx, dy)` 변경 리뷰에서 발견.
