# Sandbox 예제 source의 barrel import allowlist 누락

태그: `testing`, `sandbox`, `examples`, `imports`

## 함정

playground sandbox는 예제 source의 정적 import를 `allowedSpecifiers`와 정확히 비교한다.

예제 source의 기본 import 정책은 domain barrel namespace import다.

```ts
import * as Circlex from '@cp949/vectra/circle';
import * as Segmentx from '@cp949/vectra/segment';
```

하지만 runtime module map에 `@cp949/vectra/circle`, `@cp949/vectra/segment` 같은 domain barrel이 등록되어 있어도,
compile allowlist에 같은 barrel specifier가 없으면 차단된다. runtime module map과 맞아 보여도
allowlist가 leaf specifier만 담고 있으면 compile 단계에서 실패한다.

## 증상

예제 preview diagnostics에 다음 형태의 import 오류가 뜬다.

```txt
허용되지 않은 import: '@cp949/vectra/circle'. vectra 하위 경로만 사용할 수 있습니다.
허용되지 않은 import: '@cp949/vectra/segment'. vectra 하위 경로만 사용할 수 있습니다.
```

## 방지

예제 source는 기본 정책대로 domain barrel namespace import를 유지한다. sandbox allowlist에 같은
domain barrel specifier를 추가한다.

```ts
import * as Circlex from '@cp949/vectra/circle';
import * as Segmentx from '@cp949/vectra/segment';

Circlex.closestPointInto(out, circle, point);
Circlex.pointAtAngleInto(out, circle, angle);
Segmentx.pointAtInto(out, segment, t);
```

새 예제를 추가할 때 raw source를 실제 app sandbox allowlist로 `compileForSandbox` 실행하는 테스트를
추가한다. source 파일 존재/등록 테스트만으로는 allowlist 불일치를 잡지 못한다.

## 관련 작업

- `pixi-demo:orbit-segment`에서 `@cp949/vectra/circle`, `@cp949/vectra/segment` barrel import가 Pixi sandbox
  allowlist와 맞지 않아 compile diagnostics가 발생했다.
- `pixi-demo:vector-steering-field`에서 `@cp949/vectra/angle` barrel allowlist를 추가해
  `import * as Anglex from '@cp949/vectra/angle'` 정책을 적용했다.
