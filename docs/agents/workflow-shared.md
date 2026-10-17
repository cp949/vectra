# workflow-shared

`qq-workflow`와 `roadmap-workflow`가 공유하는 실행 계약이다. 각 흐름의 절차와 산출물은 각 흐름 문서가 소유하고, 여기서는 공통 계약만 다룬다. 레인 선택은 `docs/agents/README.md`의 "작업 레인"이 소유한다.

## DELTA 크기 규칙

qq-workflow 적합성과 roadmap-workflow의 DELTA 하나 크기를 판정할 때 쓴다. 기준은 변경 diff 추가+삭제다. 테스트를 포함하고 `pnpm-lock.yaml`과 생성 파일(`dist/`, `llm.txt`, baseline JSON 재생성분, `CHANGELOG.md`)은 제외한다. 측정은 `git diff <기준 커밋> --shortstat`과 새 파일 `wc -l` 합으로 한다. 기준 커밋은 아래 "리뷰 대상 diff"를 따른다.

- 목표: 1,000줄 이하.
- 상한: 2,000줄. 1,000줄을 조금 넘는다는 이유로 나누지 않는다.
- 하한: 검증 가능한 완료 조건이 1개 이상이어야 한다. 못 미치면 앞뒤 작업에 합친다.

상한을 넘을 때의 처리는 호출 문서가 정한다.

## Git 규칙

브랜치·커밋·병합의 기본 규칙은 `docs/agents/README.md`의 "브랜치와 커밋"이 소유한다. 여기서는 워크플로 전용 계약만 다룬다.

### 작업 브랜치

승인 직후 `dev`에서 임시 작업 브랜치를 만든다. 이름은 `<커밋 타입>/<작업 slug>`다. 예: `refactor/split-easing-internal`.

```bash
git branch --show-current   # dev
git status --short          # 깨끗해야 한다
git rev-parse dev           # 착수 커밋
git switch -c <커밋 타입>/<작업 slug>
```

- `dev`가 아니거나 `git status --short`에 이번 작업이 아닌 변경이 있으면 멈추고 보고한다. 기존 변경은 사용자 작업으로 간주하고 보존한다.
- 작업 브랜치에서는 에이전트가 판단해 자유롭게 커밋한다. `git add`는 이번 작업 파일 경로를 지정해서 한다. `git add -A`, `git add .`를 쓰지 않는다.
- 이어받는 작업은 기존 작업 브랜치와 `01-계획.md`의 착수 커밋을 그대로 쓴다.

### 착수 커밋

- 값: 작업 브랜치를 만든 시점의 `git rev-parse dev` 결과. 전체 40자.
- 기록 위치: `01-계획.md`의 `착수 커밋` 절. 한 번 적고 바꾸지 않는다.
- 용도: 작업 브랜치 전체 변경의 비교 기준이다. 필요할 때마다 이 값을 기준으로 `git diff`를 쓴다.
- `dev`에는 `main`에 병합하지 않은 커밋이 많이 있을 수 있다. `main`, `origin/main`, `dev`의 현재 위치와 비교하지 않는다.
- 값을 잃어버렸으면 `git merge-base dev <작업 브랜치>`로 다시 구한다.
- roadmap-workflow에는 두 값이 더 있다. 둘 다 작업 브랜치 `HEAD`를 기록한다.
  - `DELTA 착수 커밋`: DELTA 파일에 적는다. DELTA 리뷰와 DELTA 크기 측정의 기준이다.
  - `RD 착수 커밋`: RD 파일에 적는다. RD의 첫 DELTA 착수 시점이며 RD 통합 리뷰의 기준이다.

### 리뷰 대상 diff

리뷰는 기준 커밋과 작업 트리를 비교한다. 커밋하지 않은 변경도 포함한다.

```bash
git diff <기준 커밋>      # 기준 커밋 이후의 모든 변경(미커밋 포함)
git status --short       # untracked 파일
```

- 기준 커밋은 qq-workflow가 착수 커밋, roadmap-workflow의 DELTA 리뷰가 `DELTA 착수 커밋`, RD 통합 리뷰가 `RD 착수 커밋`이다.
- 커밋된 범위만 볼 때는 `git diff <기준 커밋>..HEAD`를 쓴다.
- `git diff`는 untracked 파일을 보여주지 않는다. 리뷰어에게 untracked 파일 목록을 함께 넘기고 전문을 읽게 한다.

### 병합

완료 조건 대조와 리뷰를 통과하고 `dev` 병합 직전 검증을 통과하면 병합한다. 묻지 않고 에이전트가 진행한다.

1. `git switch dev`
2. `git merge --squash <작업 브랜치>`
3. 변경을 논리 단위로 커밋한다. 기본은 커밋 1개다. 서로 독립인 변경이 섞였으면 경로를 지정해 나누어 커밋한다. 메시지는 한글 Conventional Commits다.
   - 패키지 사용자에게 보이는 변경이면 같은 커밋에서 `CHANGELOG.md`의 `## [Unreleased]`에 항목을 추가한다.
4. `git diff dev <작업 브랜치> --stat`이 비어 있는지 확인한 뒤 `git branch -D <작업 브랜치>`로 지운다. squash 병합은 작업 브랜치를 병합된 것으로 표시하지 않으므로 `-d`는 실패한다.
5. `git status --short`가 깨끗한지 확인한다.

### 승인 경계

- 작업 브랜치 생성, 커밋, `dev` squash 병합, 작업 브랜치 삭제는 묻지 않고 진행한다.
- push, tag, PR 생성은 사용자가 그 세션에서 명시적으로 지시할 때만 한다.
- npm 배포(`pnpm release-it`)는 에이전트가 실행하지 않는다. 절차는 `RELEASING.md`를 따른다.
- `main` 브랜치를 대상으로 merge, rebase, push하지 않는다. `dev`에서 `main`으로의 병합은 사용자가 지시할 때만 한다.

### 금지

- 편집기를 여는 git 명령(`git rebase -i`, `-m` 없는 `git commit`, `--no-edit` 없는 `git merge`). 에이전트 세션에서는 입력 없이 조용히 성공할 수 있다.
- `dev`·`main`에 이미 들어간 커밋 이력을 고치는 것. 수정은 새 커밋으로 한다.
- `git reset --hard`, `git stash`, 강제 push, 광범위한 `git clean`.
- worktree 생성. 사용자가 그 세션에서 요청한 경우만 예외다.

## 작업 폴더 보관

작업이 끝나면 에이전트가 묻지 않고 작업 폴더를 `_works/_completed/`로 옮긴다. `_works/`는 Git 추적 대상이 아니므로 이동은 커밋에 영향을 주지 않는다.

- 시점: 완료 보고 직전의 마지막 단계다. `dev` 병합이 끝나고 `_meta.md`의 `상태`가 `완료`로 바뀐 뒤에만 옮긴다. 리뷰 게이트에서 멈췄거나 병합하지 않았으면 옮기지 않는다.
- 명령: `mv _works/<작업 폴더> _works/_completed/<작업 폴더>`. `_works/_completed/`가 없으면 먼저 만든다.
- 대상 경로에 같은 이름이 이미 있으면 덮어쓰지 않고 이동을 멈춘 채 보고한다.
- 보고에는 이동 뒤 경로를 적는다. 이후 문서 링크와 `IMPL-REVIEW-*.md` 경로는 `_works/_completed/` 기준이다.
- 작업 폴더 인자 매칭은 `_works/` 직속 폴더만 대상으로 한다. 완료한 작업을 다시 열 때는 `_works/_completed/<작업 폴더>` 전체 경로를 준다. 재개해도 자동으로 되돌리지 않으며, 다시 끝나면 같은 규칙으로 옮긴다.
- 일련번호 `<seq>`는 `_works/`와 `_works/_completed/`의 같은 날짜 폴더를 모두 보고 정한다. 정렬 함정은 `docs/internal/agent-traps/workflow/works-seq-number-collision.md`를 따른다.

## 검증 게이트

| 시점             | 검증                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- |
| 구현 중          | 계획서 또는 DELTA 세부 계획의 검증 명령                                                  |
| `dev` 병합 직전  | 변경 패키지의 `typecheck`·`lint`·`test`. `sub/vectra` 변경이면 아래 추가 검증을 함께 한다 |
| `main` 병합 직전 | 루트에서 `pnpm verify`. 패키지 surface·release 관련이면 `pnpm release:check`              |

`sub/vectra` 변경 시 `dev` 병합 직전 추가 검증:

```bash
pnpm verify:vectra
pnpm import-boundary:check
pnpm jsdoc:companion:check
pnpm surface:check
pnpm verify:apps-impact
```

- export, `package.json` `exports`, 빌드 설정을 바꿨으면 `pnpm --filter @cp949/vectra build`를 먼저 실행한다. `tests/contract`가 `dist`를 읽는다.
- import-boundary baseline이 바뀌어야 하면 `pnpm import-boundary:update`로 갱신하고 diff를 리뷰 대상에 넣는다.
- 작업 완료 점검 기준은 `docs/internal/checklists/work-completion.md`를 따른다.

실패가 있으면 기존 실패와 현재 변경이 만든 실패를 구분하고 성공으로 보고하지 않는다. `pnpm` 실행 뒤에는 `git status --short -- pnpm-lock.yaml`로 의도하지 않은 lockfile 변경을 확인한다.

## 리뷰 기록 규칙

finding 심각도:

- `blocker`: 진행하면 잘못된 결과나 사고로 이어진다. 요구사항 오해, 범위 충돌, public surface 변경, numeric 동작 변경, 런타임 의존성 추가, 사용자 결정 필요.
- `major`: 기능 결함, 회귀, 결함을 놓치게 만드는 검증 누락.
- `minor`: 이름, 문구, 스타일, 문서 간 불일치.

기록 규칙:

- 리뷰 파일은 append-only다. 재리뷰는 다음 번호로 새 파일을 만든다. 형식은 `docs/agents/templates/REVIEW-NN.md`를 따른다.
- finding 형식: `### F1 [major] 제목`. 위치, 문제, 조치만 적는다.
- blocker·major는 수정하고 같은 범위를 다시 검증한다. 다음 라운드는 그 수정 영역으로 한정한다.
- minor는 고치거나, 고치지 않는 이유를 한 줄로 적는다.
- 문제없음 확인 내역은 적지 않는다. `남은 위험`은 비워두지 않는다. 없으면 어디를 확인했는지 적는다.

## 독립 리뷰

결함 탐지는 읽기 전용 subagent 또는 새 세션이 한다.

- 프롬프트에 diff 범위, 참고 지침서, `docs/agents/README.md`, `docs/agents/writing-styles.md`, `docs/internal/comment-style.md`의 규칙을 적는다.
- 프롬프트에 커밋·브랜치 조작 금지를 명시한다. 리뷰 subagent가 자율 커밋한 사례가 있다.
- 계획서의 목적과 완료 조건은 주지 않는다. 계획의 사각지대를 물려받지 않기 위해서다.
- 완료 조건 대조는 메인 세션이 직접 한다.
- subagent 보고는 파일 경로, 줄 번호, 명령 출력 근거와 함께 받는다.
