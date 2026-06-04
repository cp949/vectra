# Into/companion JSDoc 비대칭

태그: `api-policy`, `Into`, `companion`, `jsdoc`, `documentation`

## 함정

`*Into(out, ...)`에는 NaN/Infinity pass through, degenerate 처리, origin 가정 같은 caller 책임
메모를 적었는데 대응 companion(`*(...)`)에서는 빠뜨리는 실수.

read 방향(`fromArrayN`)에만 NaN/Infinity 메모를 적고 write 방향(`toArrayN`)에는 빠뜨리는
실수도 같은 형태로 발생한다.

```ts
// 함정: *-into에만 메모, companion 누락
/**
 * ...
 * NaN/Infinity 입력은 검증 없이 pass through한다.
 */
export function fromArray6Into(out, array) { ... }

/**
 * 6-element array에서 matrix component를 읽어 새 object로 반환한다.
 * (NaN/Infinity 메모 없음)
 */
export function fromArray6(array) {
  return fromArray6Into({ ... }, array);
}
```

## 증상

- IDE hover에서 companion만 본 caller가 NaN/Infinity 입력의 결과를 예측하지 못한다.
- read 방향 JSDoc은 명시되고 write 방향은 누락되어 정책이 한 방향만 문서화된다.
- 새 테스트가 contract로 격상한 동작(예: `toArray*Into`의 Infinity pass-through)이 source JSDoc에 없어
  contract drift 발생.

## 방지

`*Into`와 companion 쌍을 추가할 때:

1. `*Into`에 적은 caller 책임 메모(non-finite, origin 가정, degenerate 처리, clamp 정책)는
   companion JSDoc에도 동일 문구로 적는다.
2. read/write 양방향 함수(`fromArrayN` ↔ `toArrayN`, `parse` ↔ `format` 등)는 양쪽 JSDoc에
   같은 정책 메모를 둔다. "출력 측은 자명하다"는 가정으로 생략하지 않는다.
3. 정책 메모를 함수 본문이 아니라 JSDoc 윗부분에 둔다. caller가 hover로 본다.

```ts
// 권장 형태: 양쪽 모두 동일 메모
/**
 * ...
 * NaN/Infinity 입력은 검증 없이 pass through한다.
 */
export function fromArray6Into(out, array) { ... }

/**
 * 6-element array에서 matrix component를 읽어 새 object로 반환한다.
 * ...
 * NaN/Infinity 입력은 검증 없이 pass through한다.
 */
export function fromArray6(array) { ... }
```

## 관련 작업

- `_works/S3-RM-026/20260522-01-matrix-follow-up/` Round 1/2 review에서 발견.
  - Round 1: `from-array-6.ts` / `from-array-9.ts` companion JSDoc 메모 누락 → 보강
  - Round 2: `to-array-6/9.ts`, `to-array-6/9-into.ts` write 방향 JSDoc 메모 누락 → 보강
  - Round 2: `reflection.ts` / `lerp.ts` companion JSDoc NaN/Infinity 메모 누락 → 보강
