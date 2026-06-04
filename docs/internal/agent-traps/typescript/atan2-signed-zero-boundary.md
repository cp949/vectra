# Math.atan2 signed zero 경계: `-0` 입력에서 `-π` 반환

태그: `atan2`, `signed-zero`, `polar`, `boundary`

## 함정

`Math.atan2(y, x)`는 명세상 `(-π, π]` 범위를 반환하지만, `y`가 `-0`이고 `x`가 음수이면
`-Math.PI`를 반환한다. 이 경우 반환 범위 하한이 열린 구간(`-π` 제외)을 위반한다.

```ts
Math.atan2(-0, -1) // -Math.PI  ← 명세 범위 (-π, π] 위반
Math.atan2(0, -1)  // Math.PI   ← 정상
```

좌표 연산 함수가 signed zero를 입력으로 받을 수 있으면(예: `y = -0`인 벡터) 문서화한
theta 범위를 조용히 벗어난다.

## 증상

- `toPolarInto(out, { x: -1, y: -0 })`가 `theta = -Math.PI`를 기록.
- 문서화된 `(-π, π]` 범위를 벗어나 후속 각도 계산이 잘못된다.
- 단위 테스트가 양의 y만 다루면 회귀가 드러나지 않는다.

## 방지

`Math.atan2` 결과가 `-Math.PI`이면 `Math.PI`로 정규화한다.

```ts
let theta = Math.atan2(y, x);
if (theta === -Math.PI) theta = Math.PI;
```

unit test에 signed zero 케이스를 반드시 포함한다.

```ts
// 반드시 포함할 경계 케이스
toPolarInto(out, { x: -1, y: -0 })  // theta → Math.PI
toPolarInto(out, { x: -1, y: 0 })   // theta → Math.PI
```

## 관련 작업

- `_works/S3-RM-020/20260520-01-defer-policy-decisions-and-completion/함정.md`
