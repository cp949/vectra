# Degenerate와 Numeric Policy

`vectra`는 throw-heavy geometry API가 아니다.
계산 결과가 존재하지 않는 geometry case는 함수별 sentinel로 알린다.

## Programmer error

잘못된 option 값은 `RangeError`를 던질 수 있다.

```ts
import * as Trianglex from '@cp949/vectra/triangle';

const triangle = {
  a: { x: 0, y: 0 },
  b: { x: 1, y: 0 },
  c: { x: 0, y: 1 },
};

try {
  Trianglex.isDegenerate(triangle, -1);
} catch (error) {
  console.log(error instanceof RangeError); // true
}
```

## Degenerate geometry

degenerate geometry는 함수별 contract를 따른다.
object-output `*Into`는 실패 시 `false`, allocating companion은 `undefined`를 반환하는 패턴이 많다.

```ts
import * as Trianglex from '@cp949/vectra/triangle';

const lineTriangle = {
  a: { x: 0, y: 0 },
  b: { x: 1, y: 1 },
  c: { x: 2, y: 2 },
};

const out = { x: 0, y: 0 };

console.log(Trianglex.circumcenterInto(out, lineTriangle)); // false
console.log(Trianglex.circumcenter(lineTriangle)); // undefined
```

## Non-finite input

`NaN`과 `Infinity` 처리는 함수별 JSDoc contract를 따른다.
많은 primitive 계산은 non-finite 좌표를 검증 없이 pass through한다.
finite 결과가 contract인 함수는 별도 guard를 둔다.

## Epsilon

epsilon 기본값은 domain마다 다를 수 있다.
정확한 값과 branch policy는 함수 JSDoc 또는 reference 문서를 기준으로 한다.
사용자 code에서 tolerance 의미가 중요하면 epsilon을 명시적으로 넘긴다.

```ts
import * as Vecx from '@cp949/vectra/vec';

const equal = Vecx.nearEquals({ x: 0.1 + 0.2, y: 0 }, [0.3, 0], 1e-9);

console.log(equal); // true
```
