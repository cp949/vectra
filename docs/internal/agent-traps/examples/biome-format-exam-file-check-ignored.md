# 예제 `source.exam.ts` 포맷 수정은 `biome check`가 아니라 `biome format`으로 한다

태그: `examples`, `testing`, `biome`

## 함정

예제 `source.exam.ts`를 새로 쓴 뒤 `pnpm verify`를 돌리면 `@repo/<app>:format:check`가 실패할 수
있다. `format:check` 스크립트는 `biome format src`라 `.exam.ts`를 그대로 검사한다. 특히 Pixi
Graphics 체인(`g.moveTo(...).lineTo(...).stroke(...)`)을 한 줄로 적으면 줄 길이를 넘겨 biome가
멀티라인으로 재포맷하려 하고, 검사에서 차이가 잡힌다.

그런데 이 차이를 고치려고 `biome check --write <예제 경로>`를 실행하면 경로가 무시된다.

```txt
× No files were processed in the specified paths.
i These paths were provided but ignored:
- apps/<app>/src/examples/<id>
```

`check`(linter+formatter+assist)는 예제 디렉터리를 ignore하지만 `format` 서브커맨드는 `.exam.ts`를
포맷한다. 그래서 `check --write`로는 예제 포맷이 영원히 안 고쳐지고 `format:check`가 계속 실패한다.

## 회피

예제 파일 포맷은 `format` 서브커맨드로 고친다.

```sh
pnpm --filter @repo/<app> exec biome format --write src/examples/<id>/source.exam.ts
```

또는 패키지 `format` 스크립트(`biome check --write src`) 대신, 검증 전에 위 명령으로 예제 파일만
포맷한다. 작성 단계에서 긴 Graphics 체인은 미리 멀티라인으로 끊어두면 재포맷 차이가 생기지 않는다.
