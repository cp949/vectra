# Integer index guard: 정수성까지 검사해야 한다

## 증상

`pointAtIndexInto(out, container, 1.5)` 또는 `edgeAtInto(out, container, 2.999)` 같은
비정수 index 호출에서 `Cannot read properties of undefined` TypeError가 발생한다.

contract는 invalid index에서 `false` 반환과 `out` 미수정을 요구하는데 실제로는 throw한다.

## 원인

```ts
// 잘못된 가드: NaN만 잡고 finite non-integer를 흘려보낸다
if (index >= 0 && index < n) { ... }  // 1.5, 2.999 통과 → container[index] === undefined
```

`index >= 0 && index < n`은 `NaN`은 비교 결과가 `false`라 안전하게 막히지만,
`1.5`, `2.999`, `±Infinity` 같은 값은 통과시켜 `container[index]`가 `undefined`가 되고
이후 `readX(undefined)` 등에서 crash한다.

## 방지

```ts
// 올바른 가드: 정수성까지 함께 검사한다
if (Number.isInteger(index) && index >= 0 && index < n) { ... }
```

- `Number.isInteger`가 `Infinity`, `NaN`, 비정수 float를 모두 차단한다.
- 조건 순서는 `isInteger` → `>= 0` → `< n` 순이 가장 명확하다.

## 테스트 보강

test fixture에 정수가 아닌 finite index(예: `1.5`, `0.1`)와 `Infinity`, `-Infinity`를
함께 포함해 회귀를 막는다.

```ts
test.each([-1, 0.5, 1.5, n, NaN, Infinity, -Infinity])
  ('invalid index %s는 false를 반환하고 out을 수정하지 않는다', (idx) => {
    expect(pointAtIndexInto(out, container, idx)).toBe(false);
    expect(out).toEqual(sentinel);
  });
```

## 적용 범위

`boolean primary *Into(out, container, index)` 패턴을 사용하는 모든 함수에 해당한다.

- `polygon.pointAtIndexInto`, `polygon.edgeAtInto`
- `polyline.pointAtIndexInto`, `polyline.segmentAtInto`
- 후속 catalog에서 index 기반 access 함수를 추가할 때 동일하게 적용한다.
