# precondition 위반 케이스를 API 문서에 정의된 동작으로 기술하는 실수

태그: `package-surface`, `documentation`, `precondition`, `undefined-behavior`, `false-contract`

## 함정

"caller가 ordered bounds를 전달해야 한다"처럼 caller-ordered precondition을 요구하는 함수에서,
구현 JSDoc은 "min > max이면 결과는 정의되지 않는다"고 정확히 기술했는데도 API surface 문서에서
"min > max이면 lo 우선" 같은 구체적 동작을 기술하는 실수.

```md
<!-- 함정: 구현/계획은 "undefined"인데 API surface 문서에 정의된 동작으로 기술 -->
**`clampInto` / `clamp`**: component-wise clamp. `min > max`이면 `min`이 우선.

<!-- 실제 구현: Math.min(Math.max(ix, minX), maxX) -->
<!-- lo > hi이면 min(≥lo, hi) = hi → 사실 hi가 반환됨 — 기술된 동작과도 다름 -->
```

## 증상

- API surface 문서가 구현/계획과 상충하는 false contract를 만든다.
- 기술된 동작이 실제 구현 결과와 다를 수 있다(undefined behavior이므로 보장 없음).
- 이후 구현이 변경되면 API surface 문서가 더 잘못된 상태로 고착된다.

## 방지

caller-ordered 선행 조건이 명시된 함수는 precondition 위반 케이스를 API surface 문서에서
"결과 미정의" 또는 "caller 책임"으로 기술하고 구현 세부 사항을 설명하지 않는다.

```md
<!-- 권장 -->
**`clampInto` / `clamp`**: component-wise clamp.
caller가 `min <= max` 순서로 전달해야 한다. `min > max`이면 결과는 정의되지 않는다.
```

패턴: JSDoc에 "결과는 정의되지 않는다" / "caller 책임"이라고 적혀 있으면
API surface 문서도 동일 정책으로 기술한다.

## 관련 작업

- `_works/S3-RM-034/20260524-01-vec-component-simple-follow-up/` Round 2 review에서 발견.
  - 과거 API surface `vec2` 문서: `clampInto` "min > max이면 min이 우선" → caller-ordered 표현으로 교체.
  - 실제 구현은 `hi`를 반환했으므로 기술된 동작도 틀린 상태였음.
