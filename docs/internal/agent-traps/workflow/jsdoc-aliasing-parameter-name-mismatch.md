# Into 함수 JSDoc aliasing 안전성 문구 파라미터명 copy-paste 오류

태그: `jsdoc`, `Into`, `aliasing`, `copy-paste`, `parameter-name`

## 함정

단일 입력 `*Into(out, input)` 함수의 "input과 out이 같은 object여도 안전하다" aliasing
안전성 문구를 다중 입력 `*Into(out, from, to)` / `*Into(out, a, b)` 함수에 copy-paste하면서
파라미터 이름을 갱신하지 않는 실수.

```ts
// 원본 (floorInto)
/**
 * input과 out이 같은 object여도 안전하다.
 */
export function floorInto<Out extends XYWritable>(out: Out, input: XYInput): Out { ... }

// 함정: directionToInto에 그대로 복사 — "input"이라는 파라미터가 없음
/**
 * from에서 to 방향 단위 벡터를 out에 기록하고 out을 반환한다.
 * input과 out이 같은 object여도 안전하다.  ← "input"은 이 함수에 없는 파라미터
 */
export function directionToInto<Out extends XYWritable>(out: Out, from: XYInput, to: XYInput): Out { ... }
```

## 증상

- IDE hover에서 존재하지 않는 파라미터 이름(`input`)이 노출 → caller가 오독.
- 실제 aliasing 가능한 파라미터(`from`, `to`)는 언급되지 않아 caller가 aliasing 안전성을 모른다.
- review 없이는 컴파일/테스트에서 걸리지 않는다.

## 방지

aliasing 안전성 문구를 작성할 때 해당 함수의 실제 파라미터 이름을 사용한다.

```ts
// 권장: 실제 파라미터 이름 사용
/**
 * from에서 to 방향 단위 벡터를 out에 기록하고 out을 반환한다.
 * from 또는 to가 out과 같은 object여도 안전하다.
 */
export function directionToInto<Out extends XYWritable>(out: Out, from: XYInput, to: XYInput): Out { ... }
```

기존 함수에서 aliasing 문구를 복사했다면 먼저 파라미터 목록을 확인하고 이름을 맞게 수정한다.

## 관련 작업

- `_works/S3-RM-034/20260524-01-vec-component-simple-follow-up/` Round 2 review에서 발견.
  - `direction-to-into.ts:8`: `floorInto` JSDoc에서 복사한 "input과 out이 같은 object여도 안전하다"가 `from`/`to` 파라미터를 가진 함수에 그대로 남음.
