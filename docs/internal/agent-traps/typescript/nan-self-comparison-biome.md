# NaN 자기비교는 biome lint 오류: Number.isNaN() 사용

태그: `biome`, `nan`, `lint`, `typescript`

## 함정

`x !== x` 형태의 NaN 자기비교는 수학적으로 유효하지만 biome lint가 오류로 처리한다.

## 증상

`pnpm lint` 실패. biome이 `suspicious/noSelfCompare` 규칙으로 오류를 보고한다.

## 방지

NaN 판정 시 `Number.isNaN(x)`를 사용한다.

## 예시

나쁨:
```typescript
if (x !== x) return 0; // NaN 자기비교 → biome 오류
```

좋음:
```typescript
if (Number.isNaN(x)) return 0;
```

## 관련 작업

- `_works/S3-RM-027/20260522-01-circle-line-follow-up/02-작업결과.md` — `side.ts` NaN guard 구현 시 발견
