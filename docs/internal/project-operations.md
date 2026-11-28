# vectra 프로젝트 운영 규칙

이 문서는 과거 상태 대시보드에서 분리한 검증 기준, 인수인계 규칙, 상태 문서 운영 규칙이다.
현재 작업 위치는 작업 계획 또는 상태 대시보드를 먼저 확인한다.

## 제품 운영 기준

`vectra`는 다양한 범위의 geometry/math 함수를 제공하는 TypeScript function catalog이다.

핵심 원칙:

- 넓은 geometry/math function catalog를 제공한다.
- 단일 package + subpath 기반으로 필요한 함수만 가져다 쓰게 한다.
- caller object는 문서화된 `Point` 또는 도형별 고정 필드를 갖춰야 한다.
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

- `lint` (루트 `oxlint --deny-warnings . && oxfmt --check .`. lint warning, format 포함. import 정렬은 검사하지 않는다)
- `typecheck`
- `test`
- `build`

개발 중에는 `pnpm verify`를 반복 실행하지 않는다.
Release readiness gate는 [checklists/release-readiness.md](./checklists/release-readiness.md)를 따른다.
작업 완료 전 최소 기준은 [checklists/work-completion.md](./checklists/work-completion.md)를 따른다.

### pnpm overrides

기준일: 2026-11-25. 아래 표와 버전은 이 날짜의 조회 결과다. 이 날짜의 `pnpm audit`는 취약점 0건이다.

override는 `pnpm-workspace.yaml`의 `overrides`에 둔다. repo 개발 환경에만 적용된다.
publish된 `@cp949/vectra`는 runtime dependency가 없어 영향받지 않는다.
이유는 이 절에 둔다.
override를 바꾸면 기준일과 표를 함께 고친다.

현재 override: 없음.

삭제한 override:

| override | 이력 | 대체 |
| --- | --- | --- |
| `esbuild` `0.28.2` | `cbf34c4` "pnpm audit 대응"에서 추가 | 앱 3개의 devDependency 정확 선언 `0.28.2` |
| `basic-ftp` `6.2.6` | `7516983`에서 `6.2.3`으로 추가, `32d86c3`에서 `6.2.6`으로 올림 | `get-uri@8.0.2`의 선언 범위 `^6.2.4` |
| `dompurify` `3.4.17` | `a4e3bd2`에서 추가 | `monaco-editor@0.58.0`의 정확 고정 `3.4.17` |

`esbuild`:

- 앱 3개: `apps/canvas-demo`, `apps/pixi-demo`, `apps/showcase`.
- 3개 앱의 `esbuild`를 같은 값으로 함께 올린다.
- 하나만 올리면 `esbuild`가 두 벌 설치된다. `vite` snapshot도 `esbuild` 버전별로 두 벌 생긴다.
- 삭제 시점에 `esbuild`는 어떤 advisory에도 걸리지 않았다.
- 삭제 전후 설치 그래프가 같다. `pnpm why -r esbuild`는 단일 `0.28.2`다.
- 다음 `pnpm audit` 대응에서 `esbuild`가 걸리면 override를 다시 넣지 않고 앱 3개를 올린다.

`basic-ftp`:

- 소비 경로: `release-it` → `proxy-agent` → `pac-proxy-agent` → `get-uri` → `basic-ftp`.
- 최신 advisory는 GHSA-5pm8-86m8-9m6r(`<=6.2.3`)이다. `^6.2.4`는 이 범위 밖이다.
- 삭제 후 해석 결과는 `6.2.6` 한 벌이다.
- `get-uri`를 낮추는 변경이 생기면 `basic-ftp` 범위를 다시 확인한다.

`dompurify`:

- 소비 경로: `playground` → `monaco-editor` → `dompurify`, `playground` → `@cp949/console-feed`(`^3.4.17`) → `dompurify`.
- 최신 advisory 3건(GHSA-cg2g-xh64-v4q7, GHSA-mrv2-3pqr-j5jr, GHSA-c6gr-qvv4-5v3f)은 `3.4.17`에서 수정됐다.
- 삭제 후 두 벌이 설치된다. `monaco-editor`는 `3.4.17`, `@cp949/console-feed`는 `3.5.0`이다.
- 두 벌은 보안 문제가 아니다. `playground` 번들에 `dompurify`가 중복으로 들어갈 수 있다.
- `monaco-editor` 고정 값 확인: `npm view monaco-editor@latest dependencies.dompurify`.

제거 확인:

1. override 한 항목을 `pnpm-workspace.yaml`에서 뺀다.
2. `pnpm install --lockfile-only`를 실행한다.
3. `pnpm audit`를 실행한다. `node_modules` 없이 lockfile만으로 동작한다.
4. 그 패키지의 advisory가 없으면 제거를 확정한다.
5. 남으면 `pnpm-workspace.yaml`과 `pnpm-lock.yaml`을 되돌린다.

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
