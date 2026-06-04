# vectra 비전

`vectra`는 다양한 범위의 geometry/math 함수를 제공하는 TypeScript 기반
function catalog이다.

렌더러, scene graph, SVG DOM wrapper, 게임 엔진, 에디터 프레임워크에
의존하지 않고, geometry 중심 로직을 만드는 시스템들이 공통으로 사용할 수
있는 예측 가능한 primitive, 고급 알고리즘, 공간 질의, 에디터 지향 geometry helper를
제공한다.

`vectra`의 핵심 정체성은 다음과 같다.

```txt
Broad geometry/math function catalog.
```

핵심 가치는 catalog의 폭이다. 필요한 geometry/math helper를 단일 package에서 subpath로
가져와 사용할 수 있어야 한다.

## 목표

- 재사용 가능한 2D geometry primitive shape와 알고리즘을 제공한다.
- 실용적인 vector / matrix 수학 함수를 제공한다.
- distance, intersection, containment, transform, bounds 함수를 폭넓게 제공한다.
- `{ x, y }`, `[x, y]` 같은 일반적인 좌표 표현과 자연스럽게 호환된다.
- `Float32Array` 같은 typed-array / array-like 좌표는 현재 공식 입력 contract에 포함하지 않는다.
- object 결과는 `Into` 함수로 `XYWritable` 같은 외부 writable object에 기록한다.
- 많은 함수를 제공하되 subpath import와 side-effect-free module 구조를 유지한다.
- Path, Bezier, polygon boolean, spatial index, editor geometry utility까지 확장한다.
- Triangle, ellipse, easing, interpolation, arc, Catmull-Rom spline, B-Spline 같은 실제
  프로젝트용 계산 catalog까지 확장할 수 있다.
- SVG path parse/export 같은 format adapter는 기반 계산 domain이 안정된 뒤
  공식화한다.

## 비목표

`vectra`는 다음이 아니다.

- 렌더링 라이브러리
- SVG DOM 조작 라이브러리
- scene graph
- 물리 엔진
- 벡터 에디터 프레임워크
- editor state / history / selection model
- layout engine
- animation / tween engine

## 대상 사용자

- 벡터 에디터 개발자
- SVG 도구 제작자
- 다이어그램 / 화이트보드 도구 개발자
- 블록코딩 환경 개발자
- 시뮬레이션 / 시각화 도구 개발자
- 견고한 2D geometry math가 필요한 UI 개발자

## 참고 라이브러리

`vectra`는 참고 라이브러리에서 배울 점을 가져오되, 그 라이브러리들의 전체
범위를 따라가지는 않는다.

- `paper.js`: 강력한 vector/path 모델을 제공하지만, 더 큰 drawing framework에
  묶여 있다.
- `phaser`: 실용적인 math/geometry helper가 많지만, 게임 엔진 중심이다.
- `pixijs`: Point, Matrix, Bounds, Shape API가 유용하지만, renderer 중심이다.
- `svg.js`: SVG 조작 사용성이 좋지만, DOM/SVG element 중심이다.
- `flatten-js`: 풍부한 2D geometry 알고리즘을 가진 가장 가까운 참고 대상이다.

라이브러리별 배울 점은 내부 참고 자료로 관리한다.

## Catalog 방향

최종 제품 범위는 [제품 범위](./internal/product-scope.md)에서 관리한다.

요약하면 `vectra`는 단일 package + subpath 기반의 geometry/math function catalog를
목표로 한다.

- Path / Bezier / arc 계산
- triangle / ellipse 같은 primitive shape 보강
- easing / interpolation 같은 순수 math function catalog
- Catmull-Rom spline / B-Spline 같은 curve family
- polygon boolean operation
- offset / triangulation
- spatial index
- editor-oriented geometry utility
- SVG path parse / export

단, 이 기능들은 모두 data/value in/out으로 끝나야 한다. rendering, DOM mutation,
scene graph, editor state/history, physics engine behavior, animation/tween engine은 영구
비목표이다.

MVP 이후 구체적인 실행 계획은 [ROADMAP](../ROADMAP.md)에서 관리한다.
