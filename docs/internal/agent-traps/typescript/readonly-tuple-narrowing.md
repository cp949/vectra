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

`readX`/`readY`처럼 hot loop에서 반복 호출되는 읽기 helper는 `Array.isArray` 분기를 쓰지 않는다.
분기가 호출당 약 9ns로 느리다. field를 먼저 읽고 캐스트로 타입을 맞춘다.

```ts
const x = (input as XYLike).x;
return x !== undefined ? x : (input as XYTuple)[0];
```

hot loop가 아닌 곳에서 `Array.isArray`로 좁히려면 명시적인 type guard를 둔다.

```ts
function isXYTuple(input: XYInput): input is readonly [number, number] {
  return Array.isArray(input);
}
```

## 관련 작업

- `S1-RM-001: Internal XY primitive helpers`
