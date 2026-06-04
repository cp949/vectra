# leaf export 알파벳 정렬은 ASCII 순서: 대문자가 소문자보다 앞

태그: `barrel`, `contract-fixture`, `biome`, `package-surface`

## 함정

`sub/vectra/src/<domain>/index.ts` barrel과 `sub/vectra/tests/contract/_fixtures/<domain>-leaf-exports.ts`
single-source-of-truth fixture에 새 export를 추가할 때 "알파벳 순서"를 lowercase 직관으로
해석하면 잘못된 위치에 배치하기 쉽다. biome `organizeImports`는 ASCII 코드 순서를 사용하며,
ASCII에서 대문자 `A`-`Z` (65-90)는 모두 소문자 `a`-`z` (97-122)보다 앞이다.

예: `toSquare` vs `top` 비교 시
- ASCII 순서: `toSquare` < `top` (3번째 글자에서 `S`(83) < `p`(112))
- lowercase 직관 순서: `top` < `tosquare`

따라서 `toSquare`/`toSquareInto`는 `top`/`topLeftInto`/`topRightInto`보다 앞에 와야 한다.

같은 함정이 `bottomLeft` vs `bounds`, `circleFrom` vs `circle`, `fromX` vs `from-X` 같은
다른 대소문자 비교에서도 발생한다.

## 증상

- `pnpm lint` (biome check)가 barrel `index.ts`의 export 순서를 ASCII로 재정렬하라고 요구한다.
  `linter/style/useSortedKeys`나 import organize 규칙이 reorder를 강제한다.
- contract test (`tests/contract/<domain>-subpaths.test.ts`)의 양방향 일치 테스트가 fixture
  순서와 실제 export 순서 불일치로 실패할 수 있다. fixture 순서를 lowercase로 두고 barrel만
  ASCII로 정렬하면 양쪽이 어긋난다.
- staging 단계에서 자동 formatter가 한 파일만 ASCII로 reorder하고 다른 파일은 그대로 두면
  단위 diff가 예상보다 크게 보인다.

## 방지

- 새 entry를 추가할 때 ASCII 순서를 명시적으로 따른다 (대문자 < 소문자).
  의심스러우면 기존 파일에서 인접 entry의 정렬을 직접 확인한다.
- staging 전에 `pnpm format && pnpm lint`를 한 번 실행해 biome가 reorder를 요구하지 않는지
  확인한다.
- barrel과 fixture를 같은 정렬 규칙으로 유지한다. 한 쪽만 ASCII이고 다른 쪽이 lowercase면
  contract test가 실패한다.
- 비교 직관:
  - 같은 prefix까지는 한 글자씩 ASCII 코드로 비교.
  - 한 쪽에 글자가 부족하면 짧은 쪽이 앞 (예: `fit` < `fitInside`).
  - 대소문자 섞일 때만 ASCII 트랩이 작동. 둘 다 lowercase면 직관과 ASCII가 일치.

## 관련 작업

- `_works/S3-RM-025/20260522-01-bounds-rect-follow-up/함정.md` — `rect/index.ts`에 `toSquare`/`toSquareInto` 추가 시 발견.
