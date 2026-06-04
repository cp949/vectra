# arc-length sampling의 `distance === totalLength` 경계: trailing zero-length segment에 귀속되지 않게 strict `<`를 사용한다

태그: `path`, `arc-length`, `sampling`, `boundary`, `zero-length-segment`

## 함정

cumulative arc-length traversal에서 `distance`가 어느 segment에 귀속되는지 판정할 때
`cumulative + segLen <= distance < cumulative + nextSegLen`처럼 inclusive 비교(`<=`)를
쓰면, 마지막 drawing segment 직전에 zero-length segment가 있을 때 `distance === totalLength`가
이전 non-zero segment에 귀속된다.

```ts
// 함정: inclusive `<=`로 segment 범위 판정
if (distance <= cumulativeLen + segLen) {
  // distance === totalLength이고 다음에 zero-length segment가 이어지면
  // 마지막 zero-length segment가 아닌 이전 non-zero segment의 끝점에 귀속됨
  return computePoint(seg, distance - cumulativeLen);
}
cumulativeLen += segLen;
```

대표 증상:

- `locationAtLength(commands, length(commands))`가 마지막 drawing segment 대신 이전 segment를
  반환한다.
- `tangentAtLength` / `normalAtLength`가 trailing zero-length segment의 zero vector fallback을
  건너뛴다.
- `propertiesAtLength`, `curvatureAtLength` 등 동일 traversal 로직을 쓰는 다른 helper도
  연쇄적으로 같은 회귀를 가진다.

## 증상

```ts
// totalLength = 10, 마지막에 zero-length close segment가 있는 path
locationAtLength(commands, 10)
// 기대: { segmentIndex: lastDrawIdx, t: 1 } 또는 zero-length segment 시작
// 실제: { segmentIndex: lastDrawIdx - 1, t: 1 } (이전 non-zero segment 끝점)
```

## 방지

- `distance <= 0`은 첫 segment 시작점으로 별도 처리한다.
- 내부 segment 범위 판정은 strict `<`를 사용한다: `distance < cumulativeLen + segLen`.
- `distance >= totalLength`는 traversal 종료 후 fallback으로 마지막 drawing segment 끝점에
  귀속한다.

```ts
// 올바른 형태
if (distance <= 0) return startAnchor();
let cumulativeLen = 0;
for (const seg of drawSegments) {
  const segLen = lengthOf(seg);
  if (distance < cumulativeLen + segLen) {
    return computePoint(seg, distance - cumulativeLen);
  }
  cumulativeLen += segLen;
}
return endAnchor(); // distance >= totalLength fallback
```

회귀 방지 테스트:

- trailing zero-length close segment가 있는 path에서 `distance === totalLength` 케이스.
- consecutive zero-length segment 중간 boundary 케이스.
- empty path / Move-only path에서 `distance === 0`.

## 관련 작업

- `_works/S3-RM-028/20260522-01-path-follow-up/` TASK-04 리뷰-수정 B2.
  `propertiesAtLength`, `locationAtLength`, `curvatureAtLength`의 내부 범위 판정을
  `distance <= 0 || distance < cumulativeLen + segLen`로 수정.
