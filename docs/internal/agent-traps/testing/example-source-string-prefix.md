# 예제 source 문자열 테스트는 함수명 접두어만 검사하지 않는다

태그: `testing`, `examples`, `source-test`, `companion`

## 함정

예제 source의 API 사용 여부를 문자열로 검사할 때 companion 없는 함수명만 검사하면, 같은 접두어를 가진
`*Into` companion 호출만 있어도 테스트가 통과할 수 있다.

```ts
expect(code).toContain('Curvex.quadraticBounds');
```

위 검사는 실제 source에 `Curvex.quadraticBoundsInto(...)`만 있어도 통과한다.

## 증상

- 예제 계획은 allocating companion과 `*Into` companion을 둘 다 사용해야 한다.
- source에는 `*Into`만 남아 있다.
- 그래도 raw source 보존 테스트는 통과한다.
- coverage는 leaf 파일 단위라 false positive를 더 늦게 알아차릴 수 있다.

## 방지

함수 호출 보존 테스트는 여는 괄호까지 포함한다.

```ts
expect(code).toContain('Curvex.quadraticBounds(');
expect(code).toContain('Curvex.quadraticBoundsInto(');
```

다른 namespace도 같은 규칙을 적용한다.

```ts
expect(code).toContain('Segmentx.pointAt(');
expect(code).toContain('Segmentx.pointAtInto(');
```

## 관련 작업

- `_works/S1-RM-013/20260524-27-quadratic-curve-analysis-lab-example/`
