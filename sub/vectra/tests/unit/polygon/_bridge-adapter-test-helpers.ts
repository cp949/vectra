/**
 * polygon 변환 테스트가 함께 쓰는 삼각형과 정사각형 fixture를 모은다.
 */
import type { Polygon } from '../../../src/types/flat-shapes.internal';

export const TRIANGLE: Polygon = [0, 0, 4, 0, 0, 3];

export const SQUARE: Polygon = [0, 0, 2, 0, 2, 2, 0, 2];
