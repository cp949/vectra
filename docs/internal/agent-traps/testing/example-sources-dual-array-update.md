# example-sources.test.ts는 갱신할 배열이 2개다

태그: `testing`, `examples`, `pixi-demo`

## 함정

새 pixi 예제를 추가할 때 `apps/pixi-demo/src/examples/example-sources.test.ts`에서 `import`와
`*.source.code` 비교만 추가하고, 예제 목록 배열을 하나만 갱신한다. 이 파일에는 갱신해야 할 배열이
**두 개**다.

1. `assertUniqueExampleIds([... , fooExample])` — 예제 객체 목록.
2. `expect(EXAMPLES.map((example) => [example.id, example.categoryId])).toEqual([... , ['foo', 'geometry']])`
   — `[id, categoryId]` 순서 목록.

첫 번째만 갱신하고 두 번째를 놓치면 `EXAMPLES.map(...).toEqual([...])`가 실제 catalog 길이와
기대 배열 길이가 어긋나 실패한다.

## 증상

`pnpm --filter @repo/pixi-demo test`에서 `example-sources.test.ts`가 다음처럼 실패한다.

```txt
+   [
+     "segment-segment-cross",
+     "geometry",
+   ],
  ]
 ❯ src/examples/example-sources.test.ts:170:73
     expect(EXAMPLES.map((example) => [example.id, example.categoryId])…
```

추가한 예제가 actual 쪽에만 있고 expected 쪽에 없다는 diff로 드러난다.

## 방지

새 pixi 예제를 추가하면 `example-sources.test.ts`에서 네 곳을 모두 갱신한다.

- `import { fooExample } from './foo';`
- `import fooCode from './foo/source.exam.ts?raw';`
- `assertUniqueExampleIds([...])` 목록에 `fooExample`
- `EXAMPLES.map(...).toEqual([...])` 순서 목록에 `['foo', '<categoryId>']`
- `expect(fooExample.source.code).toBe(fooCode)` 비교
- (필요 시) `g.text(` 미사용 가드, 단일 흐름 가드

두 배열은 `circle-circle-overlap` 같은 직전 예제를 grep해 추가 위치를 함께 찾으면 한쪽을 빠뜨리지
않는다.

## 관련 작업

- `_works/S1-RM-013/20260525-73-segment-segment-cross-example/`에서 발견. `assertUniqueExampleIds`
  목록만 갱신하고 `[id, categoryId]` 순서 목록을 놓쳐 test 1건 실패 → 순서 목록에 항목 추가 후 통과.
