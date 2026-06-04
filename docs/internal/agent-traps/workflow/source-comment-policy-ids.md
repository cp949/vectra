# Source 주석에 API/RM 정책 ID를 남기지 않는다

## 함정

작업 중 source 주석에 `API-008`, `API-012`, `S3-RM-029`, `S7-RM-004` 같은 정책 ID나 roadmap
item ID를 남긴다.

## 증상

- source code가 현재 작업 문맥에 묶인다.
- 정책 번호가 바뀌지 않아도 설명이 문서 맥락 없이는 불완전하다.
- roadmap item 완료 후에도 source 주석에 작업 이력이 남아 public API 계약처럼 보인다.
- API surface 문서와 source 주석이 서로 다른 정책 설명을 갖게 된다.

## 방지

- source 주석에는 계산 계약, caller 책임, mutation, aliasing, degenerate 처리만 적는다.
- 정책 ID는 `docs/internal/api-design.md`, internal API surface notes, `_works/**`, review comment에만 적는다.
- roadmap item ID는 roadmap item notes, internal state notes, `_works/**`에만 적는다.
- source에 정책 배경을 남겨야 하면 ID를 쓰지 말고 실행 계약으로 풀어 쓴다.
- 본 규칙은 `sub/vectra/src/`에 한정한다. test 파일(`sub/vectra/tests/`)은 작업 추적을 위해
  RM ID를 허용한다.

## 예시

나쁨:

```ts
/**
 * API-008 collection output 예외이므로 companion 없음.
 */
export function shapeToPathCommandsInto(...) {}
```

좋음:

```ts
/**
 * shape를 absolute PathCommand 배열로 변환해 out에 기록한다.
 *
 * out은 호출 전에 비워지고, 결과 command가 순서대로 push된다.
 */
export function shapeToPathCommandsInto(...) {}
```
