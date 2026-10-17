# @cp949/vectra 배포

이 문서는 `@cp949/vectra`를 npm에 배포하는 유지보수자용 절차다.
배포는 [release-it](https://github.com/release-it/release-it)으로 진행한다.

위험도: 높음

롤백: npm에 배포된 동일 버전은 덮어쓰지 않는다. 문제가 있으면 다음 patch 버전으로 교정한다. 원격 태그 삭제는 가능하지만 별도의 위험 작업이다.

> release-it은 유지보수자가 터미널에서 직접 실행한다. 에이전트는 실행하지 않는다.

## 전제 조건

- 루트에서 Node.js `>=24.18`과 pnpm `10.17.1`을 사용한다.
- npm registry, 로그인, `@cp949` scope 배포 권한을 확인한다.
- 배포 대상 코드를 커밋하고 작업 트리를 깨끗하게 유지한다. release-it이 dirty working tree에서 중단한다.
- 현재 branch에 upstream이 있고 `origin` push 권한이 있어야 한다.
- 루트 `CHANGELOG.md`의 `## [Unreleased]` 아래에 이번 배포 항목을 적는다. 비어 있으면 release-it이 중단한다.

```sh
npm config get registry
npm whoami
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
5. `pnpm publish . --tag <dist-tag> --access public --no-git-checks`를 실행한다. 일반 버전의 dist-tag는 `latest`다. `prepublishOnly`가 `dist`를 다시 빌드한다. 2FA가 켜져 있으면 pnpm이 OTP 입력 또는 web 인증을 요청한다.
   - `--no-git-checks`가 필요한 이유: 이 시점에는 bump 변경이 stage만 된 상태다. pnpm의 기본 배포 branch 검사가 `main` 외 branch 배포를 막는다.
6. `chore: @cp949/vectra v<version> 배포` 커밋, annotated tag `v<version>` 생성, `origin`에 push(`--follow-tags`)를 수행한다.

publish가 git commit·tag보다 먼저 실행된다(release-it 21 lifecycle).

각 단계 전에 release-it이 확인 프롬프트를 띄운다. GitHub Release는 만들지 않는다.

설정 파일: [`sub/vectra/.release-it.json`](sub/vectra/.release-it.json)

## API 문서 생성

API reference는 로컬에서 생성한다. 배포하지 않는다. 생성기는 `sub/api-docs`(typedoc)다.

- 생성: `pnpm --filter @repo/api-docs docs:api`. 결과는 `sub/api-docs/docs-api/`다. Git에서 제외한다.
- 확인: `docs-api/index.html`을 브라우저로 연다.

typedoc을 `sub/vectra`에 두지 않는 이유:

- typedoc 0.28은 TypeScript `<=6.0.x`만 지원한다. `sub/vectra`는 TypeScript 7을 쓴다.
- TypeScript 7과 같이 실행하면 typedoc이 시작 단계에서 죽는다.
- `sub/api-docs`가 TypeScript `~6.0.3`을 따로 가진다.

문서 대상 모듈은 `sub/vectra/package.json`의 `exports`에서 읽는다. 새 domain subpath를 추가하면 문서에도 자동으로 들어간다.

## 실패 후 조치

release-it은 push 성공 전에 종료되면(에러, Ctrl+C) 로컬 변경을 자동 rollback한다.
만든 태그를 지우고 `git reset --hard`(커밋했으면 `HEAD~1`)로 되돌린다.
작업 트리가 깨끗한 상태에서만 시작하므로 사용자 변경은 사라지지 않는다.

- **publish 전에 중단 / publish 실패, registry에 해당 버전 없음**: 자동 rollback된다. 원인을 해결하고 `pnpm release-it`을 다시 실행한다.
- **registry에 해당 버전이 이미 존재**: 제거하거나 덮어쓰지 말고 다음 patch 버전으로 교정한다.
- **publish 성공 후 push 실패**: release-it이 rollback을 끄고 `The package might have been released, but git push failed.`를 출력한다. 로컬 커밋·태그가 남아 있으므로 `git push --follow-tags`로 재시도한다.
- **publish 성공 후 commit·tag 단계에서 중단**: 자동 rollback이 bump 변경을 지운다. registry에는 이미 배포됐으므로 되돌리지 말고 `git status`와 `npm view @cp949/vectra version`을 확인한 뒤 bump 커밋·태그를 수동으로 만든다.

  ```sh
  cd sub/vectra
  npm version <version> --no-git-tag-version   # bump가 rollback된 경우
  # 루트 CHANGELOG.md의 [Unreleased]를 [<version>] - <날짜>로 수동 정리
  # 파일 끝 [Unreleased] 링크를 compare/v<version>...HEAD로 고치고 [<version>] 링크를 추가
  git commit -am "chore: @cp949/vectra v<version> 배포"
  git tag -a v<version> -m "@cp949/vectra v<version>"
  git push --follow-tags
  ```
