# float64 합산 overflow: 개별 finite 값도 합산하면 Infinity가 된다

태그: `float64`, `overflow`, `Infinity`, `aggregation`, `weighted`

## 함정

개별 값이 `Number.isFinite`를 통과해도 합산 결과가 `Infinity`가 될 수 있다. 입력 배열을
순회하며 개별 값만 검증하고 누적 합계는 검증하지 않으면, 이후 threshold 비교나 정규화가
무의미해진다.

```ts
// 함정: 개별 검증만 하면 합산 overflow를 놓친다
for (const w of weights) {
  if (!Number.isFinite(w) || w < 0) throw new RangeError(...);
  total += w;  // total이 Infinity가 될 수 있다
}
```

`Number.MAX_VALUE + Number.MAX_VALUE === Infinity`

## 증상

weighted 함수에서:
- `[Number.MAX_VALUE, Number.MAX_VALUE]`가 개별 weight 검증을 통과.
- `total === Infinity`가 되어 threshold 계산이 무의미해짐.
- cumulative 비교가 항상 `false`여서 마지막 positive-weight index로 편향되는 fallback이 실행됨.
- 테스트가 small weight만 다루면 회귀가 드러나지 않음.

## 방지

weight를 누적할 때마다 합계도 `Number.isFinite(total)`로 검증한다.

```ts
for (const w of weights) {
  if (!Number.isFinite(w) || w < 0) throw new RangeError(...);
  total += w;
  if (!Number.isFinite(total)) throw new RangeError('weight 합산이 Infinity로 overflow됐다');
}
```

회귀 테스트에 `[Number.MAX_VALUE, Number.MAX_VALUE]` 케이스를 포함한다.

## 관련 작업

- `_works/S3-RM-020/20260520-01-defer-policy-decisions-and-completion/함정.md`
