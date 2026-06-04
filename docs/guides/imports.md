# Import 방식

권장 기본값은 domain barrel import다.

```ts
import * as Vecx from '@cp949/vectra/vec';
import * as Circlex from '@cp949/vectra/circle';
```

## Domain barrel import

domain barrel은 한 domain의 public 함수를 모아 제공한다.
호출부에서 어떤 geometry 영역을 쓰는지 드러난다.

```ts
import * as Rectx from '@cp949/vectra/rect';

const frame = Rectx.rectFrom(0, 0, 320, 180);
const center = Rectx.centerInto({ x: 0, y: 0 }, frame);
```

## Root import

root import는 편의용이다.
여러 domain을 한 파일에서 섞어 쓰는 경우 domain 경계가 흐려진다.

```ts
import { VECTRA_PACKAGE_NAME } from '@cp949/vectra';

console.log(VECTRA_PACKAGE_NAME); // '@cp949/vectra'
```

사용자 코드에서는 domain barrel import를 먼저 선택한다.

## Package export 기준

public import path는 `sub/vectra/package.json` `exports`에 있는 경로다.
현재 문서는 root, `types`, domain subpath를 기준으로 설명한다.

```ts
import type { XYInput } from '@cp949/vectra/types';
import * as Intersectx from '@cp949/vectra/intersects';
import * as SvgPathx from '@cp949/vectra/svg-path';
```

source file path나 `dist` 내부 path를 직접 import하지 않는다.

## 이름 규칙

예제에서는 domain namespace에 `x` suffix를 붙인다.

```ts
import * as Segmentx from '@cp949/vectra/segment';
import * as InfiniteLinex from '@cp949/vectra/infinite-line';
```

이름은 필수가 아니다. 호출부에서 domain을 구분하기 위한 문서 convention이다.
