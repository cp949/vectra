# 예제 index.ts description 한 줄 강제 (biome format)

태그: `examples`, `biome`, `format`, `verify`

## 함정

새 예제 `index.ts`의 `PlaygroundExample.description`을 가독성 때문에 여러 줄로 나눠 쓴다.

```ts
export const fooExample: PlaygroundExample<PixiRuntimeSeed> = {
  id: 'foo',
  title: 'Foo',
  description:
    'probe를 drag하면 ... 강조한다',   // ← 두 줄로 나눠 씀
  categoryId: 'math',
  ...
};
```

biome는 string이 print width(line-width) 안에 들어가면 한 줄로 collapse하고, 넘치면 두 줄로
wrap한다. 즉 양방향 모두 강제된다.

- 짧은 description을 손으로 두 줄로 나누면 → biome가 한 줄로 collapse 요구.
- 긴 description을 한 줄로 쓰면 → biome가 `description:` + 다음 줄 문자열로 wrap 요구.

어느 쪽이든 손으로 맞추려 하지 말고 format에 맡긴다.

## 증상

`pnpm verify`에서 `@repo/pixi-demo:format:check`가 실패하고 turbo가 같은 캐시 그룹의 typecheck/
build/lint까지 연쇄 ELIFECYCLE로 막는다.

```txt
@repo/pixi-demo:format:check:     17    │ - ··description:
@repo/pixi-demo:format:check:     18    │ - ····'...'
@repo/pixi-demo:format:check:        17 │ + ··description: '...'
@repo/pixi-demo:format:check: Found 1 error.
```

## 방지

- 예제 `index.ts`를 새로 쓰거나 고친 직후 `pnpm --filter @repo/pixi-demo format`을 먼저 실행해
  정규화한다(`pnpm verify` 전에).
- `description`은 처음부터 한 줄로 작성한다. 길어서 wrap이 필요하면 biome가 알아서 wrap하므로
  손으로 나누지 않는다.
- `source.exam.ts`는 raw code로 테스트에 박히므로(`toBe(rawCode)`) 이미 정규화된 형태로 쓰고,
  format이 source를 바꾸면 raw 비교 테스트가 깨지지 않도록 format 후 상태를 커밋한다.

## 관련 작업

- `_works/S1-RM-013/20260524-45-vec-quadrant-example/`에서 재발(2회차). `vec-quadrant/index.ts`
  description을 두 줄로 써 format:check 실패 → `pnpm format`으로 한 줄 정규화 후 통과.
- `_works/S1-RM-013/20260524-50-vec-orthogonal-check-example/`에서 재발(3회차). 이번엔 반대
  방향으로, description을 한 줄로 썼지만 길이가 print width를 넘어 biome가 두 줄 wrap을 요구해
  format:check 실패. "format을 verify 전에 먼저 실행"이라는 기존 방지책을 건너뛴 것이 원인.
  새 예제 index.ts를 건드린 직후 무조건 `pnpm --filter @repo/pixi-demo format`을 먼저 돌린다.
- `_works/S1-RM-013/20260524-60-bernoulli-trial-tally-example/`에서 재발(4회차). 이번엔
  `index.ts` description이 아니라 `source.exam.ts`의 method chaining
  (`g.moveTo(...).lineTo(...).stroke(...)`)이 line-width를 넘어 biome가 세 줄로 wrap을 요구해
  format:check 실패. 즉 이 함정은 description뿐 아니라 예제 source 전체에 적용된다. 방지책은 동일:
  예제 파일을 쓴 직후 `pnpm format`을 `pnpm verify` 전에 무조건 먼저 실행한다.
- `_works/S1-RM-013/20260524-62-constrain-drag-axis-lock-example/`에서 재발(5회차). 이번엔
  `source.exam.ts`의 arrow 함수 본문을 가독성 때문에 두 줄로 나눠 썼는데(`const insideBox = (p) =>`
  + 다음 줄 표현식) 표현식이 line-width 안에 들어가 biome가 한 줄 collapse를 요구. 방지책 동일.
- `_works/S1-RM-013/20260525-73-segment-segment-cross-example/`에서 재발(6회차). 이번엔
  `source.exam.ts`의 `label.text = [...].join('\n')` 배열 리터럴을 가독성 때문에 항목마다 줄바꿈해
  썼는데 한 줄에 들어가 biome가 한 줄 collapse를 요구. 방지책 동일: 예제 파일을 쓴 직후 `pnpm format`을
  `pnpm verify` 전에 먼저 실행한다.
