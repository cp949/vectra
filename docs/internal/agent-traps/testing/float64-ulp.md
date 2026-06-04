# float64 ULP: Number.EPSILON을 절대 차이로 쓰지 않는다

태그: `float64`, `Number.EPSILON`, `ULP`, `test`

## 함정

`Number.EPSILON`은 수 1의 ULP(Unit in the Last Place)이다. 2나 4처럼 더 큰 수에 더하면
float64 반올림으로 원래 값과 동일해진다.

```ts
2 + Number.EPSILON === 2  // true — 함정!
```

## 증상

"아주 작은 차이"를 표현하려고 `x + Number.EPSILON`을 썼는데,
`equals(a, b)` 등이 `false`를 반환해야 할 테스트에서 `true`가 나온다.

```ts
// 이 테스트는 의도와 달리 통과한다
expect(equals({ x: 1, y: 2 }, { x: 1, y: 2 + Number.EPSILON })).toBe(false);
// 2 + Number.EPSILON === 2 이므로 equals는 true를 반환한다
```

## 방지

수 `x`의 다음 float64 값을 구하려면 `x`가 속한 2의 거듭제곱 구간 `[2^k, 2^(k+1))`에서의
ULP를 사용한다.

- 수 1 → ULP = `Number.EPSILON`
- 수 2 → ULP = `2 * Number.EPSILON`
- 수 4 → ULP = `4 * Number.EPSILON`

```ts
// 올바른 테스트: 수 2의 다음 float64는 2 + 2 * Number.EPSILON
expect(equals({ x: 1, y: 2 }, { x: 1, y: 2 + 2 * Number.EPSILON })).toBe(false);
```

## 관련 작업

- `_works/S1-RM-003/20260516-01-vec-measurement/함정.md`
