import { describe, expect, test } from 'vitest';
import * as fitting from '../../../src/fitting';

describe('fitting domain', () => {
  test('domain barrel을 import할 수 있다', () => {
    expect(fitting).toBeTypeOf('object');
    expect(fitting.principalDirectionsInto).toBeTypeOf('function');
    expect(fitting.principalDirections).toBeTypeOf('function');
    expect(fitting.fitLineToPointsInto).toBeTypeOf('function');
    expect(fitting.fitLineToPoints).toBeTypeOf('function');
    expect(fitting.fitCircleToPointsInto).toBeTypeOf('function');
    expect(fitting.fitCircleToPoints).toBeTypeOf('function');
    expect(fitting.fitMinimumAreaRectInto).toBeTypeOf('function');
    expect(fitting.fitMinimumAreaRect).toBeTypeOf('function');
  });
});
