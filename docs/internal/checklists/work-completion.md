# 작업 완료 체크리스트

이 체크리스트는 roadmap item이나 `_works` 세부 작업을 완료했다고 판단하기 전에 확인하는
품질 기준이다.

작업 성격에 맞지 않는 항목은 "해당 없음"으로 기록할 수 있다. 단, 생략한 이유가
명확해야 한다.

## 1. 범위 확인

- [ ] 연결된 roadmap item ID가 있다.
- [ ] 작업 범위가 roadmap item ID 또는 `_works` 계획서와 일치한다.
- [ ] 관련 없는 리팩토링이나 문서 변경을 섞지 않았다.
- [ ] public API 변경이 있으면 관련 API surface 문서를 확인했다.
- [ ] 제품 경계가 애매하면 `docs/internal/product-scope.md`와 ADR을 확인했다.

## 2. 구현 품질

- [ ] public API는 넓은 geometry/math function catalog 정체성을 따른다.
- [ ] structural input/output 정책을 API 계약과 일관되게 유지한다.
- [ ] object result는 `Into` convention을 따른다.
- [ ] scalar, boolean, enum result는 직접 반환한다.
- [ ] 좌표 입력은 `XYInput` 정책을 따른다.
- [ ] 숫자 나열 overload를 public API로 추가하지 않았다.
- [ ] 공유 계산은 낮은 internal primitive helper로 뺐다.
- [ ] public 함수끼리 domain barrel을 통해 상호 참조하지 않는다.
- [ ] module top-level side effect가 없다.
- [ ] source 주석은 `docs/internal/comment-style.md` 규칙을 따른다.

## 3. Export / Package Surface

- [ ] 새 public 함수의 leaf subpath export를 추가했다.
- [ ] domain barrel export를 갱신했다.
- [ ] `sub/vectra/package.json` `exports`가 root/domain barrel만 공개하는지 확인했다.
- [ ] `sub/vectra/build-entrypoints.ts` 규칙상 새 public leaf가 build entry로 파생되는지 확인했다.
- [ ] package self-import 또는 contract test로 subpath import를 확인했다.

## 4. 테스트

- [ ] 기능 구현은 test-first로 진행했다.
- [ ] unit test가 핵심 동작을 검증한다.
- [ ] contract test가 public export/subpath를 검증한다.
- [ ] tuple input과 object input을 모두 고려했다.
- [ ] degenerate case가 필요한 경우 test로 고정했다.
- [ ] tolerance/near equality가 필요한 경우 exact/near behavior를 분리해 검증했다.
- [ ] recipe/docs example test가 필요한 경우 추가했다.

## 5. 문서 / 운영 상태

- [ ] roadmap item 상태가 실제 진행 상태와 맞다.
- [ ] 상태 대시보드가 있는 경우 현재 작업, 다음 작업, 큰 그림을 맞게 가리킨다.
- [ ] 상세 변경 내용과 검증 결과를 작업 결과 문서 또는 최종 응답에 기록했다.
- [ ] 상태 대시보드가 있는 경우 최근 완료 작업 요약을 필요 시 갱신했다.
- [ ] `_works` 계획서 또는 작업 결과 문서가 필요한 경우 작성했다.
- [ ] README나 API surface 예제가 바뀐 API와 어긋나지 않는다.

## 6. 검증

- [ ] 개발 중에는 수정한 package의 `typecheck` + `lint` + `test`를 실행했다.
- [ ] `sub/vectra` 변경 TASK 마지막이면 `pnpm verify:apps-impact`로 apps/playground 영향을 확인했다.
      app UI/번들 설정을 직접 수정한 TASK만 app `build`를 추가했다.
- [ ] 최종 완료 선언 직전에 `pnpm verify`가 통과한다.
- [ ] package surface/release 관련 작업이면 `pnpm release:check`가 통과한다.
- [ ] 필요한 경우 package self-import smoke test를 실행했다.
- [ ] 필요한 경우 focused test를 먼저 실행했다.
- [ ] `git diff --check`가 통과한다.
- [ ] `git status --short`로 남은 변경을 확인했다. `git diff --check`는 whitespace
  오류만 보므로 미커밋 파일 존재 자체는 보장하지 않는다.
- [ ] roadmap item closeout 시점이라면 다음을 추가로 만족한다.
  - [ ] closeout 직전에 `git status --short` 출력이 비어 있는지 확인했다. 비어 있지 않으면
    출처를 `git log --` 또는 `git blame`으로 추적해 이번 도메인 작업물인지 확인하고,
    이번 도메인 작업물이면 해당 TASK 커밋 또는 별도 chore 커밋에 흡수한 뒤 closeout에
    진입한다.
  - [ ] `git stash` 또는 새 worktree로 working tree를 HEAD 상태로 되돌린 뒤
    `pnpm verify`가 단독으로 통과하는지 확인했다. working tree 변경이 같이 적용된
    verify 결과를 closeout 통과 근거로 삼지 않는다.

## 7. 커밋

- [ ] 커밋은 의미 있는 단위로 나뉘어 있다.
- [ ] 커밋 메시지가 변경 목적을 설명한다.
- [ ] 빌드 산출물, coverage, `.turbo`, `node_modules`, `_works` ignore 대상 파일을
  커밋하지 않았다.

## 최소 완료 기준

작업 종류와 관계없이 최소한 다음은 항상 확인한다.

- [ ] 범위가 roadmap item 또는 사용자 요청과 일치한다.
- [ ] 필요한 검증 명령을 실행했다.
- [ ] 최종 완료 선언이면 `pnpm verify` 결과를 확인했다.
- [ ] `git diff --check`가 통과한다.
- [ ] 작업 결과 문서 또는 최종 응답에 검증 결과를 남겼다.
- [ ] 워킹트리 상태를 확인했다.
