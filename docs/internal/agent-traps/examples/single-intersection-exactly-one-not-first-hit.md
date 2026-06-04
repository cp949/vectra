# `singleIntersection*`는 "첫 hit"가 아니라 "교점이 정확히 1개"일 때만 점을 준다

태그: `examples`, `intersects`, `semantic`, `pixi-demo`

## 함정

`intersects/singleIntersection<Line><Shape>`(segment/ray/infinite-line × circle/ellipse/rect/
triangle/bounds) 계열을 "선이 도형에 부딪치는 첫 번째 점(nearest hit)"으로 가정해 예제를 만든다.

실제 정책은 다르다. `internal/line-family-*`는 **range 안 교점이 정확히 1개일 때만** 점을 반환하고,
다음은 모두 `undefined`다.

- 교점 0개 (빗나감)
- 교점 2개 (선이 도형을 가로질러 들어갔다 나옴)
- 도형 내부에 선분 전체가 들어감 (contained)
- empty shape / degenerate direction

따라서 "바깥에서 도형을 겨냥하는 빔" 같은 가장 흔한 장면(2점 crossing)에서는 점이 안 나온다.
"첫 hit" 데모로 만들면 핵심 동작에서 화면이 비어 사용자가 혼란스럽다.

```txt
잘못: emitter를 도형 밖에 두고 ray로 도형을 겨냥 → 보통 2점 crossing → singleIntersection = undefined
```

## 증상

- 빔/선분이 분명히 도형을 통과하는데 marker가 안 그려진다.
- "겨냥하면 가끔 점이 보이고(접선·스침) 보통은 안 보인다" — 접선(measure-zero)에서만 1점이라 그렇다.
- diagnostics가 거의 항상 `no hit` / `contained`로 표시된다.
- nearest/first-hit 좌표를 얻으려 했는데 2점 case가 사라진다.

## 방지

`singleIntersection*`을 예제 주제로 쓰려면 "교점이 정확히 1개"가 **신뢰성 있게** 성립하는 장면으로
모델링한다.

- 한 끝점(또는 ray origin)을 도형 **내부**에 고정한다. 그러면 반대쪽이 바깥일 때 경계를 정확히 한 번만
  통과하므로 항상 단일 exit point가 나온다. 반대쪽도 안쪽이면 contained(undefined)가 되어 그 자체가
  `singleIntersection` semantic의 시연이 된다.
- 또는 접선(tangent) 검출이 주제임을 명시한다. 단, 접선은 드래그로 맞추기 어려운 measure-zero라 주
  조작 흐름으로는 부적합하다.

"바깥에서 들어오는 빔의 첫 명중점(nearest hit)"이 필요하면 이 계열이 아니라 **plural intersections**
함수(`rayCubicIntersections` 등)에서 가장 가까운 hit을 직접 고른다. 단, 도형에 plural 함수가 없으면
(예: segment×ellipse) "내부 anchor → 단일 exit" 흐름으로 예제를 설계한다.

## 계획서 체크

`01-계획.md`에 `singleIntersection*` leaf를 쓸 때 다음을 확인한다.

- 이 함수가 "정확히 1개"일 때만 점을 반환한다는 점을 적었는가.
- 장면 모델링이 그 1점 case를 reliable하게 만드는가(내부 anchor 고정 등). 0/2점 case가 주 동작이면
  화면이 비는 설계 결함이다.
- `internal/line-family-*.ts`의 case 표(no hit / tangent / 2-point / 1-point / contained)로 동작을
  교차 검증했는가.

## 발견 맥락

- `_works/S1-RM-013/20260526-148-segment-ellipse-exit-example/`:
  `singleIntersectionSegmentEllipse`를 "선분이 타원을 통과하는 단일 exit point"로 다루면서, A를 타원
  내부에 고정해 "B 바깥 ⇒ exit 1개 / B 안쪽 ⇒ contained" binary로 유도했다. 만약 양 끝을 모두 바깥에
  두고 "선분이 타원을 가로지르는 점"을 보이려 했다면 2점 crossing이라 항상 undefined가 되어 예제가
  깨졌을 것이다.
