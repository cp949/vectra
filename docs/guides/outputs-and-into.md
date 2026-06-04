# Output과 Into

object 결과를 만드는 API는 보통 두 형태를 제공한다.

- allocating companion: 새 plain object를 반환한다.
- `*Into`: caller가 제공한 output object를 mutate하고 반환한다.

## Allocating companion

읽기 쉬운 code가 우선이면 allocating companion을 사용한다.

```ts
import * as Vecx from '@cp949/vectra/vec';

const sum = Vecx.add({ x: 1, y: 2 }, [3, 4]);

console.log(sum); // { x: 4, y: 6 }
```

## `*Into`

반복 계산, hot path, 외부 object 재사용이 필요하면 `*Into`를 사용한다.

```ts
import * as Vecx from '@cp949/vectra/vec';

const out = { x: 0, y: 0 };
const returned = Vecx.addInto(out, { x: 1, y: 2 }, [3, 4]);

console.log(out); // { x: 4, y: 6 }
console.log(returned === out); // true
```

## 외부 object에 기록

`*Into`는 caller-owned writable object를 보존한다.

```ts
import * as Vecx from '@cp949/vectra/vec';

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

const out = new Point(0, 0);
Vecx.scaleInto(out, [3, 4], 2).translateX(10);

console.log(out); // Point { x: 16, y: 8 }
```

## 실패 sentinel

결과가 존재하지 않는 geometry 계산은 함수별 sentinel을 반환한다.
많은 object-output API는 다음 패턴을 따른다.

```ts
const intoResult = someFunctionInto(out, input);
// 성공: out 또는 true
// 실패: false

const result = someFunction(input);
// 성공: 새 object
// 실패: undefined
```

정확한 sentinel은 각 함수 JSDoc을 기준으로 한다.
