# @cp949/vectra 배포

이 문서는 `@cp949/vectra`를 npm에 배포하는 유지보수자용 절차다.
버전 올림, 커밋, 태그 생성, push는 [release-it](https://github.com/release-it/release-it)이 한다.
npm 배포는 `v*` 태그 push에서 GitHub Actions(`.github/workflows/release.yml`)가 한다.

위험도: 높음

롤백: 불가. npm에 배포된 동일 버전은 덮어쓰지 않는다. 문제가 있으면 다음 patch 버전으로 교정한다. 원격 태그 삭제는 가능하지만 별도의 위험 작업이다. 태그를 push하면 배포가 시작되므로 push 전에 확인한다.

> release-it은 유지보수자가 터미널에서 직접 실행한다. 에이전트는 실행하지 않는다.

## 최초 1회 설정

npm 토큰은 쓰지 않는다. trusted publishing(OIDC)으로 인증한다.

1. npmjs.com의 `@cp949/vectra` 패키지 Settings에서 Trusted Publisher를 추가한다.
2. Publisher는 GitHub Actions, Organization or user는 `cp949`, Repository는 `vectra`, Workflow filename은 `release.yml`로 입력한다.
3. `release.yml` 파일명을 바꾸면 등록도 바꾼다.

## 전제 조건

- 루트에서 Node.js `>=24.18`과 `package.json`의 `packageManager`가 지정한 pnpm을 사용한다.
- 배포 대상 코드를 커밋하고 작업 트리를 깨끗하게 유지한다. release-it이 dirty working tree에서 중단한다.
- `main`에서 실행한다. 태그 커밋이 `main`에 없으면 워크플로가 배포하지 않는다.
- 현재 branch에 upstream이 있고 `origin` push 권한이 있어야 한다.
- 루트 `CHANGELOG.md`의 `## [Unreleased]` 아래에 이번 배포 항목을 적는다. 비어 있으면 release-it이 중단한다.

```sh
git status --short
```

## 배포

루트에서 실행한다.

```sh
# 실제 변경 없이 흐름만 확인
pnpm release-it --dry-run

# 배포
pnpm release-it
```

`pnpm release-it`은 `sub/vectra`로 이동해 release-it을 실행한다.
추가 인자는 그대로 전달된다. 예: `pnpm release-it patch`, `pnpm release-it minor`.

release-it이 수행하는 순서:

1. `before:init` hook. 루트에서 `pnpm release:check`를 실행한다. `verify`(빌드 포함), `test:contract`, `lint:package`, `npm pack --dry-run`을 차례로 수행하고, 하나라도 실패하면 중단한다.
   - 출력은 `mktemp` 임시 파일로 보낸다. release-it의 출력 버퍼 1 MB를 넘기지 않기 위해서다.
   - 실패하면 마지막 100줄과 전체 로그 경로를 보여 준다. 성공하면 로그를 지운다.
   - hook 문자열에 `${`를 쓰지 않는다. release-it이 hook을 Eta 템플릿(`${...}`)으로 렌더링한다. `${TMPDIR:-/tmp}` 같은 shell 문법은 렌더링 단계에서 실패한다.
2. 버전 선택 프롬프트. `sub/vectra/package.json`의 `version`을 올린다.
3. 루트 `CHANGELOG.md`의 `[Unreleased]` 항목을 `[<version>] - <날짜>` 섹션으로 옮기고, 빈 `[Unreleased]`를 다시 둔다.
   - 파일 끝 링크 정의도 고친다(`addVersionUrl`).
     - `[Unreleased]`가 `compare/v<version>...HEAD`를 가리키게 고친다.
     - `[<version>]` 링크를 `[<이전 version>]` 링크 바로 위에 추가한다. 주소는 `compare/v<이전 version>...v<version>`이다.
     - `<이전 version>`은 HEAD에서 닿는 최신 `v*` tag다.
4. 변경 파일을 stage한다. `sub/vectra` 범위는 `git add . --update`로, 루트 `CHANGELOG.md`는 `before:release` hook이 stage한다. keep-a-changelog가 `beforeRelease` 단계에서 파일을 쓰므로, 그보다 늦은 이 hook이어야 변경이 잡힌다.
5. `chore: @cp949/vectra v<version> 배포` 커밋, annotated tag `v<version>` 생성, `origin`에 push(`--follow-tags`)를 수행한다.
6. 태그 push가 `release.yml`을 실행한다. 워크플로 순서는 아래와 같다.
   - 태그 커밋이 `origin/main`에 있는지 확인한다.
   - 태그와 `sub/vectra/package.json`의 `version`이 같은지 확인한다.
   - `pnpm release:check`를 실행한다.
   - `npm publish --provenance --access public`으로 배포한다. `prepublishOnly`가 `dist`를 다시 빌드한다.

release-it은 publish하지 않는다(`npm.publish: false`). 배포 결과는 GitHub Actions의 Release 실행과 `npm view @cp949/vectra version`으로 확인한다.

워크플로를 수동 실행(`workflow_dispatch`)하면 배포 없이 검증과 `npm publish --dry-run`만 한다.

각 단계 전에 release-it이 확인 프롬프트를 띄운다. GitHub Release는 만들지 않는다.

설정 파일: [`sub/vectra/.release-it.json`](sub/vectra/.release-it.json)

## 실패 후 조치

release-it은 push 성공 전에 종료되면(에러, Ctrl+C) 로컬 변경을 자동 rollback한다.
만든 태그를 지우고 `git reset --hard`(커밋했으면 `HEAD~1`)로 되돌린다.
작업 트리가 깨끗한 상태에서만 시작하므로 사용자 변경은 사라지지 않는다.

- **release-it이 push 전에 중단**: 자동 rollback된다. 원인을 해결하고 `pnpm release-it`을 다시 실행한다.
- **push 성공 후 release-it의 push 실패**: release-it이 `The package might have been released, but git push failed.`를 출력한다. 로컬 커밋·태그가 남아 있으므로 `git push --follow-tags`로 재시도한다. 태그가 올라가야 배포가 시작된다.
- **워크플로가 publish 전에 실패**(main 미포함, 버전 불일치, `release:check` 실패): npm에는 배포되지 않았다. 원인을 해결하고 새 patch 버전으로 다시 배포하거나, 같은 버전을 재시도하려면 원격 태그를 지우고 고친 커밋에 다시 만든다. 태그 삭제는 별도의 위험 작업이다.
- **워크플로가 publish 단계에서 실패**: `npm view @cp949/vectra versions`로 해당 버전이 올라갔는지 먼저 확인한다. 올라갔으면 되돌리지 말고 다음 patch 버전으로 교정한다. 올라가지 않았으면 Actions에서 실패한 실행을 다시 실행한다.
- **registry에 해당 버전이 이미 존재**: 제거하거나 덮어쓰지 말고 다음 patch 버전으로 교정한다.
