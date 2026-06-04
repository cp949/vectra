# random helper의 rng 반환 boundary 테스트 누락

태그: `testing`, `coverage`, `random`, `rng`, `boundary`

## 함정

`rng?: RandomSource`를 받는 random helper의 deterministic 테스트가 rng 반환값을 "중간 값"
(`0.25`, `0.5`, `0.75`)만 쓰고 boundary value (`0`, 또는 `1`에 매우 가까운 값)에서 어떤
분기가 일어나는지 검증하지 않는다.

`Math.log(u)`, `Math.floor(u * n)`, `Math.sqrt(u)` 같은 변환을 거치는 함수는 `u === 0`과
`u → 1`에서 분기 동작이 달라진다.

```ts
// 함정: 중간 값만 검증
test('가중치 순서대로 반환한다', () => {
  const rng = sequence([0.5, 0.2, 0.8]);  // 모두 (0, 1) 중간 값
  const result = weightedShuffle(['a', 'b', 'c'], [1, 3, 2], rng);
  expect(result).toEqual(['c', 'b', 'a']);
});
// rng = 0 케이스 없음 → Math.log(0) = -Infinity 분기 회귀를 잡지 못한다
```

## 증상

- `RandomSource` contract는 `[0, 1)`이므로 caller가 `0`을 반환할 수 있는데, 함수 내부의
  `Math.log(u)` / `Math.sqrt(u)` / `1 / u` 같은 변환은 `u === 0`에서 특이값을 만든다.
- key/score 기반 정렬 (Efraimidis-Spirakis 같은 weighted permutation)에서 `-Infinity` key가
  정렬 안정성에 영향을 준다. 다중 항목이 모두 `-Infinity` key를 가지면 비교가 `NaN`이 되어
  정렬 순서가 implementation-defined가 된다.
- `Math.floor(rng() * n)`은 `rng() === 0`이면 `0`, `rng() → 1`이면 `n - 1`을 반환한다.
  두 경계 모두 검증하지 않으면 off-by-one bug 회귀를 잡지 못한다.
- caller 책임 정책("rng 반환은 clamp/normalize하지 않는다")이 JSDoc에 적혀 있어도, 실제
  boundary 동작이 회귀해도 테스트가 침묵한다.

## 방지

`rng?: RandomSource`를 받는 random helper에 deterministic 테스트를 추가할 때 다음을 함께 둔다.

1. **rng = 0 경계**: `sequence([0, ...])` 한 케이스를 추가해 `u === 0`에서 어떤 결과가
   나오는지를 단정한다. `Math.log(0) = -Infinity` 또는 `Math.floor(0 * n) = 0` 같은 분기를
   명시적으로 검증한다.
2. **rng → 1 경계 (해당하는 경우)**: `Math.floor(rng() * n)`처럼 상한 mapping이 있는 함수는
   `0.999...` 같은 1에 매우 가까운 값을 한 케이스 둔다. `n - 1`이 정확히 나오는지 검증해
   `Math.floor(rng() * n) === n` 같은 off-by-one 회귀를 막는다.
3. **caller 책임 정책의 한계 메모**: rng가 음수 또는 `>=1`을 반환하는 경우는 `RandomSource`
   contract 위반이므로 테스트하지 않는다. 단, JSDoc에 "implementation-defined" 또는
   "caller 책임"으로 명시한다.

```ts
// 권장 형태
test('rng가 0을 반환하면 key=-Infinity로 해당 항목이 positive 항목 중 맨 뒤에 위치한다', () => {
  const rng = sequence([0, 0.5]);
  const result = weightedShuffle(['a', 'b'], [1, 1], rng);
  expect(result).toEqual(['b', 'a']);
});
```

## 관련 작업

- `_works/S1-RM-015/20260524-01-random-permutation-secure-source/` — `weightedShuffle`
  구현 후 사후 리뷰에서 `rng=0` 경계 테스트 누락 발견 → `5a199e6 test: weightedShuffle
  rng=0 엣지케이스 추가` commit으로 보강.
