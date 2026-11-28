# built dist contract test: literal string import와 test 실행 순서

태그: `contract-test`, `dist`, `typecheck`, `turbo`, `vitest`

## 함정

built `dist/` 파일을 검증하는 contract test에서 `import('../../dist/vec/index.js')`처럼 literal
string으로 dynamic import를 쓰면 TypeScript가 정적으로 모듈을 해석하려 한다. `dist/`는
`.gitignore`로 추적하지 않고 `tsconfig.json`의 `exclude`에 들어 있어, clean state(fresh clone,
`pnpm clean` 직후)에서는 `error TS2307: Cannot find module '../../dist/vec/index.js'`로 typecheck가
항상 실패한다.

Turborepo의 기본 `test` task는 의존 패키지의 `^build`에만 의존한다. 같은 패키지의
`build`는 `pnpm verify`의 기본 테스트보다 먼저 끝난다는 보장이 없다. dist가 없으면
runtime dynamic import가 실패하고, 이전 빌드가 남으면 오래된 산출물을 검사할 수 있다.

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

   저장소 루트에서 `pnpm test:contract`를 실행한다. 이 명령은 같은 패키지의 build를
   먼저 실행한 뒤 계약 테스트를 실행한다. `pnpm --filter @cp949/vectra test:contract`는
   패키지 스크립트를 직접 실행하므로 build를 선행하지 않는다.

   현재 Vectra의 기본 Vitest 설정도 `tests/contract`를 수집하므로, 기본 테스트를 단독으로
   실행할 때는 최신 dist를 먼저 빌드하거나 dist에 의존하지 않는 테스트 경로를 지정한다.

3. **두 contract test 파일이 동일한 함수 목록을 공유하면 drift 위험**

   같은 함수 목록을 여러 파일에 직접 적지 말고 `tests/contract/_fixtures/` 같은 공유 fixture에
   두고 import한다.
