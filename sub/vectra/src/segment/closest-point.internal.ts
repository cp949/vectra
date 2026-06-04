/**
 * segment closest-point raw kernel.
 *
 * scalar 입출력 전용 internal helper. validation 없음. 호출자가 유효한 좌표를 보장한다.
 * 실제 구현은 cross-domain 공유를 위해 `../internal/segment.ts`의 `segmentClosestPointXY`에
 * 위치한다. 이 모듈은 기존 import 경로를 유지하기 위한 alias이다.
 */
export { segmentClosestPointXY as closestPointOnSegment } from '../internal/segment';
