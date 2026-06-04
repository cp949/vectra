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

- `typecheck`
- `lint`
- `format:check`
- `test`
- `build`

개발 중에는 `pnpm verify`를 반복 실행하지 않는다.
Release readiness gate는 [checklists/release-readiness.md](./checklists/release-readiness.md)를 따른다.
작업 완료 전 최소 기준은 [checklists/work-completion.md](./checklists/work-completion.md)를 따른다.

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
