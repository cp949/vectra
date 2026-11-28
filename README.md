# vectra

2D 도형과 수학 계산 함수를 모아 둔 TypeScript 라이브러리 `@cp949/vectra`의 저장소다.

`@cp949/vectra`는 렌더링, DOM, 장면 그래프, 에디터 상태를 다루지 않는다. 좌표와 도형 데이터를 넘기면 계산 결과만 돌려준다. 이 저장소에는 라이브러리 패키지와 함께, 계산 결과를 눈으로 확인하는 데모 앱과 문서가 들어 있다.

## 패키지

| 항목 | 값 |
| --- | --- |
| npm 패키지 | `@cp949/vectra` |
| 패키지 README | [sub/vectra/README.md](./sub/vectra/README.md) |
| 배포 위치 | `sub/vectra` |
| npm에 포함되는 파일 | `dist`, `README.md`, `LICENSE`, `llm.txt` |

README와 문서의 예시는 모두 2.0 API 기준이다.

```sh
npm install @cp949/vectra
```

```ts
import * as Vecx from '@cp949/vectra/vec';

console.log(Vecx.add({ x: 1, y: 2 }, { x: 3, y: 4 })); // { x: 4, y: 6 }
```

사용법은 [패키지 README](./sub/vectra/README.md)에 자세히 적어 두었다.

## 저장소 구성

| 경로 | 역할 |
| --- | --- |
| `sub/vectra` | npm에 배포하는 `@cp949/vectra` 패키지 |
| `sub/playground` | 데모 앱이 같이 쓰는 playground 화면 |
| `sub/typescript-config` | 워크스페이스 공용 TypeScript 설정 |
| `apps/canvas-demo` | 계산 결과를 정적인 그림으로 보여 주는 데모 |
| `apps/pixi-demo` | 드래그와 애니메이션으로 계산을 확인하는 데모 |
| `apps/showcase` | 대표 기능을 모아 보여 주는 앱 |
| `docs` | 사용자 문서와 내부 운영 문서 |
| `scripts` | API 정책, import 경계, 예제 커버리지 검사 스크립트 |

## 개발

저장소 루트에서 의존성을 설치한다.

```sh
pnpm install
```

자주 쓰는 명령은 다음과 같다.

```sh
pnpm build
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm test:contract
pnpm verify
```

`pnpm test`를 돌리기 전에 먼저 빌드해야 한다. 기본 테스트에 `dist`를 직접 읽는 계약 테스트가 섞여 있어서다. `pnpm test:contract`는 알아서 빌드부터 한다.

작업 중에는 고친 패키지만 골라서 검사하면 빠르다.

```sh
pnpm --filter @cp949/vectra typecheck
pnpm --filter @cp949/vectra lint
pnpm --filter @cp949/vectra test
```

작업을 마무리하기 전에는 `pnpm verify`로 전체를 한 번 확인한다.

## 데모 실행

```sh
pnpm canvas-demo
pnpm pixi-demo
pnpm showcase
```

각 명령은 해당 앱의 `dev` 스크립트를 실행한다. filter로 직접 실행해도 결과는 같다.

```sh
pnpm --filter @repo/canvas-demo dev
pnpm --filter @repo/pixi-demo dev
pnpm --filter @repo/showcase dev
```

## 검사 스크립트

```sh
pnpm governance:report:strict
pnpm import-boundary:test
pnpm import-boundary:check
pnpm jsdoc:companion:check
pnpm examples:coverage:test
pnpm examples:coverage:check
pnpm examples:typecheck
```

`pnpm verify`는 먼저 예제 커버리지, API 정책, import 경계, companion 함수의 JSDoc을 검사한다. 그다음 루트 `pnpm lint`를 실행하고, 워크스페이스 전체의 타입 검사, 예제 타입 검사, 테스트, 빌드를 차례로 돌린다.

## 배포

배포 전에는 아래 명령으로 패키지 상태를 확인한다.

```sh
pnpm release:check
```

유지보수자가 `release-it`으로 `v*` 태그를 올리면 GitHub Actions가 npm에 배포한다. 자세한 절차는 [RELEASING.md](./RELEASING.md)에 있다.

## 문서

| 문서 | 내용 |
| --- | --- |
| [패키지 README](./sub/vectra/README.md) | 설치, import, 결과 받는 법, 도메인 목록 |
| [문서 목차](./docs/README.md) | 사용자 문서 모음 |
| [시작하기](./docs/guides/getting-started.md) | 첫 import와 첫 계산 |
| [Import 방식](./docs/guides/imports.md) | 패키지 루트와 도메인 subpath 중 무엇을 쓸지 |
| [입력과 도형](./docs/guides/inputs-and-shapes.md) | 점, 도형, 좌표 배열을 넘기는 형식 |
| [결과와 Into](./docs/guides/outputs-and-into.md) | 새 객체를 받을지, 넘긴 객체에 쓸지 |
| [도메인 지도](./docs/reference/domains.md) | 도메인별 기능 찾기 |
| [내부 문서](./docs/internal/README.md) | 기여, 배포, 에이전트 작업 문서 |
| [RELEASING](./RELEASING.md) | npm 배포 절차 |

## 하는 일과 하지 않는 일

`vectra`가 하는 일은 다음과 같다.

- 도형과 수학 계산
- 호출하는 쪽이 넘긴 출력 객체에 결과 기록
- SVG path 같은 외부 형식과 도형 데이터 사이의 변환

다음 일은 하지 않는다.

- 렌더링
- DOM 조작
- 장면 그래프 관리
- 에디터 상태, 실행 취소 기록, 선택 관리
- 물리 엔진
- 애니메이션·tween 엔진

## 요구 사항

| 항목 | 값 |
| --- | --- |
| 개발 환경 | Node.js `>=24.18.0`. 배포 CI는 `24.18.0`을 쓴다 |
| 빌드 target | ES2020, platform neutral. 브라우저와 번들러 호환성은 환경에 따라 다르다 |
| 패키지 매니저 | `pnpm@12.23.0` |
| 모듈 형식 | ESM |
| 런타임 의존성 | `@cp949/vectra`에는 없다 |
