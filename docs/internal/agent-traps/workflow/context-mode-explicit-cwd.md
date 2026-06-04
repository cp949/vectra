# context-mode 명령은 저장소 cwd를 명시한다

## 함정

`ctx_execute`, `ctx_batch_execute`가 현재 agent shell의 cwd를 자동으로 상속한다고 가정하고 저장소 상대 경로 명령을 실행한다.

## 증상

- `pnpm examples:coverage`가 `Command "examples:coverage" not found`로 실패한다.
- `sed apps/...`, `rg apps/...`가 `No such file or directory`로 실패한다.
- 실제 원인은 명령이 저장소 루트가 아니라 plugin/runtime cwd에서 실행된 것이다.

## 방지

`context-mode` 명령에는 저장소 루트를 명시한다.

```sh
cd /work/jjfive/vectra && pnpm examples:coverage
cd /work/jjfive/vectra && pnpm --filter @repo/pixi-demo test
```

큰 출력 처리를 위해 `context-mode`를 쓰더라도 repo-relative command에는 `cd <repo-root> &&`를 붙인다.
