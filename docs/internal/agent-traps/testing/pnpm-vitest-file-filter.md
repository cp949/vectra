# pnpm script 인자 전달: Vitest 파일 필터 앞에 두 번째 `--`를 넣지 않는다

태그: `pnpm`, `vitest`, `test-filter`, `verification`

## 함정

`pnpm --filter <pkg> test -- <테스트경로>` 형태는 `vitest run`의 단일 파일 필터로 동작하지 않을 수
있다. focused test를 실행했다고 생각했는데 실제로는 전체 test suite가 실행되어, 검증 결과를
잘못 기록하게 된다.

## 증상

다음 명령을 실행했을 때 특정 파일 하나만 실행되기를 기대한다.

```sh
pnpm --filter @cp949/vectra test -- tests/unit/vec/measurement.test.ts
```

하지만 결과가 여러 검증 항목에서 모두 같은 파일 수와 테스트 수로 반복된다.

```txt
8 files, 125 tests
```

이 경우 focused 검증이 된 것처럼 보이지만 실제로는 전체 suite가 반복 실행된 것이다.

## 방지

focused 실행이 목적이면 test script 뒤에 파일 경로를 바로 붙인다.

```sh
pnpm --filter @cp949/vectra test tests/unit/vec/measurement.test.ts
```

workspace package에 `--filter`를 붙인 경우 파일 경로는 package root 기준으로 적는다. 예를 들어
`@repo/pixi-demo`의 `apps/pixi-demo/src/examples/example-sources.test.ts`를 실행할 때는 루트 기준
전체 경로가 아니라 package 내부 경로를 쓴다.

```sh
pnpm --filter @repo/pixi-demo test src/examples/example-sources.test.ts
```

검증 결과 문서에 focused test 항목이 여러 개 있는데 모두 동일한 file/test 수가 나오면,
파일 필터가 실제로 적용되었는지 다시 확인한다.

## 관련 작업

- `_works/S1-RM-003/20260516-01-vec-measurement/함정.md`
- `_works/S1-RM-013/20260524-29-bezier-intersection-workbench-example/함정.md`
