# vectra

TypeScript geometry/math function catalog monorepo.

`@cp949/vectra`는 renderer, DOM, scene graph, editor state를 소유하지 않는다.
좌표와 shape data를 받아 geometry/math 결과를 계산한다.

## Package

| 항목 | 값 |
| --- | --- |
| npm package | `@cp949/vectra` |
| package README | [sub/vectra/README.md](./sub/vectra/README.md) |
| publish root | `sub/vectra` |
| npm 포함 파일 | `dist`, `README.md`, `LICENSE`, `llm.txt` |

```sh
npm install @cp949/vectra
```

```ts
import * as Vecx from '@cp949/vectra/vec';

console.log(Vecx.add({ x: 1, y: 2 }, [3, 4])); // {x: 4, y: 6}
console.log(Vecx.add([3, 4], { x: 1, y: 2 })); // {x: 4, y: 6}
```

## Workspace

| 경로 | 역할 |
| --- | --- |
| `sub/vectra` | publish package `@cp949/vectra` |
| `sub/playground` | demo app 공통 playground shell |
| `sub/typescript-config` | workspace TypeScript config package |
| `apps/canvas-demo` | 정적 geometry 계산 결과 시각화 |
| `apps/pixi-demo` | interaction / animation geometry demo |
| `apps/showcase` | showcase app |
| `docs` | 외부 사용 문서와 내부 운영 문서 |
| `scripts` | governance, import-boundary, example coverage script |

## 주요 명령

```sh
pnpm build
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm verify
```

개발 중에는 수정한 package의 명령을 먼저 실행한다.

```sh
pnpm --filter @cp949/vectra typecheck
pnpm --filter @cp949/vectra lint
pnpm --filter @cp949/vectra test
```

최종 완료 전에는 `pnpm verify`를 실행한다.

## Demo

```sh
pnpm canvas-demo
pnpm pixi-demo
pnpm showcase
```

동일한 명령을 filter로 직접 실행할 수 있다.

```sh
pnpm --filter @repo/canvas-demo dev
pnpm --filter @repo/pixi-demo dev
pnpm --filter @repo/showcase dev
```

## Governance

```sh
pnpm governance:report:strict
pnpm import-boundary:test
pnpm import-boundary:check
pnpm jsdoc:companion:check
pnpm examples:coverage:test
pnpm examples:typecheck
```

`pnpm verify`는 위 governance gate와 workspace `typecheck`, `lint`, `format:check`, `test`, `build`를 실행한다.

Release readiness 후보:

```sh
pnpm release:check
```

실제 npm publish:

```sh
pnpm publish:npm
```

## 문서

| 문서 | 목적 |
| --- | --- |
| [Package README](./sub/vectra/README.md) | 설치, import, output, domain overview |
| [Docs README](./docs/README.md) | 외부 사용자 문서 허브 |
| [Getting Started](./docs/guides/getting-started.md) | 첫 import와 첫 계산 |
| [Import 방식](./docs/guides/imports.md) | root import / domain barrel 선택 |
| [Output과 Into](./docs/guides/outputs-and-into.md) | allocation과 caller-owned output |
| [Domain 지도](./docs/reference/domains.md) | domain별 기능 탐색 |
| [내부 문서 허브](./docs/internal/README.md) | 기여, release, agent 작업 문서 |

## 제품 경계

`vectra`가 하는 일:

- structural geometry/math 계산
- caller-owned output 기록
- format과 structural data 사이의 얇은 adapter

`vectra`가 하지 않는 일:

- rendering
- DOM mutation
- scene graph
- editor state/history/selection
- physics engine
- animation/tween engine

## 요구 사항

| 항목 | 값 |
| --- | --- |
| Node.js | `>=20.19.0` |
| Package manager | `pnpm@10.17.1` |
| Module format | ESM |
| Runtime dependencies | `@cp949/vectra` 기준 없음 |
