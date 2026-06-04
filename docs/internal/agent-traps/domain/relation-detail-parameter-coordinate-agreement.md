# relation detail은 parameter range만으로 point/overlap을 확정하지 않는다

태그: `geometry`, `relation-detail`, `parameter`, `endpoint`, `float64`

## 함정

segment/line relation detail helper에서 `tA`, `tB`가 `[0, 1]` 안에 있다는 이유만으로
`point`나 `overlap`을 반환하면 false positive가 생긴다.

float64에서는 raw determinant, scaled parameter, mapped interval 계산이 endpoint 근처에서
`0` 또는 `1`로 반올림될 수 있다. 그 parameter가 가리키는 endpoint 좌표와 실제 반환 좌표가
`epsilon` 밖이어도 range check만 통과하면 잘못된 detail을 반환한다.

## 증상

- `segmentSegmentDetail(a, b)`가 `{ kind: 'point', tA: 1, tB: -0 }`를 반환하지만
  `a.b`와 `b.a`가 같은 좌표가 아니다.
- `collinearOverlapFromMappedInterval`이 `overlap`을 반환하지만 `start`/`end`가 반대
  segment 직선에서 `epsilon` 밖이다.
- zero-length point가 huge segment 위에 있다고 판정되지만, `t=1`이 가리키는 실제 endpoint와
  point 좌표가 다르다.
- boolean helper와 detail helper의 hit/no-hit parity만 fuzz하면 좌표가 틀린 detail을 놓친다.

## 방지

detail 반환 직전에 coordinate agreement를 검증한다.

- `point`: 반환 좌표가 양쪽 segment 직선에서 `epsilon` 이내인지 확인한다.
- `point`: `t === 0` 또는 `t === 1`이면 해당 endpoint 좌표와도 `epsilon` 이내인지 확인한다.
- endpoint parameter가 내부 교점의 반올림일 수 있는 경로는 별도 조건으로 제한한다.
  예: 선택한 보간점이 자기 segment 내부점에서 나왔고, 반대 segment 재투영 parameter가 `[0, 1]`이면
  endpoint 좌표 strict check를 완화할 수 있다.
- `overlap`: `start`와 `end`가 양쪽 segment에서 모두 유효한 좌표인지 확인한다.
- mapped interval fallback에서는 반대 segment의 보간 `start`/`end`가 같은 좌표로 붕괴하면
  길이 있는 `overlap`을 반환하지 않는다.
- fuzz invariant는 parity뿐 아니라 반환 좌표의 line distance / endpoint agreement를 검사한다.

## 관련 작업

- `_works/S10-RM-003/20260529-01-intersects-relation-detail-result-types/02-작업결과.md`
  - F5~F13, F15: `segmentSegmentDetail`의 endpoint 반올림, mapped interval, zero-length containment,
    line-distance agreement false positive/false negative 수정.
