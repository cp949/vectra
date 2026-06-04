# 시작하기

`@cp949/vectra`는 TypeScript geometry/math function catalog다.
렌더러, DOM, scene graph, editor state를 소유하지 않는다.
입력 data를 받아 계산 결과를 반환하거나 caller가 제공한 output object에 기록한다.

## 설치

```sh
npm install @cp949/vectra
```

## 지원 범위

| 항목 | 기준 |
| --- | --- |
| Runtime | Node.js `>=20.19.0`에서 검증 |
| Module format | ESM only |
| Dependencies | runtime dependency 없음 |
| TypeScript | package가 제공하는 `.d.ts` 사용 |
| Coordinates | `{ x, y }` object 또는 readonly `[x, y]` tuple |

## 첫 계산

```ts
import * as Vecx from '@cp949/vectra/vec';
import * as Segmentx from '@cp949/vectra/segment';

const a = { x: 0, y: 0 };
const b = [3, 4] as const;

const sum = Vecx.add(a, b);
const distance = Segmentx.length([a, b]);

console.log(sum); // { x: 3, y: 4 }
console.log(distance); // 5
```

## 다음 문서

- [Import 방식](./imports.md): domain barrel import와 root import 차이를 확인한다.
- [Output과 Into](./outputs-and-into.md): allocation과 caller-owned output 재사용을 선택한다.
- [Input과 shape](./inputs-and-shapes.md): `{ x, y }`, tuple, `XxxLike` 규칙을 확인한다.
- [Domain 지도](../reference/domains.md): 필요한 기능이 어느 domain에 있는지 찾는다.
