# vectra 프로젝트 운영 규칙

이 문서는 과거 상태 대시보드에서 분리한 검증 기준, 인수인계 규칙, 상태 문서 운영 규칙이다.
현재 작업 위치는 작업 계획 또는 상태 대시보드를 먼저 확인한다.

## 제품 운영 기준

`vectra`는 다양한 범위의 geometry/math 함수를 제공하는 TypeScript function catalog이다.

핵심 원칙:

- 넓은 geometry/math function catalog를 제공한다.
- 단일 package + subpath 기반으로 필요한 함수만 가져다 쓰게 한다.
- caller object는 문서화된 `XYInput` 또는 shape별 `Like` structural contract와 맞아야 한다.
- 공개 API는 function catalog이다.
- object result는 `Into` 함수가 caller-provided writable output에 기록한다.
- scalar, boolean, enum result는 직접 반환한다.
- renderer, DOM mutation, scene graph, editor state/history, physics engine behavior는 영구 비목표이다.

Canonical 참고 문서:

- roadmap item ID와 작업 계획서
- [product-scope.md](./product-scope.md)
- [api-design.md](./api-design.md)
- public import/export surface는 package metadata와 generated entrypoint 목록을 기준으로 확인한다.

## 검증 기준

개발 중 기본 검증은 수정한 package의 `typecheck` + `lint` + `test`이다.

예:

```sh
pnpm --filter @cp949/vectra typecheck
pnpm --filter @cp949/vectra lint
pnpm --filter @cp949/vectra test
```

최종 완료 선언 직전 전체 검증:

```sh
pnpm verify
```

`pnpm verify`는 다음을 실행한다.

- `lint` (루트 `biome ci --error-on-warnings .`. format, import 정렬, warning 포함)
- `typecheck`
- `test`
- `build`

개발 중에는 `pnpm verify`를 반복 실행하지 않는다.
Release readiness gate는 [checklists/release-readiness.md](./checklists/release-readiness.md)를 따른다.
작업 완료 전 최소 기준은 [checklists/work-completion.md](./checklists/work-completion.md)를 따른다.

### pnpm overrides

기준일: 2026-10-18. 아래 표와 버전은 이 날짜의 조회 결과다. 이 날짜의 `pnpm audit`는 취약점 0건이다.

루트 `package.json`의 `pnpm.overrides`는 repo 개발 환경에만 적용된다.
publish된 `@cp949/vectra`는 runtime dependency가 없어 영향받지 않는다.
`package.json`은 주석을 못 쓰므로 이유를 이 절에 둔다.
override를 바꾸면 기준일과 표를 함께 고친다.

현재 override:

| override | 이유 | 소비 경로 | 제거 조건 |
| --- | --- | --- | --- |
| `basic-ftp` `6.2.3` | high GHSA-c475-qrg2-pj4r (`<=6.2.0`) | `release-it` → `proxy-agent` → `pac-proxy-agent` → `get-uri` → `basic-ftp` | `get-uri`가 `basic-ftp` `>=6.2.1`을 허용할 때 |
| `dompurify` `3.4.17` | low GHSA-p98j-92pf-mc4p (`>=3.4.13 <=3.4.15`), low GHSA-6688-9rhm-gjv2 (`<=3.4.15`) | `playground` → `monaco-editor` → `dompurify` | `monaco-editor`가 고정한 `dompurify`가 `>=3.4.16`일 때 |

- 기준일의 `get-uri` 최신판은 `8.0.1`이다. 선언 범위는 `basic-ftp` `^5.3.1`이다.
- 기준일의 `monaco-editor` 최신판은 `0.57.0`이다. `dompurify` `3.4.15`를 정확 고정한다.
- `dompurify` 고정 값 확인: `npm view monaco-editor@latest dependencies.dompurify`.
- `dompurify` override는 `playground` → `@cp949/console-feed`(`^3.4.17`)에도 적용된다. 두 소비자가 한 벌로 합쳐진다.

`basic-ftp` 메모:

- override `6.2.3`은 `get-uri`의 선언 범위 `^5.3.1`을 major로 넘는다.
- `5.x`에는 수정판이 없다. `5.x` 마지막 판은 `5.3.1`이고 advisory 범위는 `<=6.2.0`이다.
- `6.x`로만 고칠 수 있어 major 초과를 받아들인다.
- 호환 근거: `get-uri@8.0.1`의 `dist/ftp.js`는 `Client`의 `access`, `lastMod`, `list`, `downloadTo`, `close`만 쓴다.
- 이 5개는 `basic-ftp@6.2.3`의 `Client.d.ts`에 있다. 호출 형태가 시그니처와 맞는다.
- `5.3.1`과 `6.2.3`의 `engines`는 모두 `node >=10.0.0`이다.
- 미확인: `basic-ftp` 6.0.0의 동작 변경 내역. 패키지에 CHANGELOG가 없다.
- 가설: 실행 경로는 `release-it`이 `ftp:` URL 프록시 설정을 쓸 때뿐이다. 이 repo의 release 흐름은 쓰지 않는다.

삭제한 override:

| override | 이력 | 대체 |
| --- | --- | --- |
| `esbuild` `0.28.2` | `cbf34c4` "pnpm audit 대응"에서 추가 | 앱 3개의 devDependency 정확 선언 `0.28.2` |

- 앱 3개: `apps/canvas-demo`, `apps/pixi-demo`, `apps/showcase`.
- 3개 앱의 `esbuild`를 같은 값으로 함께 올린다.
- 하나만 올리면 `esbuild`가 두 벌 설치된다. `vite` snapshot도 `esbuild` 버전별로 두 벌 생긴다.
- 삭제 시점에 `esbuild`는 어떤 advisory에도 걸리지 않았다.
- 삭제 전후 설치 그래프가 같다. `pnpm why -r esbuild`는 단일 `0.28.2`다.
- 다음 `pnpm audit` 대응에서 `esbuild`가 걸리면 override를 다시 넣지 않고 앱 3개를 올린다.

제거 확인:

1. override 한 항목을 `package.json`에서 뺀다.
2. `pnpm install --lockfile-only`를 실행한다.
3. `pnpm audit`를 실행한다. `node_modules` 없이 lockfile만으로 동작한다.
4. 그 패키지의 advisory가 없으면 제거를 확정한다.
5. 남으면 `package.json`과 `pnpm-lock.yaml`을 되돌린다.

- 다른 패키지의 advisory는 판정에서 뺀다. 그 advisory는 별도로 대응한다.

운영 규칙:

- `pnpm audit`는 registry advisory DB를 실시간 조회한다. 결과가 날짜에 따라 바뀐다.
- override를 추가하거나 제거할 때 작업 결과에 `pnpm audit` 조회 날짜를 남긴다.
- `pnpm install --lockfile-only`는 `node_modules`를 갱신하지 않는다. 이어서 `pnpm install --frozen-lockfile`을 실행한 뒤 `pnpm why`와 `pnpm verify`를 돌린다.
- lockfile이 충돌하면 손으로 풀지 않는다. `pnpm install --lockfile-only`로 재생성한다.

## 상태 문서 운영 규칙

- 과거 현재 상태 대시보드는 canonical 작업 상태 요약이었다.
- 상태 대시보드는 200 lines를 초과하지 않았다.
- 새 TASK 완료 시 최근 완료 작업은 최대 2개까지만 상태 대시보드에 유지했다.
- 각 완료 항목은 2~3줄 요약으로 작성한다.
- 3개째부터는 제거한다.
- 상세 검증 결과는 `_works/.../02-작업결과.md`에만 기록한다.
- 상태 대시보드에는 검증 통과/실패와 링크만 기록했다.
- 오래된 검증 로그는 각 `_works/.../02-작업결과.md`를 canonical source로 삼는다.

## 작업 시작 규칙

- `git status --short`를 먼저 확인한다.
- 과거 상태 대시보드, roadmap item ID, 작업 계획서를 읽는다.
- 진행 중 작업이 있으면 그 범위 안에서 이어간다.
- API나 제품 경계가 애매하면 관련 docs/ADR을 먼저 확인한다.

## 작업 종료 규칙

- 관련 검증 명령을 실행한다.
- [checklists/work-completion.md](./checklists/work-completion.md)를 확인한다.
- 상세 검증 결과를 작업 결과 문서 또는 최종 응답에 남긴다.
- 과거 상태 대시보드의 현재 작업, 다음 작업, 최근 완료 작업을 실제 상태에 맞게 갱신한다.
- 의미 있는 변경은 커밋한다.
- 빌드 산출물, coverage, `.turbo`, `node_modules`는 커밋하지 않는다.
