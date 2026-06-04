# Pixi 예제의 새 vectra domain import는 sandbox 등록과 source compile test를 같이 추가한다

태그: `testing`, `pixi-demo`, `sandbox`, `examples`, `imports`

## 함정

새 Pixi 예제 `source.exam.ts`에서 기존에 없던 `@cp949/vectra/<domain>` namespace import를 추가하고,
`apps/pixi-demo/src/sandbox/pixi-module-specifiers.ts`를 갱신하지 않는다.

예제 source의 기본 import 정책은 domain barrel namespace import다.

```ts
import * as InfiniteLinex from '@cp949/vectra/infinite-line';
```

이 import가 `PIXI_ALLOWED_SPECIFIERS`에 없으면 `compileForSandbox`가 실행 JS를 만들지 않는다.
`PIXI_RUNTIME_MODULE_SPECIFIERS`에 없으면 compile은 통과해도 iframe runtime의 `__modules__` lookup이
깨진다.

## 증상

- preview canvas에 아무것도 그려지지 않는다.
- browser console에는 특이 사항이 없을 수 있다.
- `source.exam.ts` raw source 등록 테스트와 TypeScript build는 통과할 수 있다.
- `compileForSandbox`를 직접 실행하면 다음 형태의 diagnostic이 나온다.

```txt
허용되지 않은 import: '@cp949/vectra/infinite-line'. vectra 하위 경로만 사용할 수 있습니다.
```

## 방지

새 Pixi 예제에서 새 domain barrel import를 쓰면 같은 작업에서 모두 처리한다.

1. `apps/pixi-demo/src/sandbox/pixi-module-specifiers.ts`
   - `PIXI_ALLOWED_SPECIFIERS`에 `@cp949/vectra/<domain>` 추가.
   - `PIXI_RUNTIME_MODULE_SPECIFIERS`에 같은 specifier 추가.
2. `apps/pixi-demo/src/sandbox/pixi-runner-html.test.ts`
   - 새 예제 raw source를 import한다.
   - `compileForSandbox(source, { allowedSpecifiers: PIXI_ALLOWED_SPECIFIERS })`의 diagnostics가 빈 배열인지 확인한다.
   - compiled JS가 `__modules__["@cp949/vectra/<domain>"]`를 참조하는지 확인한다.
3. focused 검증은 package root 기준 경로로 실행한다.

```sh
pnpm --filter @repo/pixi-demo test src/sandbox/pixi-runner-html.test.ts
pnpm --filter @repo/pixi-demo build
```

## 관련 작업

- `pixi-demo:infinite-line-diagnostics-lab`
  - `@cp949/vectra/infinite-line` import를 추가했지만 Pixi sandbox specifier 등록과 compile regression test가 누락되어 빈 canvas가 발생했다.

## 관련 함정

- [Sandbox 예제 source의 barrel import allowlist 누락](./sandbox-example-barrel-import.md)
- [Sandbox allowlist와 module map 분리 갱신](./sandbox-allowlist-module-map.md)
