# 이슈 추적: GitHub

이슈는 이 저장소의 GitHub Issues에 둔다. 모든 조작은 `gh` CLI로 한다. 저장소는 `git remote -v`의 `origin`(`github.com/cp949/vectra`)에서 추론한다. 저장소 클론 안에서 실행하면 `gh`가 자동으로 판별한다.

## 명령

- 생성: `gh issue create --title "..." --body "..."`. 여러 줄은 heredoc을 쓴다.
- 조회: `gh issue view <번호> --comments`. 기계 판독은 `--json number,title,body,labels,comments`.
- 목록: `gh issue list --state open --json number,title,labels`. `--label`, `--state`로 거른다.
- 댓글: `gh issue comment <번호> --body "..."`.
- 라벨: `gh issue edit <번호> --add-label "..."` / `--remove-label "..."`.
- 종료: `gh issue close <번호> --comment "..."`. 종료 사유를 댓글로 남긴다.
- PR: `gh pr create`, `gh pr view`, `gh pr comment`. PR 생성은 사용자가 지시할 때만 한다.

## 상태 규칙

- 진행 중: open, 라벨 없음.
- 보류: open + 라벨 `deferred`. 본문에 재개 조건을 적는다.
- 하지 않음: closed + 라벨 `wontfix`. 이유를 댓글로 남긴다.
- 완료: closed.

## 등록 기준

재현 가능한 문제 또는 명확한 사용자 시나리오와 관찰 가능한 완료 기준이 있는 후속 작업만 등록한다. 아직 가설인 문제는 관찰 증거와 재개 조건을 남겨 `deferred`로 둔다.

공개 저장소다. 내부 경로·작업 폴더·개인 환경 정보를 이슈 본문에 적지 않는다.

## 외부 PR

**PR을 요청 접수 경로로 사용: 아니오.** 외부 PR을 기능 요청으로 다루려면 이 값을 `예`로 바꾼다.

## 스킬 용어 대응

- "이슈 트래커에 게시": GitHub 이슈를 생성한다.
- "관련 티켓 조회": `gh issue view <번호> --comments`를 실행한다.
- 인계·보고 시 이슈 번호는 `#<번호>`로 적는다. GitHub는 이슈와 PR 번호를 같이 센다. 모호하면 `gh pr view <번호>`를 먼저 보고 실패하면 `gh issue view <번호>`를 본다.
