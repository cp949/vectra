import { describe, expect, test } from 'vitest';
import * as interpolation from '../../../src/interpolation';

describe('interpolation barrel export 검증', () => {
  test('모든 scalar 함수가 domain barrel에서 export된다', () => {
    expect(typeof interpolation.unclampedLerp).toBe('function');
    expect(typeof interpolation.mix).toBe('function');
    expect(typeof interpolation.clampedLerp).toBe('function');
    expect(typeof interpolation.inverseLerp).toBe('function');
    expect(typeof interpolation.inverseLerpClamped).toBe('function');
    expect(typeof interpolation.remap).toBe('function');
    expect(typeof interpolation.remapClamped).toBe('function');
    expect(typeof interpolation.moveToward).toBe('function');
  });

  test('deterministic simulation helper가 domain barrel에서 export된다', () => {
    expect(typeof interpolation.exponentialDecay).toBe('function');
    expect(typeof interpolation.criticallyDamped).toBe('function');
    expect(typeof interpolation.springLerp).toBe('function');
  });

  test('모든 point helper 함수가 domain barrel에서 export된다', () => {
    expect(typeof interpolation.lerpPointInto).toBe('function');
    expect(typeof interpolation.lerpPoint).toBe('function');
    expect(typeof interpolation.midpointInto).toBe('function');
    expect(typeof interpolation.midpoint).toBe('function');
    expect(typeof interpolation.moveTowardPointInto).toBe('function');
    expect(typeof interpolation.moveTowardPoint).toBe('function');
    expect(typeof interpolation.bilerpPointInto).toBe('function');
    expect(typeof interpolation.bilerpPoint).toBe('function');
  });
});
