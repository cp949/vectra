# ADR 0006: Writable Output and Into Return Policy

상태: 승인

## 배경

`vectra`는 외부 renderer나 geometry library의 point object를 `vectra` 전용 object로
변환하도록 요구하지 않는다. 입력은 structural coordinate를 읽고, object 결과는
caller가 제공한 writable output에 기록한다.

기존 `XYInput`은 object와 readonly tuple을 모두 받을 수 있었다.

```ts
export type XYTuple = readonly [x: number, y: number];
export type XYInput = XYLike | XYTuple;
```

반면 `XYWritable`은 `{ x, y }` object만 허용했다.

```ts
export interface XYWritable {
  x: number;
  y: number;
}
```

이 제한은 mutable tuple을 output storage로 쓰는 사용자와, 외부 point class instance의
method chaining을 보존하려는 사용자에게 불편하다.

## 결정

`XYWritable`은 object output과 mutable tuple output을 모두 허용한다.

```ts
export interface XYObjectWritable {
  x: number;
  y: number;
}

export type XYTupleWritable = [x: number, y: number];

export type XYWritable = XYObjectWritable | XYTupleWritable;
```

중요한 구분:

- `XYInput` tuple은 `readonly [number, number]`를 허용한다.
- `XYWritable` tuple은 mutable `[number, number]`만 허용한다.
- readonly tuple은 output으로 지원하지 않는다.

## 쓰기 정책

`writeXY`는 runtime shape를 기준으로 쓰기 위치를 정한다. 값이 배열이면 tuple
storage가 우선이고, 배열이 아니면 object field에 기록한다.

```ts
export function writeXY<Out extends XYWritable>(out: Out, x: number, y: number): Out {
  if (Array.isArray(out)) {
    out[0] = x;
    out[1] = y;
  } else {
    out.x = x;
    out.y = y;
  }

  return out;
}
```

hybrid 값에 대한 정책:

- 배열과 `x`, `y` field를 동시에 가진 값은 배열로 처리한다.
- writable tuple과 readonly `x`, `y` field를 동시에 가진 값은 tuple index에 기록한다.
- readonly 배열과 writable `x`, `y` field를 동시에 가진 값도 runtime에서는 배열로
  판정된다. 이런 값은 output으로 넘기지 않는 것이 caller 책임이다.
- `XYObjectWritable`에서 배열을 배제하기 위한 `length?: never` 같은 타입 장치는 두지
  않는다.

이 정책은 TypeScript의 과한 structural filtering보다 JavaScript runtime shape에 맞춘
단순한 규칙을 우선한다.

## Into Return Policy

`Into` 함수는 caller가 제공한 writable output에 object 결과를 기록하고, 받은 `out`의 구체
타입을 그대로 반환한다. 이것은 point-output에만 한정된 예외 규칙이 아니라 `vectra`의 기본
output convention이다.

```ts
export function startInto<Out extends XYWritable>(out: Out, line: FiniteLineLike): Out {
  return writeXY(out, readX(line.a), readY(line.a));
}
```

shape-level output도 같은 원칙을 따른다.

```ts
export function copyInto<Out extends CircleWritable<XYWritable>>(
  out: Out,
  center: XYInput,
  radius: number,
): Out {
  writeXY(out.center, readX(center), readY(center));
  out.radius = radius;
  return out;
}
```

`copyInto` 같은 함수는 쓰기 함수이다. 다른 geometry domain의 shape가 readonly storage를
가지고 있다면 그 값은 writable output이 아니므로 `copyInto`에 넘기지 않는다. 모든 사용 사례를
하나의 함수가 받아야 하는 것이 아니라, writable output을 받는 함수는 writable structural
object에만 쓴다는 경계를 타입으로 표현한다.

이렇게 하면 mutable tuple은 tuple로 유지되고, 외부 point class instance는 method
chaining이 가능하다.

```ts
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}

  translateX(dx: number): this {
    this.x += dx;
    return this;
  }
}

writeXY(new Point(0, 0), 100, 100).translateX(10);
startInto([0, 0], segment);
```

## 사용성 Sketch

이 결정은 타입 shape만 보고 정한 것이 아니라, 예상 call-site에서 드러나는 사용성을
기준으로 삼는다.

```ts
const point = new Point(0, 0);
writeXY(point, 100, 100).translateX(10);

const tuple = writeXY([0, 0], 100, 100);

const updatedPoints = points.map((point) => writeXY(point, 100, 100));

const centers = sprites.map((sprite) => rect.centerInto(sprite.position, sprite.bounds));
```

위 코드에서 중요한 점:

- `writeXY(point, ...)`는 `Point`를 반환해야 한다.
- `writeXY([0, 0], ...)`는 mutable tuple을 반환해야 한다.
- `points.map((point) => writeXY(point, ...))`는 collection 안의 point 구체 타입을
  유지해야 한다.
- `rect.centerInto(sprite.position, ...)`처럼 다른 domain의 point-output 함수도
  `sprite.position`의 구체 타입을 보존해야 한다.

따라서 `XYWritable`을 반환하는 넓은 signature보다 `<Out extends XYWritable>(out:
Out, ...): Out` 형태가 `vectra`의 "bring your own geometry objects" 철학에 더 맞다.

## 적용 범위

적용 대상은 object 결과를 caller-provided writable output에 기록하는 모든 `Into` 함수이다.

- `writeXY`
- `vec`의 `addInto`, `subInto`, `scaleInto`, `copyInto`, `normalizeInto`
- `finite-line`의 `startInto`, `endInto`, `vectorInto`, `midpointInto`, `pointAtInto`,
  `projectPointInto`, `closestPointInto`, `copyInto`
- `rect`, `bounds`, `circle` 등 shape domain의 point-output 함수와 shape-output 함수

정책:

- `Into`는 `<Out extends WritableShape>(out: Out, ...): Out` 형태로 output의 구체 타입을
  보존한다. point-output의 `WritableShape`는 `XYWritable`이고, circle output의
  `WritableShape`는 `CircleWritable<XYWritable>` 같은 shape writable이다.
- 기존에 `void`를 반환하던 `Into`도 새 함수나 변경 시점에는 `Out` 반환으로 통일한다.
- writable shape 내부의 coordinate slot은 해당 slot에 쓰기 가능한 타입이어야 한다. 예를 들어
  circle center를 쓰는 함수는 `CircleWritable<XYWritable>`을 받는다. `CircleWritable`의 기본
  type argument는 object writable로 둘 수 있지만, 쓰기 함수 signature는 mutable tuple이나 외부
  point class instance도 받도록 writable coordinate slot을 열어 둔다.
- readonly coordinate나 readonly shape는 input(`Like`)으로는 허용할 수 있지만, output
  (`Writable`)으로는 허용하지 않는다. caller가 readonly storage를 가진 외부 shape를 사용한다면
  `copyInto`를 호출하지 않거나, 별도의 writable output을 제공한다.

예외:

- `singleIntersectionInto`처럼 scalar/boolean이 주 반환값인 함수는 `<Out extends WritableShape>
  (...): Out` 형태를 적용하지 않는다. 이런 함수는 `out`에 결과를 기록하지만 반환 타입이 기록
  성공 여부를 나타내므로, generic return으로 바꾸면 기존 의미가 깨진다. 예외 함수는 API surface
  문서에서 별도로 명시한다.

## 결과

- 외부 point object와 mutable tuple을 output으로 사용할 수 있다.
- object result를 caller-provided writable output에 기록한다는 structural-first 원칙을 유지한다.
- `Into` 함수의 반환 타입이 output의 구체 타입을 보존하므로 chaining과 type inference가
  좋아진다.
- readonly input과 writable output의 역할이 분리된다. 모든 외부 geometry shape를 mutate하는
  만능 함수는 목표가 아니다.
- hybrid value 처리 규칙은 단순하지만, readonly 배열 hybrid는 runtime에서 안전하게 쓸 수
  없으므로 문서화된 caller 책임으로 남긴다.
