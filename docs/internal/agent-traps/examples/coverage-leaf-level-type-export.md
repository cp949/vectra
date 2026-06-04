# 예제 coverage는 leaf 파일 단위라 type export도 같이 covered로 보인다

태그: `examples`, `coverage`, `typescript`

## 함정

`docs/internal/examples/coverage.md` 표는 export name별 행을 보여주지만, 실제 사용 여부 수집은 public leaf 파일
단위다.

같은 leaf 파일에서 function과 type을 함께 export하면 function 호출만으로 type export 행도 같은 예제
ID로 covered 처리될 수 있다.

예:

```ts
Triangles.solveSssInto(out, a, b, c);
```

이 호출은 `triangle/solve-sss-into.ts` leaf를 covered로 만든다. 따라서 같은 leaf의
`type AngleSet` 행도 covered로 표시된다.

## 증상

- 예제 source에서 public type을 직접 import하지 않았다.
- 그래도 `docs/internal/examples/coverage.md`에서 `type AngleSet`, `type SideSet` 같은 행이 covered로 표시된다.
- 로컬 type alias 이름을 바꿔도 결과가 바뀌지 않는다.

## 방지

- coverage diff를 볼 때 `상태`는 leaf 파일 사용 여부로 해석한다.
- 표의 `Export name`은 어떤 export가 같은 leaf에 있는지 보여주는 정보이지, symbol별 직접 사용
  증거가 아니다.
- 특정 public type을 예제에서 직접 보여줘야 하는 요구가 있으면 source에서 `import type`이나 명시적
  type annotation을 별도로 확인한다.

## 관련 작업

- `_works/S1-RM-013/20260524-24-triangle-solver-excircles-lab-example/`
