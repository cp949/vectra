# Circle tangent angle: degenerate case와 angle dedupe 함정

태그: `circle`, `tangent`, `degenerate`, `angle`, `modulo-2pi`

## 함정

circle tangent angle helper에서 접선 존재 여부와 반환 cardinality를 `angle ± beta` 두 개
push로 단순 처리하면 두 가지 케이스가 깨진다.

1. `radius <= 0` empty circle에서도 각도가 2개 반환된다.
2. 외접 inner tangent / 내접 outer tangent에서 두 tangent angle이 같아져
   `0/0` 또는 `π/-π` 형태로 중복 반환된다.

`π`와 `-π`는 직접 equality에서는 다르지만 angular distance로는 0이다.

## 증상

- empty circle에서 의미 없는 두 angle 반환.
- collapse case(circle이 내·외접 한 점에서 만남)에서 같은 점에 해당하는 angle을 두 번 반환.
- `−π`와 `π`가 분리되어 dedupe되지 않는다.

## 방지

- `radius <= 0`은 empty output(`count === 0`)으로 고정한다.
- angle dedupe는 직접 numeric equality가 아니라 `2π` modulo angular distance로 처리한다.

  ```ts
  // 두 각도를 [-π, π] 구간에서 비교하기 전에 2π modulo 거리로 환원
  const d = Math.abs(((a - b + Math.PI) % (2 * Math.PI)) - Math.PI);
  if (d <= eps) { /* duplicate */ }
  ```

- 외접/내접 collapse case regression test를 추가한다(예: 두 원이 한 점에서만 만나는 구성).

## 관련 작업

- `_works/S3-RM-019/20260520-01-lightweight-construction-query-followups/함정.md`
