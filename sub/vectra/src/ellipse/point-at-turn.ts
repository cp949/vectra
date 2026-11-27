import type { Ellipse, PointWritable } from '../types/flat-shapes.internal';
import { pointAtTurnInto } from './point-at-turn-into';

/**
 * 매개변수 turn 위치의 ellipse 표면 point를 plain object로 반환한다.
 *
 * angle = turn * 2 * Math.PI로 변환한다. turn wrap/clamp 없음.
 * rx <= 0 또는 ry <= 0인 empty ellipse는 center를 반환한다.
 *
 * @param ellipse 표면 point를 계산할 ellipse
 * @param turn [0, 1) 범위를 가정하는 angle fraction (wrap 없음)
 */
export function pointAtTurn(ellipse: Ellipse, turn: number): PointWritable {
  return pointAtTurnInto({ x: 0, y: 0 }, ellipse, turn);
}
