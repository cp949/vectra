# @cp949/vectra 배포

`@cp949/vectra`를 npm에 배포하는 절차다. 유지보수자가 직접 진행한다.

배포는 두 단계로 나뉜다. 로컬에서 [release-it](https://github.com/release-it/release-it)으로 버전을 올리고 태그를 만들어 올리면, GitHub Actions(`.github/workflows/release.yml`)가 그 태그를 받아 npm에 배포한다.

> release-it은 유지보수자가 터미널에서 직접 실행한다. 에이전트는 실행하지 않는다.

위험도: 높음

롤백: 불가. npm에 한 번 올라간 버전은 덮어쓸 수 없다. 문제가 생기면 다음 patch 버전으로 고친다. 태그를 올리는 순간 배포가 시작되니 그 전에 한 번 더 확인한다.

## 처음 한 번만 하는 설정

npm 토큰 대신 trusted publishing(OIDC)으로 인증한다. npmjs.com의 `@cp949/vectra` 패키지 Settings에서 Trusted Publisher를 아래 값으로 추가한다.

| 항목 | 값 |
| --- | --- |
| Publisher | GitHub Actions |
| Organization or user | `cp949` |
| Repository | `vectra` |
| Workflow filename | `release.yml` |

워크플로 파일 이름을 바꾸면 여기 등록한 값도 같이 바꿔야 한다.

## 준비

- Node.js `>=24.18.0`과 루트 `package.json`의 `packageManager`에 적힌 pnpm을 쓴다.
- `main` 브랜치에서 시작한다. 태그가 가리키는 커밋이 `main`에 없으면 워크플로가 배포하지 않는다.
- 커밋하지 않은 변경이 남아 있으면 release-it이 시작하지 않는다.
- `CHANGELOG.md`의 `## [Unreleased]` 아래에 이번 배포 내용을 적어 둔다. 비어 있으면 release-it이 멈춘다.

## 배포하기

저장소 루트에서 실행한다.

```sh
# 실제로 바꾸지 않고 흐름만 확인한다
pnpm release-it --dry-run

# 배포한다
pnpm release-it
```

`pnpm release-it`은 `sub/vectra`에서 release-it을 실행한다. 버전 종류를 인자로 넘길 수도 있다. 예: `pnpm release-it patch`, `pnpm release-it minor`.

release-it은 단계마다 확인을 받으면서 다음 순서로 진행한다.

1. **배포 전 검사.** `pnpm release:check`를 실행한다. 전체 검증(`verify`), 계약 테스트, 패키지 lint, `npm pack --dry-run`을 차례로 돌리고, 하나라도 실패하면 멈춘다. 실패하면 로그 마지막 100줄과 전체 로그 파일 경로를 보여 준다.
2. **버전 선택.** 고른 버전이 `sub/vectra/package.json`에 들어간다.
3. **CHANGELOG 정리.** `[Unreleased]` 내용을 `[<버전>] - <날짜>` 절로 옮기고 빈 `[Unreleased]`를 새로 만든다. 파일 끝의 버전 비교 링크도 새 버전에 맞게 고친다.
4. **커밋과 태그.** `chore: @cp949/vectra v<버전> 배포` 커밋과 `v<버전>` 태그를 만들어 `origin`에 올린다.

release-it은 npm에 직접 배포하지 않고 GitHub Release도 만들지 않는다. 설정은 [`sub/vectra/.release-it.json`](sub/vectra/.release-it.json)에 있다.

설정의 hook 명령을 고칠 때는 `${`를 쓰지 않는다. release-it이 hook 문자열을 템플릿으로 해석하기 때문에 `${TMPDIR:-/tmp}` 같은 shell 문법이 깨진다.

## GitHub Actions 배포

`v*` 태그가 올라오면 `release.yml`이 다음 순서로 실행된다.

1. 태그가 가리키는 커밋이 `main`에 있는지 확인한다.
2. 태그 이름과 `sub/vectra/package.json`의 버전이 같은지 확인한다.
3. `pnpm release:check`를 다시 실행한다.
4. `npm publish --provenance --access public`으로 배포한다. 이때 `prepublishOnly`가 `dist`와 `llm.txt`를 다시 빌드한다.

앞의 확인 중 하나라도 실패하면 배포하지 않는다. 배포가 끝나면 Actions의 Release 실행 결과와 `npm view @cp949/vectra version`으로 확인한다.

Actions 화면에서 워크플로를 직접 실행(`workflow_dispatch`)하면 실제 배포 없이 검사와 `npm publish --dry-run`만 한다.

## 실패했을 때

- **release-it이 태그를 올리기 전에 멈춘 경우.** 에러나 Ctrl+C로 멈추면 release-it이 만든 커밋과 태그를 스스로 되돌린다. 원인을 고친 뒤 `pnpm release-it`을 다시 실행한다.
- **커밋과 태그는 만들었는데 올리기만 실패한 경우.** release-it이 `The package might have been released, but git push failed.`를 출력한다. 로컬에 남은 커밋과 태그를 `git push --follow-tags`로 다시 올린다. 태그가 올라가야 배포가 시작된다.
- **워크플로가 배포 전에 실패한 경우.** `main`에 없는 커밋, 버전 불일치, `release:check` 실패가 여기에 해당한다. npm에는 아무것도 올라가지 않았다. 원인을 고친 뒤 새 patch 버전으로 다시 배포한다. 같은 버전으로 다시 하려면 원격 태그를 지우고 새로 만들어야 하는데, 이건 따로 확인이 필요한 위험한 작업이다.
- **워크플로가 publish 단계에서 실패한 경우.** 먼저 `npm view @cp949/vectra versions`로 해당 버전이 올라갔는지 본다. 올라갔다면 되돌리지 말고 다음 patch 버전으로 고친다. 올라가지 않았다면 Actions에서 실패한 실행을 다시 돌린다.
- **같은 버전이 이미 npm에 있는 경우.** 지우거나 덮어쓰지 말고 다음 patch 버전으로 배포한다.
