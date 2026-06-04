import type { CircleLike, XYObjectWritable } from '../types';
import { pointAtTurnInto } from './point-at-turn-into';

/**
 * turn * 2π 각도 위치의 circle 표면 point를 새 object로 반환한다.
 *
 * turn은 wrap하지 않고 그대로 사용한다. radius <= 0인 empty circle은 center 좌표를 반환한다.
 *
 * @param circle 표면 point를 계산할 circle
 * @param turn normalized angle fraction (turn = angle / (2π))
 */
export function pointAtTurn(circle: CircleLike, turn: number): XYObjectWritable {
  return pointAtTurnInto({ x: 0, y: 0 }, circle, turn);
}
