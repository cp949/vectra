# 사후 리뷰 사이클의 신규 trap promotion이 단일 결과 진입점에 누락

태그: `workflow`, `traps`, `bookkeeping`, `post-review-cycle`, `closeout`

## 함정

작업 도중 또는 사후 리뷰 사이클에서 `docs/internal/agent-traps/` 산하에 새 trap 파일을
생성하고 `docs/internal/agent-traps/index.md`에 등록했으나, 그 작업의 단일 결과 진입점인
`_works/<RM>/<날짜-제목>/02-작업결과.md`와 과거 상태 대시보드에는 trap promotion
사실을 기록하지 않거나 일부만 기록하는 실수.

trap 파일은 신뢰할 만한 진입점인 `index.md`에 등록되지만, 작업 단위로 어떤 trap이
어느 작업에서 승격됐는지를 추적하려면 결과 문서가 단일 진입점이어야 한다. 결과
문서에 누락되면 다음 agent는 trap 갱신이 일어났는지 알 수 없다.

## 증상

- trap 파일 4개가 작업 사이클에서 생성됐는데 `02-작업결과.md`에는 1건만 기재된다.
- 과거 상태 대시보드의 최근 완료 작업 항목에 trap promotion이 1건만 표시되어
  실제 변경 범위가 과소평가된다.
- 다음 작업 agent가 trap registry를 확인할 때 어느 작업이 어떤 trap을 만들었는지
  cross-link이 끊긴다.
- 사후 리뷰 사이클에서 trap을 추가했을 때 closeout 커밋과 trap 등록 커밋이 따로
  떨어지면 더 빈번하다.

## 방지

trap 파일을 새로 생성하거나 기존 trap에 시나리오를 append할 때 다음 4곳을 한
커밋에 같이 갱신한다:

1. `docs/internal/agent-traps/<카테고리>/<slug>.md` — trap 본문
2. `docs/internal/agent-traps/index.md` — 색인
3. `_works/<RM>/<날짜-제목>/02-작업결과.md` — 해당 TASK 섹션 또는 closeout 섹션에
   trap 이름과 한 줄 발견 맥락
4. 과거 상태 대시보드 — 최근 완료 작업 항목에 "agent-traps `<slug>` 신규 승격"
   목록 (또는 기존 trap append 사실)

사후 리뷰 사이클 중 trap을 추가할 때는 `02-작업결과.md`의 사이클 섹션에 "신규 trap
승격: `<slug>`" 라인을 명시적으로 둔다. closeout 커밋과 분리되어도 잊지 않는다.

trap promotion 갯수 검증: 결과 문서에 적힌 trap 갯수와 `git log -- docs/internal/agent-traps/`
의 `A` 또는 시나리오 append diff 갯수가 일치하는지 closeout 전 확인한다.

## 예시

나쁨 (`02-작업결과.md`):
```md
## TASK-03 구현 결과

### 새 함정 발견: NaN 자기비교 vs `Number.isNaN()`

`side.ts`에서 ... 승격 후보로 기록한다.
```
실제로는 trap 4건이 신규 생성됐지만 결과 문서는 1건만 기록.

좋음:
```md
### 새 함정 발견 (총 4건)

본 작업에서 다음 trap 파일이 신규 생성되어 `docs/internal/agent-traps/index.md`에 등록되었다.

1. `docs/internal/agent-traps/typescript/nan-self-comparison-biome.md` — TASK-03 `side.ts` 구현에서 발견.
2. `docs/internal/agent-traps/typescript/literal-union-return-nan-input.md` — TASK-01 정책 결정에서 발견.
3. `docs/internal/agent-traps/domain/signed-distance-formula-absolute-value.md` — TASK-01 검토에서 발견.
4. `docs/internal/agent-traps/workflow/plan-domain-survey-barrel-check.md` — 01-계획.md 초안에서 발견.
```

## 관련 작업

- `_works/S3-RM-027/20260522-01-circle-line-follow-up/` 사후 리뷰 Round 1에서 발견.
  closeout 커밋에는 trap 4건이 모두 등록되었으나 `02-작업결과.md`와
  과거 상태 대시보드에는 1건만 기재되어 있던 것을 Round 1 수정 사이클에서 정합화.
