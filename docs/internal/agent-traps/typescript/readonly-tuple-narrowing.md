# readonly tuple narrowing

태그: `typescript`, `tuple`, `type-guard`

## 함정

`readonly [number, number]` 같은 readonly tuple이 포함된 union에서는 `Array.isArray`를 직접
조건식으로 쓰는 것만으로 object branch가 원하는 형태로 좁혀지지 않을 수 있다.

## 증상

tuple branch가 아닌 곳에서 object property에 접근할 때 `tsc --noEmit`이 다음 형태의 오류를
낸다.

```txt
Property 'x' does not exist on type 'XYInput'.
Property 'x' does not exist on type 'XYTuple'.
```

## 방지

반복해서 좌표를 읽는 internal helper에서는 명시적인 type guard를 둔다.

```ts
function isXYTuple(input: XYInput): input is readonly [number, number] {
  return Array.isArray(input);
}
```

좌표 읽기 구현은 이 type guard를 사용해 tuple branch와 object branch를 분리한다.

## 관련 작업

- `S1-RM-001: Internal XY primitive helpers`
