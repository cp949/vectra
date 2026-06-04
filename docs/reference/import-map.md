# Import Map

public import path는 package `exports` 기준이다.

## Root와 types

| 목적 | Import |
| --- | --- |
| 편의 root import | `@cp949/vectra` |
| shared type import | `@cp949/vectra/types` |

## Domain subpath

```ts
import * as Vecx from '@cp949/vectra/vec';
import * as Segmentx from '@cp949/vectra/segment';
import * as Rectx from '@cp949/vectra/rect';
import * as Boundsx from '@cp949/vectra/bounds';
import * as Circlex from '@cp949/vectra/circle';
import * as Intersectx from '@cp949/vectra/intersects';
import * as Curvex from '@cp949/vectra/curve';
import * as SvgPathx from '@cp949/vectra/svg-path';
```

전체 domain 목록은 [Domain 지도](./domains.md)를 본다.

## 내부 path 금지

다음 형태는 public contract가 아니다.

```ts
import { add } from '@cp949/vectra/dist/vec/add.js';
import { add } from '@cp949/vectra/src/vec/add';
```

consumer code는 package export path만 사용한다.
