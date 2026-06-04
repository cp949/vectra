# Adapter

adapter는 외부 format과 `vectra` structural data 사이의 얇은 변환층이다.
DOM element, renderer object, scene graph, editor state를 소유하지 않는다.

## SVG points

`adapter` domain은 SVG `points` 문자열과 point 배열 변환을 제공한다.

```ts
import * as Adapterx from '@cp949/vectra/adapter';

const points = Adapterx.parseSvgPoints('0,0 10,0 10,10');
const text = Adapterx.pointsToString(points);

console.log(points);
console.log(text);
```

## SVG path

`svg-path` domain은 SVG path string과 `PathCommand[]` 변환을 맡는다.

```ts
import * as SvgPathx from '@cp949/vectra/svg-path';

const commands = SvgPathx.parsePathData('M0 0 L10 0 L10 10 Z');
if (commands === undefined) throw new Error('invalid path data');

const pathData = SvgPathx.pathDataToString(commands);

console.log(commands);
console.log(pathData);
```

## 책임 경계

`vectra`가 하는 일:

- 문자열을 structural data로 parse한다.
- structural data를 문자열로 serialize한다.
- 변환 과정의 geometry/math 계산을 제공한다.

`vectra`가 하지 않는 일:

- DOM element mutate
- renderer object lifecycle 관리
- scene graph 관리
- editor state, selection, history 관리
