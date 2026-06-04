# built dist contract test: literal string import와 test 실행 순서

태그: `contract-test`, `dist`, `typecheck`, `turbo`, `vitest`

## 함정

built `dist/` 파일을 검증하는 contract test에서 `import('../../dist/vec/index.js')`처럼 literal
string으로 dynamic import를 쓰면 TypeScript가 정적으로 모듈을 해석하려 한다. `dist/`는
`.gitignore`로 추적하지 않고 `tsconfig.json`의 `exclude`에 들어 있어, clean state(fresh clone,
`pnpm clean` 직후)에서는 `error TS2307: Cannot find module '../../dist/vec/index.js'`로 typecheck가
항상 실패한다.

또한 같은 test 파일을 default `tests/` 디렉터리에 두면 Turborepo `test` task가 같은 package의
`build`에 의존하지 않아 `pnpm verify`에서 test와 build가 병렬로 실행된다. dist가 없거나 stale한
상태에서 test가 먼저 시작하면 runtime dynamic import도 실패한다.

## 증상

```
vectra:typecheck: tests/contract/package-imports.test.ts(28,54):
  error TS2307: Cannot find module '../../dist/vec/index.js'
```

turbo cache가 살아 있거나 dist가 이미 빌드된 상태에서만 우연히 통과한다.

## 방지

1. **literal string 대신 template literal 또는 변수로 dynamic import**

   ```ts
   // 잘못된 예: TypeScript 정적 해석 대상이 된다
   const mod = await import('../../dist/vec/index.js');

   // 올바른 예: @vite-ignore 주석과 template literal 또는 변수로 정적 해석을 방지한다
   const barrelPath = `../../dist/vec/index.js`;
   const mod = await import(/* @vite-ignore */ barrelPath);
   ```

2. **built dist 의존 test는 `test:contract` script로 분리하고 build 의존을 명시**

   `test:contract` script는 `tests/contract` 디렉터리를 positional 경로 인자로 실행하도록 구성한다.
   `turbo.json`에서 `test:contract` task에 같은 package의 `build`를 `dependsOn`으로 추가한다.

   ```json
   "test:contract": {
     "dependsOn": ["build"],
     "outputs": [],
     "inputs": ["dist/**", "tests/**/*.ts", "package.json", "vitest.config.*"]
   }
   ```

   default `test`에서 contract test가 dist 없이 실행되는 것을 막는 방법은 두 가지가 있다.

   **2a. turbo `test` task에 same-package `build`를 `dependsOn`으로 추가한다 (현 vectra 구성)**

   `turbo.json`의 `test` task에 `"build"`를 추가하면 default `pnpm test`에서도 build가 선행된다.
   `vitest.config.ts`는 `include: ['tests/**/*.test.ts']`로 단순하게 유지할 수 있다.

   ```json
   "test": {
     "dependsOn": ["^build", "build"],
     ...
   }
   ```

   **2b. vitest config의 `include`/`exclude`로 default `test`에서 contract test를 제외한다**

   `vitest.config.ts`에서 `tests/contract` 디렉터리를 `exclude`하거나 `include` 패턴을 좁혀
   default `test`에서 contract test가 실행되지 않도록 한다. `test:contract` script만 해당
   디렉터리를 실행한다.

3. **두 contract test 파일이 동일한 함수 목록을 공유하면 drift 위험**

   같은 함수 목록을 여러 파일에 직접 적지 말고 `tests/contract/_fixtures/` 같은 공유 fixture에
   두고 import한다.

## 관련 작업

- `_works/S1-RM-004/20260516-01-vec-docs-contract/함정.md`
- `_works/S1-RM-004/20260516-01-vec-docs-contract/TASK-03-package-export-contract.md`
