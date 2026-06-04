/**
 * cardinalPolylineInto 테스트.
 * out length 규칙, degenerate 입력 처리, cardinalPointAtTInto와의 샘플 일치를 다룬다.
 */
import { describe, expect, it } from 'vitest';
import { cardinalPointAtTInto } from '../../src/curve/cardinal-point-at-t-into';
import { cardinalPolylineInto } from '../../src/curve/cardinal-polyline-into';
import { expectClose } from './_cardinal-test-helpers';

const polyPts = [
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 3, y: 1 },
  { x: 4, y: 3 },
];

describe('cardinalPolylineInto — out length', () => {
  it('steps=5 open → out.length=5', () => {
    const out: { x: number; y: number }[] = [];
    cardinalPolylineInto(out, polyPts, 5);
    expect(out.length).toBe(5);
  });

  it('steps 미지정 → out.length=32 (기본값)', () => {
    const out: { x: number; y: number }[] = [];
    cardinalPolylineInto(out, polyPts);
    expect(out.length).toBe(32);
  });

  it('steps=1 → out.length=1', () => {
    const out: { x: number; y: number }[] = [];
    cardinalPolylineInto(out, polyPts, 1);
    expect(out.length).toBe(1);
  });
});

describe('cardinalPolylineInto — degenerate', () => {
  it('steps=0이면 out을 비운다', () => {
    const out = [{ x: 1, y: 1 }];
    cardinalPolylineInto(out, polyPts, 0);
    expect(out.length).toBe(0);
  });

  it('steps<0이면 out을 비운다', () => {
    const out = [{ x: 1, y: 1 }];
    cardinalPolylineInto(out, polyPts, -3);
    expect(out.length).toBe(0);
  });

  it('points.length=1이면 out을 비운다', () => {
    const out = [{ x: 1, y: 1 }];
    cardinalPolylineInto(out, [{ x: 0, y: 0 }]);
    expect(out.length).toBe(0);
  });

  it('points.length=0이면 out을 비운다', () => {
    const out = [{ x: 1, y: 1 }];
    cardinalPolylineInto(out, []);
    expect(out.length).toBe(0);
  });
});

describe('cardinalPolylineInto — 기존 out 교체', () => {
  it('기존 원소가 있어도 호출 후 새 결과로 교체한다', () => {
    const out = [
      { x: 99, y: 99 },
      { x: 88, y: 88 },
    ];
    cardinalPolylineInto(out, polyPts, 3);
    expect(out.length).toBe(3);
    expect(out[0]).not.toEqual({ x: 99, y: 99 });
  });
});

describe('cardinalPolylineInto — 샘플 값', () => {
  it('options { steps:4, tension:0.25, closed:true } 결과가 cardinalPointAtTInto와 1e-10 이내 일치한다', () => {
    const out: { x: number; y: number }[] = [];
    cardinalPolylineInto(out, polyPts, { steps: 4, tension: 0.25, closed: true });
    expect(out.length).toBe(4);

    const tmp = { x: 0, y: 0 };
    for (let i = 0; i < 4; i++) {
      cardinalPointAtTInto(tmp, polyPts, i / 4, { tension: 0.25, closed: true });
      expectClose(out[i].x, tmp.x);
      expectClose(out[i].y, tmp.y);
    }
  });

  it('steps=1은 t=0 한 점이 cardinalPointAtTInto(t=0)와 일치한다', () => {
    const out: { x: number; y: number }[] = [];
    cardinalPolylineInto(out, polyPts, 1);
    expect(out.length).toBe(1);

    const tmp = { x: 0, y: 0 };
    cardinalPointAtTInto(tmp, polyPts, 0, { tension: 0, closed: false });
    expectClose(out[0].x, tmp.x);
    expectClose(out[0].y, tmp.y);
  });
});
