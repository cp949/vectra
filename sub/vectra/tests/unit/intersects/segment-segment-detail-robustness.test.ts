/**
 * segmentSegmentDetail non-finite와 overflow 강건성 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { intersectsSegmentSegment } from '../../../src/intersects/intersects-segment-segment';
import { segmentSegmentDetail } from '../../../src/intersects/segment-segment-detail';
import { EXPECTED_PRECISION, expectOverlapDetail, expectPointDetail, segment } from './_helpers/segment-segment-detail';

describe('segmentSegmentDetail — non-finite input', () => {
  test.each([
    ['NaN endpoint', Number.NaN],
    ['Infinity endpoint', Number.POSITIVE_INFINITY],
    ['-Infinity endpoint', Number.NEGATIVE_INFINITY],
  ])('%s는 false positive detail을 만들지 않는다', (_label, x) => {
    const a = { a: { x: 0, y: 0 }, b: { x: 1, y: 0 } };
    const b = { a: { x, y: 0 }, b: { x, y: 0 } };

    expect(intersectsSegmentSegment(a, b)).toBe(false);
    expect(segmentSegmentDetail(a, b)).toEqual({ kind: 'none' });
  });

  test('overflow가 발생한 non-parallel parameter 계산은 scaled ratio로 교점을 보존한다', () => {
    const a = segment(0, 0, 1e308, 0);
    const b = segment(1, -1, 1, 1);
    const result = segmentSegmentDetail(a, b);

    expect(intersectsSegmentSegment(a, b)).toBe(true);
    expectPointDetail(result, { tB: 0.5 });
    if (result.kind !== 'point') return;
    expect(result.point.x).toBeCloseTo(1, EXPECTED_PRECISION);
    expect(result.point.y).toBeCloseTo(0, EXPECTED_PRECISION);
    // tA는 1/1e308 = 1e-308. 상대비로 검증한다.
    expect(result.tA).toBeGreaterThan(0);
    expect(result.tA / 1e-308).toBeCloseTo(1, 6);
  });

  test('overflow로 raw determinant가 NaN인 shared-start non-parallel 교차를 보존한다', () => {
    expectPointDetail(segmentSegmentDetail(segment(0, 0, 1e308, 1e308), segment(0, 0, 1e308, 5e307)), {
      point: { x: 0, y: 0 },
      tA: 0,
      tB: 0,
    });
  });

  test('overflow fallback parameter가 서로 다른 좌표를 가리키면 false positive point를 만들지 않는다', () => {
    const a = { a: { x: -1e300, y: 1e300 }, b: { x: -1, y: -8.608876899816096 } };
    const b = {
      a: { x: 0.0005643832152709365, y: 1.897205092245713e150 },
      b: { x: -4.538800939917564, y: -9.461288852617144e-13 },
    };

    expect(intersectsSegmentSegment(a, b)).toBe(false);
    expect(segmentSegmentDetail(a, b)).toEqual({ kind: 'none' });
  });

  test('finite raw parameter가 endpoint로 반올림돼도 좌표가 맞지 않으면 point를 만들지 않는다', () => {
    const a = {
      a: { x: -924336153.5482109, y: -1.1904823965000841e-177 },
      b: { x: 0.13754264637827873, y: 7.316391812637448e149 },
    };
    const b = {
      a: { x: -117800693.30678642, y: 6.383964766911274e149 },
      b: { x: -594992512.2769618, y: 2.6068515344044037e149 },
    };

    expect(intersectsSegmentSegment(a, b)).toBe(true);
    expect(segmentSegmentDetail(a, b)).toEqual({ kind: 'none' });
  });

  test('반대 segment parameter가 endpoint로 반올림돼도 실제 교점이 내부에 있으면 point를 유지한다', () => {
    const a = {
      a: { x: 0.08086641319096088, y: -7.871134574525059e-301 },
      b: { x: 3.997393101453781, y: -5.993853555992246e-97 },
    };
    const b = {
      a: { x: -1.1864615697413683, y: 1e150 },
      b: { x: 0.748881776817143, y: -1.5541316056624055 },
    };

    expect(intersectsSegmentSegment(a, b)).toBe(true);
    const result = segmentSegmentDetail(a, b);
    expectPointDetail(result, { tA: 0.17056320990435564, tB: 1 });
    if (result.kind !== 'point') return;
    expect(result.point.x).toBeCloseTo(0.748881776817143, EXPECTED_PRECISION);
    expect(result.point.y).toBeCloseTo(0, EXPECTED_PRECISION);
  });

  test('보간 좌표가 자기 segment 직선에서도 epsilon 밖이면 point를 만들지 않는다', () => {
    const a = {
      a: { x: -8.717312589287757e149, y: 0 },
      b: { x: -3.7816940667107703e-10, y: -5.682831492740661e149 },
    };
    const b = {
      a: { x: 581359851.6397178, y: -4.288322012871504 },
      b: { x: -3.786518750712276e299, y: 6.558268936350942 },
    };

    expect(segmentSegmentDetail(a, b)).toEqual({ kind: 'none' });
  });

  test('scale-normalized line distance가 이탈을 잃어도 dominant-axis residual로 point를 차단한다', () => {
    const a = {
      a: { x: -0.9783775592498536, y: 1.4844428292876604 },
      b: { x: -9.390949509131703e228, y: 9.733463372740316e-169 },
    };
    const b = {
      a: { x: -4.360909422166593, y: 521100236047642460000 },
      b: { x: -9.546393670572151e277, y: -7.16209111340393e190 },
    };

    expect(segmentSegmentDetail(a, b)).toEqual({ kind: 'none' });
  });

  test('overflow로 raw determinant가 NaN인 collinear overlap을 보존한다', () => {
    expectOverlapDetail(segmentSegmentDetail(segment(0, 0, 1e308, 1e308), segment(5e307, 5e307, 1e308, 1e308)), {
      start: { x: 5e307, y: 5e307 },
      end: { x: 1e308, y: 1e308 },
      tA: [0.5, 1],
      tB: [0, 1],
    });
  });

  test('endpoint 차이가 overflow되는 collinear endpoint touch는 point를 반환한다', () => {
    expectPointDetail(segmentSegmentDetail(segment(-1e308, 0, 1e308, 0), segment(1e308, 0, 1.1e308, 0)), {
      point: { x: 1e308, y: 0 },
      tA: 1,
      tB: 0,
    });
  });

  test('전체 길이가 overflow되는 collinear overlap은 overlap을 반환한다', () => {
    expectOverlapDetail(
      segmentSegmentDetail(segment(0, 0, 1.3e308, 1.3e308), segment(6.5e307, 6.5e307, 1.3e308, 1.3e308)),
      {
        start: { x: 6.5e307, y: 6.5e307 },
        end: { x: 1.3e308, y: 1.3e308 },
        tA: [0.5, 1],
        tB: [0, 1],
      }
    );
  });

  test('endpoint 차이가 overflow되는 non-parallel 교점 좌표는 작은 segment 보간으로 보존한다', () => {
    expectPointDetail(segmentSegmentDetail(segment(-1e308, 0, 1e308, 0), segment(1, -1, 1, 1)), {
      point: { x: 1, y: 0 },
      tA: 0.5,
      tB: 0.5,
    });
  });

  test('거대 segment 안의 작은 collinear overlap은 원본 endpoint 좌표를 보존한다', () => {
    expectOverlapDetail(segmentSegmentDetail(segment(-1e308, 0, 1e308, 0), segment(-1, 0, 1, 0)), {
      start: { x: -1, y: 0 },
      end: { x: 1, y: 0 },
      tB: [0, 1],
    });
  });

  test('epsilon-parallel shared endpoint와 먼 non-collinear endpoint는 point를 반환한다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 1e-20, y: 0 } };
    const b = { a: { x: 0, y: 0 }, b: { x: 0, y: 1e9 } };

    expect(segmentSegmentDetail(a, b, 1e-9)).toEqual({
      kind: 'point',
      point: { x: 0, y: 0 },
      tA: 0,
      tB: 0,
    });
  });

  test('epsilon-parallel mapped interval overlap은 boolean과 같은 hit 판정을 유지한다', () => {
    const a = {
      a: { x: -2.5237740622833373e-11, y: 0.08640966904349626 },
      b: { x: -6.586415157653392e-11, y: -4.40322199370712e-9 },
    };
    const b = {
      a: { x: -7.566656586714089e-10, y: -0.000008751176367513836 },
      b: { x: 9.67600171919912e-9, y: 8.992325747385621e-11 },
    };

    expect(intersectsSegmentSegment(a, b)).toBe(true);
    expect(segmentSegmentDetail(a, b).kind).not.toBe('none');
  });

  test('epsilon-parallel mapped interval이 겹치지 않으면 endpoint 후보가 가까워도 none이다', () => {
    const a = {
      a: { x: 6.294321967288852e-11, y: 7.685119332745671e-12 },
      b: { x: -7.293909029103816e-9, y: -3.193471669219434e-11 },
    };
    const b = {
      a: { x: 9.467665585689248e-10, y: -5.173049787990749e-11 },
      b: { x: 5.713469586335123e-7, y: 0.0006846383907832206 },
    };

    expect(intersectsSegmentSegment(a, b)).toBe(false);
    expect(segmentSegmentDetail(a, b)).toEqual({ kind: 'none' });
  });

  test('collinear endpoint 후보가 실제 endpoint 좌표와 맞지 않으면 point를 만들지 않는다', () => {
    const a = {
      a: { x: 0, y: 7.080750132445247e-10 },
      b: { x: 0, y: 6.404709205962718e-10 },
    };
    const b = {
      a: { x: 4.4482588744722307e-10, y: -6.646515568718314e148 },
      b: { x: 5.307970580179244, y: -9.754092535004021e-10 },
    };

    expect(segmentSegmentDetail(a, b)).toEqual({ kind: 'none' });
  });

  test('mapped interval overlap의 반대 segment parameter가 같은 좌표로 붕괴하면 overlap을 만들지 않는다', () => {
    const a = {
      a: { x: -8.978927857242525e-151, y: 9.009085739962756e-201 },
      b: { x: 0, y: -0.9624478206969798 },
    };
    const b = {
      a: { x: 9.703185171820223e-11, y: -9.482283112592995e199 },
      b: { x: -0.9327996741048992, y: 6.919921091757715e199 },
    };

    expect(segmentSegmentDetail(a, b)).toEqual({ kind: 'none' });
  });

  test('mapped interval point가 반대 segment 직선에서 epsilon 밖이면 point를 만들지 않는다', () => {
    const a = {
      a: { x: -4.071920267306268e-301, y: 8.253314117901028e-301 },
      b: { x: -8.245623442344367e-21, y: 0 },
    };
    const b = {
      a: { x: 8.104162202216684e149, y: 3.961042421869934e-11 },
      b: { x: -6.648306245915591e-201, y: 2600343651.138246 },
    };

    expect(segmentSegmentDetail(a, b)).toEqual({ kind: 'none' });
  });

  test('collinear 후보 point의 parameter가 endpoint로 붕괴해도 endpoint 좌표가 다르면 point를 만들지 않는다', () => {
    const a = {
      a: { x: 3.726211105433739e-261, y: 9.649314866992846e185 },
      b: { x: -9.222892240824521e-57, y: -1.4229811268956993e253 },
    };
    const b = {
      a: { x: -8.511049291252587e210, y: 3.0619683507104956 },
      b: { x: 5.876815338934399, y: 5.33815744176588e32 },
    };

    expect(segmentSegmentDetail(a, b)).toEqual({ kind: 'none' });
  });
});
