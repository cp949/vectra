# @cp949/vectra

2D 도형과 수학 계산 함수를 모아 둔 TypeScript 라이브러리다.

렌더링, DOM, 장면 그래프, 에디터 상태는 다루지 않는다. 좌표와 도형 데이터를 넘기면 계산 결과만 돌려준다. 화면에 그리는 일은 Canvas, Pixi, SVG처럼 쓰는 쪽에서 고르면 된다.

저장소 구조와 전체 문서는 [GitHub 저장소](https://github.com/cp949/vectra)와 [문서 목차](https://github.com/cp949/vectra/blob/main/docs/README.md)에 있다. 버전별 변경 사항은 [CHANGELOG](https://github.com/cp949/vectra/blob/main/CHANGELOG.md)에 정리했다.

## 설치

```sh
npm install @cp949/vectra
```

## 지원 범위

| 항목             | 기준                                                                        |
| ---------------- | --------------------------------------------------------------------------- |
| 검증 환경        | Node.js `24.18.0`. 배포 CI 기준이다                                         |
| 빌드 target      | ES2020, platform neutral. 브라우저와 번들러의 호환성은 환경에 따라 달라진다 |
| Module format    | ESM. CJS는 `require()`로 불러온다 (아래 "CJS에서 사용" 참고)                |
| Dependencies     | runtime dependency 없음                                                     |
| Package metadata | `sideEffects: false`                                                        |
| Import           | root, `types`, domain subpath export                                        |
| Coordinates      | `{ x, y }` 객체                                                             |

## 빠른 시작

```ts
import * as Vecx from '@cp949/vectra/vec';
import * as Segmentx from '@cp949/vectra/segment';

const a = { x: 0, y: 0 };
const b = { x: 3, y: 4 };

const sum = Vecx.add(a, b);
const length = Segmentx.length({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });

console.log(sum); // { x: 3, y: 4 }
console.log(length); // 5
```

## CJS에서 사용

패키지는 ESM으로만 배포한다. `exports`의 `default` 조건도 같은 ESM 파일을 가리킨다. CJS 코드에서는 `require(esm)`으로 불러오면 되고, Node.js `24.18.0`에서 동작을 확인했다.

```js
const Vecx = require('@cp949/vectra/vec');

console.log(Vecx.add({ x: 1, y: 2 }, { x: 3, y: 4 })); // { x: 4, y: 6 }
```

`require(esm)`을 지원하지 않는 환경이라면 dynamic import를 쓴다.

```js
import('@cp949/vectra/vec').then((Vecx) => {
  console.log(Vecx.add({ x: 1, y: 2 }, { x: 3, y: 4 }));
});
```

## Import

함수는 도메인별 subpath에서 가져온다. 도메인 하나를 네임스페이스로 통째로 import하는 방식을 권장한다.

```ts
import * as Vecx from '@cp949/vectra/vec';
import * as Circlex from '@cp949/vectra/circle';
import * as Intersectx from '@cp949/vectra/intersects';
```

패키지 루트(`@cp949/vectra`)에는 타입과 `VECTRA_PACKAGE_NAME` 상수만 있다. 함수는 루트에서 가져올 수 없다.

```ts
import { VECTRA_PACKAGE_NAME } from '@cp949/vectra';

console.log(VECTRA_PACKAGE_NAME); // '@cp949/vectra'
```

함수 하나하나의 파일 경로는 `exports`에서 막아 두었다. 공개된 경로는 패키지 루트, `types`, 도메인 subpath 세 가지뿐이다.

## 결과 받기

객체를 돌려주는 계산은 보통 두 가지 함수로 제공한다. `add`는 새 객체를 만들어 반환하고, `addInto`는 호출하는 쪽이 넘긴 객체에 결과를 쓴다.

```ts
import * as Vecx from '@cp949/vectra/vec';

const allocated = Vecx.add({ x: 1, y: 2 }, { x: 3, y: 4 });

const out = { x: 0, y: 0 };
const returned = Vecx.addInto(out, { x: 1, y: 2 }, { x: 3, y: 4 });

console.log(allocated); // { x: 4, y: 6 }
console.log(out); // { x: 4, y: 6 }
console.log(returned === out); // true
```

`*Into` 함수는 출력 객체를 다시 쓸 수 있어서, 매 프레임 호출하는 코드에서 할당을 줄이기 좋다. 반환값은 함수마다 다르다. `addInto`는 넘겨받은 객체를 그대로 돌려주고, `averageInto`처럼 계산에 성공했는지를 `boolean`으로 알려 주는 함수도 있다. 정확한 반환값은 각 함수의 JSDoc을 참고할 수 있다.

## 입력

점은 `{ x, y }` 객체로 넘긴다.

```ts
import * as Vecx from '@cp949/vectra/vec';

const a = { x: 1, y: 2 };
const b = { x: 3, y: 4 };

console.log(Vecx.distance(a, b));
```

`[x, y]` 배열이나 typed array로 된 좌표는 호출하기 전에 `{ x, y }` 객체로 바꿔야 한다.

도형은 좌표를 중첩하지 않고 한 객체에 펼쳐 담는다. 원은 `{ cx, cy, r }`, 선분은 `{ x1, y1, x2, y2 }` 모양이다. `Polygon`은 닫힌 다각형의 좌표를 `[x0, y0, x1, y1, …]` 순서로 담은 숫자 배열이고, `Polyline`은 `{ x, y }` 점 객체의 배열이다.

## 성능

자주 호출하는 함수에는 늘 같은 모양의 객체를 넘기는 편이 좋다. V8은 객체의 필드 구성과 순서를 보고 속성 접근을 최적화하는데, 모양이 다른 객체가 섞이면 이 최적화가 풀린다.

예를 들어 `Rect`에도 `x`, `y`가 있으니 TypeScript에서는 점 자리에 그대로 넘길 수 있다. 하지만 `width`, `height`까지 달린 객체가 점 함수에 섞여 들어가면 그만큼 느려진다. 점 함수에는 `{ x, y }`만 담은 객체를 넘기고, `*Into`에 넘기는 출력 객체도 같은 모양으로 맞춘다.

## 계산할 수 없는 입력

세 점이 한 직선 위에 있는 삼각형처럼 답이 없는 입력도 있다. 이런 입력을 어떻게 처리할지는 함수마다 정해져 있다. 아래 예처럼 `undefined`를 돌려주는 함수가 많고, 범위를 벗어난 옵션 값에는 `RangeError`를 던지는 함수도 있다.

```ts
import * as Trianglex from '@cp949/vectra/triangle';

const lineTriangle = {
  x1: 0,
  y1: 0,
  x2: 1,
  y2: 1,
  x3: 2,
  y3: 2,
};

console.log(Trianglex.circumcenter(lineTriangle)); // undefined
```

함수별 동작은 JSDoc에 적어 두었다. 공통 규칙은 [예외 처리와 수치 정책](https://github.com/cp949/vectra/blob/main/docs/guides/degen-and-numeric-policy.md) 가이드에 있다.

## Domain

도메인마다 `@cp949/vectra/<domain>` 경로로 import한다.

| 분류                     | Domain                                                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| vector                   | `vec`                                                                                                                       |
| 직선·primitive shape     | `segment`, `infinite-line`, `ray`, `rect`, `bounds`, `capsule`, `circle`, `ellipse`, `triangle`, `oriented-rect`, `polygon` |
| 2D transform             | `matrix`, `pose2`                                                                                                           |
| path·curve               | `polyline`, `path`, `curve`                                                                                                 |
| cross-shape relation     | `intersects`                                                                                                                |
| scalar math              | `math`, `angle`                                                                                                             |
| 보간·motion              | `interpolation`, `easing`, `motion`                                                                                         |
| 수치 계산                | `linalg`, `statistics`, `fitting`, `calculus`                                                                               |
| random·noise             | `random`, `random-state`, `noise`                                                                                           |
| signed distance          | `sdf`                                                                                                                       |
| grid                     | `grid`, `hex-grid`                                                                                                          |
| 외부 format 변환         | `adapter`, `svg-path`                                                                                                       |
| editor-oriented geometry | `editor-geometry`                                                                                                           |

도메인별로 어떤 기능이 있는지는 [Domain 지도](https://github.com/cp949/vectra/blob/main/docs/reference/domains.md)에서 찾을 수 있다.

## 하는 일과 하지 않는 일

`vectra`가 하는 일은 다음과 같다.

- 도형과 수학 계산
- 호출하는 쪽이 넘긴 출력 객체에 결과 기록
- SVG path 같은 외부 형식과 도형 데이터 사이의 변환

다음 일은 하지 않는다.

- 렌더링
- DOM 조작
- 장면 그래프 관리
- 에디터 상태, 실행 취소 기록, 선택 관리
- 물리 엔진
- 애니메이션·tween 엔진

## 패키지 구성

npm 패키지에는 아래 파일만 들어 있다.

- `dist`: ESM 빌드 결과와 `.d.ts`
- `README.md`: 이 문서
- `LICENSE`: MIT 라이선스
- `llm.txt`: LLM에 넘기기 위한 패키지 요약
