# Sandbox allowlist와 module map 분리 갱신

태그: `testing`, `sandbox`, `examples`

## 함정

playground 예제에서 새 `@cp949/vectra/<domain>` namespace import를 허용할 때 compile allowlist만 갱신하고,
iframe runner가 실제로 주입하는 `window.__modules__` barrel map을 갱신하지 않는 실수.

예제 기본 정책은 domain barrel namespace import다. namespace alias는 caller local 변수명과
충돌하기 쉬운 복수형 대신 PascalCase 단수 의미 + `x` 접미사를 쓴다. leaf import를 쓰더라도
`compileForSandbox`는 domain barrel 참조로 변환한다.

```txt
@cp949/vectra/curve/catmull-rom-polyline-into -> __modules__['@cp949/vectra/curve']
```

따라서 allowlist에 `@cp949/vectra/curve` 또는 `@cp949/vectra/curve/*` specifier가 있어도 sandbox module map에
`@cp949/vectra/curve`가 없으면 컴파일은 성공하고 런타임에서만 실패한다.

## 증상

- 예제 source test와 TypeScript build는 통과할 수 있다.
- playground diagnostics에는 런타임 오류가 뜨거나, 사용자가 보기에는 canvas가 빈 화면처럼 보인다.
- 원인은 예제 drawing 코드가 아니라 iframe 내부 `__modules__['@cp949/vectra/<domain>']` 누락이다.

## 방지

- sandbox가 허용하는 import 목록과 실제 주입하는 barrel module 목록을 별도 수동 목록으로
  흩어두지 않는다.
- 새 domain namespace import를 허용하면 같은 barrel specifier가 sandbox module bundle 목록에
  포함되는지 테스트한다.
- canvas/pixi demo에서 새 domain 예제를 추가할 때는 다음 경계를 함께 확인한다.
  - `compileForSandbox` allowlist
  - iframe `window.__modules__` 생성 경로
  - 예제 raw source test
  - 실제 demo app build
- pixi-demo에서 신규 `@cp949/vectra/<domain>` namespace를 추가하면 다음 **세 곳**을 함께 갱신한다.
  한 곳만 빠뜨리면 런타임 실패 또는 테스트 실패가 난다.
  - `apps/pixi-demo/src/sandbox/pixi-module-specifiers.ts`의 `PIXI_ALLOWED_SPECIFIERS`
  - 같은 파일의 `PIXI_RUNTIME_MODULE_SPECIFIERS`
  - `apps/pixi-demo/src/sandbox/pixi-runner-html.test.ts`의 `PIXI_RUNTIME_MODULE_SPECIFIERS`
    `toEqual([...])` exact 배열. (`PIXI_ALLOWED_SPECIFIERS`는 같은 테스트에서 `arrayContaining`이라
    갱신 불필요하지만, runtime 배열은 exact match라 누락 시 테스트가 실패한다.)

## 관련 작업

- `_works/S1-RM-013/20260522-02-point-list-curve-comparison/`
  - `canvas-demo:point-list-curve-comparison` 추가 중 `@cp949/vectra/curve/*` allowlist만 먼저 갱신해 blank canvas가 발생했다.
- `_works/S1-RM-013/20260525-69-bounds-union-box-example/`
  - `pixi-demo:bounds-union-box`로 `@cp949/vectra/bounds`를 신규 추가하며 `pixi-module-specifiers.ts` 2배열은 갱신했으나 `pixi-runner-html.test.ts`의 `PIXI_RUNTIME_MODULE_SPECIFIERS` exact 배열을 빠뜨려 테스트가 실패했다.
