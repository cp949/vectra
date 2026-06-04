# vectra 제품 범위

이 문서는 `vectra`의 최종 제품 목표와 영구 경계를 정의한다.

MVP는 초기 구현 범위를 정하는 문서이고, 이 문서는 MVP 이후에도 유지할 제품
방향을 정한다.

## 제품 정체성

`vectra`는 다양한 범위의 geometry/math 함수를 제공하는 TypeScript function catalog이다.

`vectra`는 렌더링이나 에디터 상태를 소유하지 않는다. 대신 외부 시스템이 가져온
structural geometry data를 대상으로 primitive 연산, light geometry 알고리즘,
에디터 지향 geometry helper, 순수 math helper를 계산한다.

`vectra`를 선택할 근거는 함수 catalog의 폭이다. `lodash-es`처럼 많은 함수를 제공하되 실제 사용자는
필요한 몇 개만 가져다 쓸 수 있어야 한다. leaf subpath 구조를 전제로, 프로젝트마다
반복해서 직접 구현하기 성가신 geometry/math helper를 폭넓게 제공한다.

핵심 정체성:

```txt
Broad geometry/math function catalog.
```

최종 제품이 넓어져도 `vectra`는 renderer, scene graph, editor state를 소유하지 않고
geometry/math 계산 catalog로 남는다.

입력은 structural `Like` object와 `XYInput`을 넓게 받고, object 결과는 caller가 제공한
writable output에 `Into` 함수로 기록한다. scalar, boolean, enum 결과는 직접 반환한다.
typed-array / array-like 좌표를 자동으로 해석하지 않는다.

## 패키징 원칙

`vectra`는 단일 package를 기본 배포 단위로 유지한다.

고급 기능은 package를 나누기보다 subpath domain으로 제공한다.

```txt
@cp949/vectra/vec
@cp949/vectra/path
@cp949/vectra/curve
@cp949/vectra/polygon
@cp949/vectra/editor-geometry
@cp949/vectra/svg-path
```

단일 package라고 해서 모든 사용자가 모든 비용을 부담해서는 안 된다. 함수 catalog가 커지는
것은 제품 가치에 속하지만, 사용하지 않는 함수는 bundler가 제거할 수 있어야 한다.

규칙:

- 모든 public domain은 domain barrel import를 1급 경로로 제공한다.
- leaf package subpath는 공개하지 않는다.
- domain barrel은 re-export만 한다.
- leaf module은 domain barrel을 import하지 않는다.
- module은 side-effect-free여야 한다.
- 고급 알고리즘 domain은 primitive domain을 무겁게 만들지 않는다.
- 공개 API는 function catalog이다.

예:

```ts
import * as EditorGeometryx from "@cp949/vectra/editor-geometry";
import * as SvgPathx from "@cp949/vectra/svg-path";

EditorGeometryx.snapPoint(point, options);
SvgPathx.parsePathData(pathData);
```

## Adapter의 의미

이 문서에서 adapter는 외부 format, protocol, framework object를 `vectra`의 structural
geometry data와 서로 바꾸는 얇은 경계 계층을 뜻한다.

adapter가 해도 되는 일:

- SVG path string을 path command data로 parse하거나 다시 string으로 export한다.
- DOMMatrix, CanvasRenderingContext2D 같은 외부 표현과 `vectra` structural data
  사이의 변환을 제공한다.
- 변환 과정에서 필요한 normalization, unit/order mapping, serialization precision을
  문서화한다.

adapter가 하면 안 되는 일:

- DOM element나 renderer object를 직접 mutate한다.
- scene graph, document model, editor state, selection, history를 소유한다.
- 외부 framework의 object lifecycle이나 naming을 `vectra` core public API로 끌어온다.

즉 adapter는 외부 세계와 `vectra` 계산 domain 사이의 입출력 변환층이며, 계산 결과의
소유권과 workflow orchestration은 caller에게 남긴다.

## 최종 포함 범위

다음 영역은 최종 제품 정체성에 포함한다.

### Core foundation

MVP의 foundation domain이다.

- `vec`
- `segment`
- `rect`
- `bounds`
- `circle`
- `matrix`
- `polyline`
- `polygon`
- `random`

이 영역은 모든 상위 알고리즘의 기반이다. tolerance, degeneracy, finite number
validation 같은 numeric policy도 이 단계에서 안정화해야 한다.

`random`은 geometry sampling 전용 부속품이 아니라, geometry-first math catalog로 확장되는
첫 foundation domain으로 다룬다. MVP에서는 `rng?: () => number` injection과 geometry-aware
sampling helper를 우선 제공하지만, 장기적으로는 seedable generator, selection/permutation,
확률 분포 sampling까지 확장할 수 있는 이름과 subpath 구조를 유지한다.

MVP 이후에는 `triangle`, `ellipse` 같은 primitive shape와 기존 shape 간 relation 함수를
보강한다. 정삼각형, 이등변 삼각형, 직각 삼각형 같은 분류는 별도 shape model로 고정하기보다
명확한 builder와 predicate 함수로 제공한다.

### Math catalog

`vectra`는 geometry 중심에서 출발하지만, random, easing, interpolation 같은 순수 math
function catalog도 정식 domain으로 포함할 수 있다. 이 영역은 상태ful engine이 아니라
side-effect-free function catalog와 명시적으로 주입 가능한 state boundary를 제공한다.

포함 후보:

- random generator / distribution / selection helper
- easing
- interpolation
- scalar Bezier / Catmull-Rom interpolation
- remap / inverse lerp / stepped function
- general numeric linear algebra (`linalg`)
- finite-difference calculus helper (`calculus`)
- descriptive statistics, covariance/correlation, least-squares, PCA (`statistics`)

단, animation/tween engine이나 simulation engine은 만들지 않는다. `@cp949/vectra/easing`은 상태와
timeline을 소유하지 않는 scalar function catalog이고, renderer/editor/game utility가 제공하지
않는 easing 누락을 메울 수 있도록 과하다 싶을 정도의 넓은 coverage를 목표로 한다.
`@cp949/vectra/random`은 caller가 generator state를 명시적으로 만들거나 주입할 수 있게 하되 전역
application randomness를 소유하지 않는다.

`linalg`/`calculus`/`statistics`는 S8 이후 장기 domain으로 둔다. 기존 `matrix` domain은
2D affine transform 전용으로 유지하고, general numeric matrix/vector API는 `linalg`가 소유한다.

### Path and curve

path와 curve 계산은 최종 제품의 core-adjacent domain이다.

- path command data
- line / quadratic Bezier / cubic Bezier
- arc
- Catmull-Rom spline
- B-Spline
- sampling
- length
- bounds
- flattening
- nearest point
- path / curve transform

path와 curve는 renderer/editor/game utility가 이미 보유한 helper와 일부 중복될 수 있다. 이
중복은 비목표가 아니라 adoption surface다. `vectra`는 path drawing을 대신하지 않지만,
Catmull-Rom, cardinal, B-Spline, Bezier chain, flattening, length, bounds, nearest-point 같은
반복 구현 비용이 큰 계산 leaf를 넓게 제공할 수 있어야 한다.

SVG path adapter는 이 domain 위에 올라가야 하며, path/curve foundation보다 먼저
공식화하지 않는다.

curve domain은 renderer-specific curve 구현을 검증하거나 대체할 수 있는 독립 계산
기준점이어야 한다. 예를 들어 Catmull-Rom spline은 `readonly XYInput[]` control point를
받고, open/closed, uniform/chordal/centripetal parameterization, endpoint handling 같은
정책을 명시적으로 제공해야 한다.

### Polygon topology and algorithms

polygon domain은 lightweight simple polygon 계산까지만 포함한다.

- winding / orientation
- containment and relation
- simplification
- cleanup and normalization

다음은 제품 비범위다.

- holes
- boolean operation
- offset
- triangulation
- self-intersection repair
- topology normalization

이 후보들은 heavy topology algorithm 또는 외부 algorithm bridge가 필요하다. 현재 product boundary는
`Broad geometry/math function catalog`이며, 무거운 polygon engine을 포함하지 않는다.

### Spatial and query

공간 index/query layer는 최종 제품 범위에서 제외한다.

비범위:

- spatial index
- range query
- nearest query
- broad-phase filtering
- hit-test acceleration
- query result ranking

editor-facing pure geometry helper는 `editor-geometry`가 소유한다. acceleration structure와 query
result ranking은 별도 spatial/query layer가 필요하므로 `vectra` public API에 추가하지 않는다.

### Editor-oriented geometry utility

`vectra`는 에디터 프레임워크가 되지 않지만, 에디터가 자주 필요로 하는 순수 geometry
계산 helper는 제공한다.

- snapping
- alignment guide geometry
- resize / rotate handle geometry
- selection bounds calculation
- transform helper
- hit-test helper
- geometry-only interaction constraints

이 API들은 모두 geometry data in/out으로 끝나야 한다. editor state, selection
model, command stack, history stack은 소유하지 않는다.

## 단계적 포함 범위

다음 영역은 최종 제품 범위에는 포함하지만, 기반 domain이 안정된 뒤 공식화한다.

### SVG path adapter

SVG path parse/export는 공식 domain으로 둘 수 있다.

여기서 adapter는 SVG DOM wrapper가 아니라 SVG path data string과 `vectra` path command
data 사이의 변환 계층이다.

허용 범위:

- SVG path string에서 `vectra` path command data로 parse
- `vectra` path command data에서 SVG path string으로 export
- path command normalization

제외 범위:

- SVG DOM element mutation
- browser DOM dependency
- renderer-specific drawing behavior

### External algorithm bridge

polygon boolean, offset, triangulation 같은 무거운 domain은 검증된 알고리즘을
이식하거나 bridge할 수 있다.

조건:

- public API는 `vectra` naming, input, output convention을 따른다.
- 외부 dependency는 해당 subpath/domain의 비용으로 격리한다.
- core primitive import가 무거워지면 안 된다.
- precision과 degeneracy behavior는 문서화해야 한다.

## 영구 비목표

다음 영역은 최종 제품에서도 하지 않는다.

- rendering
- SVG DOM element mutation
- scene graph
- editor state
- selection model ownership
- command / history stack
- physics engine behavior
- layout engine
- animation / tween engine
- framework-specific component layer

`@cp949/vectra/editor-*` domain이 생기더라도 의미는 "에디터가 필요한 geometry 계산"이지
"에디터 상태를 관리하는 framework"가 아니다.

## 단계별 목표

최종 제품은 다음 순서로 확장한다.

### Stage 0: API foundation

현재 문서화된 MVP 단계다. structural input, `Into`, subpath import, primitive
geometry catalog를 검증한다.

### Stage 1: Robust primitive catalog

MVP domain을 실제 구현하고 numeric policy를 안정화한다.

중점:

- exact / near equality
- tolerance handling
- degeneracy behavior
- finite number validation policy
- reusable internal primitive helper

### Stage 2: Path and curve foundation

SVG path adapter와 editor path utility의 기반이 되는 path/curve 계산 계층을 추가한다.

중점:

- path command data
- quadratic / cubic Bezier
- arc
- flattening, length, bounds, sampling
- SVG path data parse/export adapter
- math scalar core와 angle/interpolation/easing 후속 catalog

### Stage 3: Primitive shape expansion

MVP primitive catalog를 더 넓힌다.

중점:

- 기존 shape의 누락 함수 보강
- shape 간 relation matrix 확장
- `triangle`, `ellipse` domain 추가
- caller가 반복해서 직접 조합하던 계산을 public catalog로 제공

### Stage 6: Editor geometry utilities

snapping, alignment guide geometry, handle geometry, selection bounds, transform helper를
추가한다.

editor state, history, selection model은 계속 제외한다.

### 제품 비범위

다음 항목은 vectra에서 구현하지 않는다.

- polygon holes / winding / boolean / clipping / triangulation
- polygon offset / buffer / topology repair / self-intersection repair
- path stroke expansion / outline / cap / join / dash assembly
- spatial index / broad-phase acceleration / nearest query / range query / hit-test ranking

### Stage 7: Adapter and external format layer

외부 format/framework conversion layer를 추가한다.

중점:

- general adapter format helper
- framework boundary adapter review
- DOM/renderer mutation 제외
