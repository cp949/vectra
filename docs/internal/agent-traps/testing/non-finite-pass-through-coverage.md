# non-finite pass-through 테스트 NaN-only 편향

태그: `testing`, `coverage`, `NaN`, `Infinity`, `degenerate`

## 함정

"non-finite (NaN/Infinity) 입력은 pass through (caller 책임)" 정책을 검증할 때
`NaN` 케이스만 적고 `Infinity` / `-Infinity` 케이스를 빠뜨리는 실수.

같은 함정의 형제: identity / 일반값 / round-trip만 검증하고 zero matrix(det=0)나
zero vector 같은 degenerate 입력 케이스를 빠뜨리는 실수.

```ts
// 함정: NaN만 검증
test('NaN은 pass through한다', () => {
  fromArray6Into(out, [NaN, 0, 0, 1, 0, 0]);
  expect(Number.isNaN(out.a)).toBe(true);
});
// Infinity / -Infinity 케이스 없음
// zero matrix [0,0,0,0,0,0] degenerate 케이스 없음
```

## 증상

- 정책 문서는 "NaN/Infinity pass through"인데 테스트는 NaN만 검증 → contract gap.
- `Math.cos(Infinity) → NaN` 같은 trig 동작이 silently 가정되는데 회귀 안전망 없음.
- zero matrix(det=0)에서 분기가 생기는 함수가 추가됐을 때 회귀를 잡지 못한다.
- read/write 양방향 함수에서 한 방향만 Infinity 검증.

## 방지

`*Into` / companion에 "non-finite pass through" 정책 메모가 있는 함수는 다음 5가지를
모두 테스트한다.

1. `NaN` pass-through
2. `Infinity` 와 `-Infinity` pass-through (하나의 test case에서 같이 검증해도 됨)
3. zero matrix / zero vector / zero rect 같은 degenerate 입력
4. (read/write 양방향 함수가 있다면) read 방향과 write 방향 둘 다
5. **input parameter 위치 다양성**: 같은 함수가 여러 input parameter(`line, point` /
   `circle, amount` / `out, source, ratio` 등)를 받는다면 각 input 위치별로 NaN/Infinity
   pass-through를 검증한다. 한 input(예: `point.x = NaN`)만 테스트하고 다른 input
   위치(예: `line.direction.x = NaN`, `line.origin.y = NaN`)를 빼먹지 않는다.

trig 함수(`Math.cos(Infinity) → NaN`)를 거치는 함수에서는 Infinity 입력의 실제 출력(NaN)을
test 주석으로 명시한다. caller가 "Infinity가 그대로 component에 박힌다"고 오해하지 않도록.

```ts
// 권장 형태
test('Infinity / -Infinity는 pass through한다', () => {
  fromArray6Into(out, [Infinity, -Infinity, 0, 1, 0, 0]);
  expect(out.a).toBe(Infinity);
  expect(out.b).toBe(-Infinity);
});

test('Infinity axisAngle → trig 결과는 NaN이다 (pass-through)', () => {
  // Math.cos(Infinity) / Math.sin(Infinity) → NaN
  reflectionInto(out, Number.POSITIVE_INFINITY);
  expect(Number.isNaN(out.a)).toBe(true);
});

test('zero matrix array를 그대로 기록한다 (det=0 degenerate)', () => {
  fromArray6Into(out, [0, 0, 0, 0, 0, 0]);
  expect(out.a).toBe(0);
  // ...
});
```

## chord 차분 / 누적 helper: Infinity 입력은 Infinity가 아니라 NaN이 된다

cumulative chord-length, polyline 길이, 인접 sample 차분 기반 helper에서 Infinity 좌표
pass-through를 검증할 때 결과를 `Infinity`로 단정하면 실패한다. Bezier 평가의 `t=0` 항
(`t2 * p_end = 0 * Infinity = NaN`)과 인접 sample 차분(`Infinity - Infinity = NaN`) 때문에
누적값은 `Infinity`가 아니라 `NaN`이 된다. `Math.hypot(Infinity, 0) === Infinity`만 보고
"Infinity일 것"이라 단정하지 않는다.

```ts
// 함정: 차분/누적 경로의 Infinity는 NaN이 된다
quadraticLookupTableInto(out, P0, P1, { x: Infinity, y: 0 }, 3);
expect(out[2].length).toBe(Infinity); // 실패 — 실제로는 NaN

// 권장: non-finite로 단정하고 실제 결과를 주석으로 명시
expect(Number.isFinite(out[2].length)).toBe(false); // 0*Inf / Inf-Inf → NaN
```

좌표 위치(start/end)에 따라 어느 항이 `0*Inf`가 되는지 달라지므로, 차분 helper의 non-finite
검증은 `toBe(Infinity)`가 아니라 `Number.isFinite(...) === false`로 둔다.

## 관련 작업

- `_works/S3-RM-026/20260522-01-matrix-follow-up/` Round 1/2 review에서 발견.
- `_works/S2-RM-029/20260528-01-curve-spaced-sampling-lookup/함정.md` TASK-02. lookup table chord
  차분 helper의 Infinity pass-through가 NaN이 되는 시나리오 추가.
  - Round 1: `array-serialization.test.ts`가 NaN만 있고 Infinity / zero matrix 누락 → 8건 추가
  - Round 2: `reflection.test.ts`가 NaN axisAngle만 있고 Infinity 누락 → 1건 추가
- `_works/S3-RM-027/20260522-01-circle-line-follow-up/` 사후 리뷰 Round 1에서 input
  parameter 위치 다양성 누락 발견. `signedDistanceToPoint`/`side` 테스트가 `point`의
  NaN/Infinity만 검증하고 `line.direction` / `line.origin` 위치는 미검증 → 7건 추가.
  방지 5번 항목으로 승격.
