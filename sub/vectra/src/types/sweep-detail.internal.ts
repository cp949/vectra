import type { XYObjectWritable } from './xy.internal';

/**
 * axis-aligned bounds sweep time-of-impact 결과 detail.
 *
 * moving shape를 velocity 방향으로 stationary target bounds에 sweep한 closed-boundary
 * time-of-impact를 담는다. boolean relation으로 손실되는 hit time / contact normal / contact point /
 * start-overlap 구분을 노출한다.
 * - no-hit: `hit: false`, `time: Infinity`, `normal` `(0, 0)`, `contact` `(NaN, NaN)`, `startOverlap: false`.
 *   target을 빗나가는 경우, zero-velocity non-overlap, non-finite 입력, empty/inverted bounds가 모두 no-hit다.
 * - start-overlap: `hit: true`, `time: 0`, `startOverlap: true`, `normal` `(0, 0)`. contact는 helper별
 *   representative point다.
 * - proper hit: `hit: true`, `time` ∈ `[0, 1]` 정규화 sweep 비율, `normal`은 충돌 면의 axis-aligned
 *   outward normal, `contact`는 hit 시점의 representative point다.
 *
 * `normal`과 `contact`는 fixed plain object다. `Into` 함수가 이 nested object에 좌표를 기록하고
 * companion은 매 호출 새 nested object를 만든다. 면적/penetration depth/velocity 적분 상태는 담지 않는다.
 */
export interface BoundsSweepDetail {
  /** target에 닿으면 true. no-hit이면 false */
  hit: boolean;

  /** 정규화 sweep 비율 `[0, 1]`의 time-of-impact. no-hit은 `Infinity`, start-overlap은 `0` */
  time: number;

  /** 충돌 면의 axis-aligned outward normal. no-hit과 start-overlap은 `(0, 0)` */
  normal: XYObjectWritable;

  /** hit 시점의 representative contact point. no-hit은 `(NaN, NaN)` */
  contact: XYObjectWritable;

  /** 시작 시 이미 overlap이면 true */
  startOverlap: boolean;
}
