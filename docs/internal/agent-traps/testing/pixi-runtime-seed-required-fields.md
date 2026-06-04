# PixiRuntimeSeed 필수 필드는 예제가 직접 쓰지 않아도 채운다

태그: `testing`, `pixi-demo`, `examples`, `typescript`

## 함정

`PixiRuntimeSeed`는 `size`, `pointer`, `segment`, `circle`을 필수 필드로 가진다.

새 Pixi 예제가 `setup()`에서 `runtime.pointer`, `runtime.segment`, `runtime.circle`을 직접 사용하지 않아도
`index.ts`의 `runtimeSeed`에는 네 필드를 모두 채워야 한다.

## 증상

`pnpm --filter @repo/pixi-demo build`의 `tsc --noEmit` 단계에서 다음 형태로 실패한다.

```txt
Type '{ size: ...; pointer: ...; }' is missing the following properties from type 'PixiRuntimeSeed': segment, circle
```

## 방지

새 Pixi 예제의 `index.ts` seed는 최소한 아래 형태를 유지한다.

```ts
const seed: PixiRuntimeSeed = {
  size: { width: 720, height: 440 },
  pointer: { x: 360, y: 220 },
  segment: { a: { x: 120, y: 300 }, b: { x: 600, y: 160 } },
  circle: { center: { x: 360, y: 220 }, radius: 72 },
};
```

필드 값은 예제 화면의 초기 state와 맞춰 의미 있는 값으로 둔다. 타입을 우회하려고 `as PixiRuntimeSeed`를
붙이지 않는다.

## 관련 작업

- `pixi-demo:cubic-curve-analysis-lab` 신규 예제에서 `segment`, `circle` 누락으로 build가 실패했다.
