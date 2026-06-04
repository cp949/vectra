# Matrix decomposition squared-norm branch: `Math.hypot(...) > 0`으로 contract 분기를 바꾸지 않는다

태그: `matrix`, `decomposition`, `float64`, `underflow`, `round-trip`

## 함정

`decomposeInto`의 분기 contract가 `a²+b² > 0` / `c²+d² > 0`인데, underflow를 피하려고
branch condition까지 `Math.hypot(a, b) > 0`으로 바꾸는 실수.

`Math.hypot`은 magnitude 계산에는 맞지만, 이 contract의 분기 판정은 squared-norm 비교다.
subnormal component에서는 `Math.hypot(a, b) > 0`이면서 `a*a + b*b === 0`이 될 수 있다.

## 증상: x-basis

```ts
decomposeInto(out, { a: Number.MIN_VALUE, b: 0, c: 1, d: 0, tx: 0, ty: 0 });
```

위 입력이 y-basis fallback으로 가지 않고 primary에 진입한다. `skewing.x = π/2`가 되고,
`matrixCompose(decomposeInto(matrix))`가 원본 matrix를 재구성하지 못한다.

## 증상: y-basis

```ts
decomposeInto(out, { a: 0, b: 0, c: Number.MIN_VALUE, d: 0, tx: 0, ty: 0 });
```

위 입력은 contract상 `c*c + d*d === 0`이라 zero branch로 가야 한다. `Math.hypot(c, d) > 0`
판정으로 바꾸면 y-basis fallback에 진입한다.

## 방지

- decomposition 분기 조건은 contract와 같은 `a*a + b*b > 0`, `c*c + d*d > 0`을 사용한다.
- branch 내부 magnitude 계산은 `Math.hypot`을 유지한다.
- x-basis/y-basis subnormal underflow regression test를 모두 둔다.

```ts
expect(decomposeInto(out, { a: Number.MIN_VALUE, b: 0, c: 1, d: 0, tx: 0, ty: 0 }).scaling.x).toBe(0);
expect(decomposeInto(out, { a: 0, b: 0, c: Number.MIN_VALUE, d: 0, tx: 0, ty: 0 }).scaling.y).toBe(0);
```

## 관련 작업

- `_works/S11-RM-031/20260603-01-matrix-compose/함정.md`
