# Into/companion 함수 return type 일관성

태그: `api-policy`, `Into`, `companion`, `barrel-export`

## 함정

`*Into(out, ...)` 함수가 명명된 type(`AngleSet`, `BarycentricWritable` 등)을 export하는데,
allocating companion이 같은 type을 재사용하지 않고 inline anonymous type을 return type으로
쓰는 실수.

동시에 domain `index.ts`에서 명명된 type을 함께 re-export하지 않아 외부 소비자가 type 이름에
접근하지 못하는 실수가 같이 발생한다.

```ts
// 함정: companion이 inline anonymous return type을 쓴다
export function solveSss(...): { a: number; b: number; c: number } | undefined { ... }

// 함정: domain index.ts에서 type re-export 누락
export { solveSssInto, solveSss } from './solve-sss.js';
// AngleSet이 빠져 외부에서 import할 수 없다
```

## 증상

- 외부 소비자가 companion 반환값을 받아 다른 함수에 넘기려면 익명 type을 손으로 다시 적어야 한다.
- IDE hover에서 각 필드의 문서(예: "변 X의 대각(radian)")가 사라진다.
- 같은 모양의 type이 코드베이스 여기저기에서 익명으로 중복된다.

## 방지

`Into` 함수가 `interface`/`type`을 export하면:

1. companion의 return signature와 local seed 변수 모두 그 명명된 type을 사용한다.
2. 같은 commit에서 domain `index.ts`에 `export { type <TypeName>, <fn>Into, <fn> }` 형태로
   type과 두 함수를 함께 re-export한다.

```ts
// 권장 형태
export function solveSss(...): AngleSet | undefined {
  const out: AngleSet = { a: 0, b: 0, c: 0 };
  return solveSssInto(out, ...) ? out : undefined;
}

// triangle/index.ts
export {
  type AngleSet,
  solveSssInto,
  solveSss,
} from './solve-sss.js';
```

새 `Into` + companion 쌍을 추가할 때 기존 `barycentric` 패턴을 참고 모델로 둔다.

## 관련 작업

- `_works/S3-RM-019/20260520-01-lightweight-construction-query-followups/함정.md`
