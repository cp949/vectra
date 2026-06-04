# 단일 흐름 가드 토큰을 예제 자기 주석이 먼저 포함한다

태그: `examples`, `testing`, `guard`

## 함정

예제에 "단일 흐름만 유지한다" 가드 테스트를 추가할 때, 제외 대상 API/옵션을
`expect(code).not.toContain('<토큰>')`로 막는다. 그런데 같은 `source.exam.ts`에 "이 옵션은
별개 관계라 쓰지 않는다"는 설명 주석을 한글로 달면서 그 토큰을 그대로 적으면, raw source 문자열에
토큰이 박혀 `not.toContain`이 실패한다.

```ts
// source.exam.ts
// raw 목적지. containIn은 별개 관계라 쓰지 않고 ...   // ← 토큰 'containIn'이 주석에 박힘

// example-sources.test.ts
expect(constrainDragAxisLockCode).not.toContain('containIn'); // ← 주석 때문에 실패
```

가드는 raw 전체 문자열을 검사하므로 식별자 호출뿐 아니라 주석·문자열 리터럴도 매칭한다.

## 증상

`pnpm --filter @repo/pixi-demo test`에서 해당 가드 it만 실패하고, diff에 예제 source 전체가
출력된다. 실패 라인은 `not.toContain('<토큰>')`을 가리킨다.

## 방지

- 제외 API는 가능하면 `EditorGeometry.constrainResize` 같은 `Namespace.fn(` 형태로 막아 호출만
  매칭하고 일반 단어 매칭을 피한다. 옵션 키처럼 namespace prefix가 없는 토큰을 막을 때는
  설명 주석에서 그 토큰을 한글 의미어로 바꿔 쓴다(예: `containIn` → "영역 클램프 옵션").
- 가드를 쓴 뒤 반드시 focused 테스트로 자기 source를 한 번 돌려 자기 주석 충돌을 잡는다.

## 관련 작업

- `_works/S1-RM-013/20260524-62-constrain-drag-axis-lock-example/`에서 발견(1회차).
  `not.toContain('containIn')` 가드가 source 주석의 `containIn` 단어와 충돌 → 주석을
  "영역 클램프 옵션"으로 바꿔 통과.
