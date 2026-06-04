import { describe, expect, test } from 'vitest';
import * as sdf from '../../../src/sdf';

describe('sdf domain', () => {
  test('domain barrel을 import할 수 있다', () => {
    expect(sdf).toBeTypeOf('object');
    expect(sdf.sdfCircle).toBeTypeOf('function');
    expect(sdf.sdfRect).toBeTypeOf('function');
    expect(sdf.sdfSegment).toBeTypeOf('function');
    expect(sdf.sdfCapsule).toBeTypeOf('function');
    expect(sdf.sdfOrientedRect).toBeTypeOf('function');
    expect(sdf.sdfAnnulus).toBeTypeOf('function');
    expect(sdf.sdfPolygon).toBeTypeOf('function');
    expect(sdf.sdfRoundedRect).toBeTypeOf('function');
    expect(sdf.sdfUnion).toBeTypeOf('function');
    expect(sdf.sdfIntersection).toBeTypeOf('function');
    expect(sdf.sdfSubtraction).toBeTypeOf('function');
  });
});
