# transformed rect: AABB와 rotated outline을 혼동하지 않는다

태그: `examples`, `canvas-demo`, `matrix`, `transformRectInto`, `AABB`

## 함정

`matrix.transformRectInto(out, matrix, rect)` 결과를 회전된 rect 자체로 보고 `draw.rect`로 그리는
실수.

`transformRectInto`는 rect의 네 corner를 matrix로 변환한 뒤, 그 점들을 감싸는 axis-aligned
bounding box(AABB)를 반환한다. 즉 회전 성분이 있어도 반환 shape는 항상 축 정렬 rect다.

```ts
// 함정: R(30deg)가 적용되어도 화면에는 축 정렬 사각형만 보인다
Matrices.transformRectInto(transformed, TRS, rect);
d.rect(ctx, transformed, { stroke: '#38bdf8' });
```

## 증상

- 라벨은 `R(30°)`인데 화면의 변환 결과가 회전하지 않은 사각형처럼 보인다.
- 행렬 값은 `a=cos(30)*scaleX`, `b=sin(30)*scaleX`, `c=-sin(30)*scaleY`,
  `d=cos(30)*scaleY`로 30도 회전이 맞다.
- 사용자가 "R(30)이면 30도 회전해야 하는 것 아닌가?"라고 지적하게 된다.

## 방지

예제가 "회전된 도형"을 보여줘야 하면 네 corner를 `transformPointInto`로 직접 변환하고
`polygon` 또는 `polyline`으로 그린다.

```ts
const transformedRect = {
  points: [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ],
};

Matrices.transformPointInto(transformedRect.points[0], matrix, { x: rect.x, y: rect.y });
Matrices.transformPointInto(transformedRect.points[1], matrix, { x: rect.x + rect.width, y: rect.y });
Matrices.transformPointInto(transformedRect.points[2], matrix, {
  x: rect.x + rect.width,
  y: rect.y + rect.height,
});
Matrices.transformPointInto(transformedRect.points[3], matrix, { x: rect.x, y: rect.y + rect.height });

d.polygon(ctx, transformedRect, { stroke: '#38bdf8' });
```

`transformRectInto`를 함께 쓰는 경우에는 AABB임을 라벨/주석/시각 스타일로 분명히 구분한다.

회귀 테스트는 `rect` 호출 여부만 보지 말고, `polygon` 또는 `polyline`에 기록된 transformed corner
좌표가 실제 회전 성분을 포함하는지 확인한다.

## 관련 작업

- `apps/canvas-demo/src/examples/matrix-transform/source.exam.ts`
