import { readX, readY } from '../internal/xy';
import type { CenterArcLike, XYInput } from '../types';
import { isDegenerateRadii } from './arc.internal';
import { GL5_NODES, GL5_WEIGHTS } from './speed-length.internal';

/**
 * 곡선의 매개변수 구간 [from, to]와 그 위의 구간 적분기.
 *
 * - arc-length kernel `speed-length.internal`이 이 표현만 보고 길이를 계산한다.
 * - Bezier는 param = t, from = 0, to = 1이다.
 * - center arc는 param = θ, from = startAngle, to = endAngle이다.
 * - `integrate(a, b, segments)`는 [a, b]를 segments로 나눠 속력 |dP/dparam|을
 *   구간마다 Gauss-Legendre 5점으로 적분한 부호 있는 합이다. 부호는 (b - a)를 따른다.
 *
 * 속도 식을 콜백으로 빼지 않고 곡선마다 루프 안에 인라인한다.
 * 콜백으로 빼면 곡선 종류가 섞이는 호출 지점이 인라인되지 않아 느려진다.
 */
export interface CurveSpeed {
  integrate: (from: number, to: number, segments: number) => number;
  from: number;
  to: number;
}

/**
 * cubic Bezier의 구간 적분기를 만든다.
 * XYInput은 한 번만 읽어 closure에 담는다.
 */
export function cubicSpeed(p0: XYInput, p1: XYInput, p2: XYInput, p3: XYInput): CurveSpeed {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);
  const p3x = readX(p3);
  const p3y = readY(p3);

  return {
    integrate: (from, to, segments) => {
      // closure 변수를 지역 변수로 복사한다. 루프 안에서 context load가 반복되는 것을 막는다.
      const x0 = p0x;
      const y0 = p0y;
      const x1 = p1x;
      const y1 = p1y;
      const x2 = p2x;
      const y2 = p2y;
      const x3 = p3x;
      const y3 = p3y;

      const step = (to - from) / segments;
      let total = 0;

      for (let s = 0; s < segments; s++) {
        const a = from + s * step;
        const b = from + (s + 1) * step;

        // 구간 [a, b]를 [-1, 1]로 변환: t = (b-a)/2 * u + (a+b)/2
        const halfLen = (b - a) * 0.5;
        const mid = (a + b) * 0.5;
        let sum = 0;

        for (let i = 0; i < GL5_NODES.length; i++) {
          const t = halfLen * GL5_NODES[i] + mid;
          const mt = 1 - t;
          const mt2 = mt * mt;
          const t2 = t * t;
          const twoMtT = 2 * mt * t;

          // B'(t) = 3[(1-t)^2*(p1-p0) + 2(1-t)t*(p2-p1) + t^2*(p3-p2)]
          const dx = 3 * (mt2 * (x1 - x0) + twoMtT * (x2 - x1) + t2 * (x3 - x2));
          const dy = 3 * (mt2 * (y1 - y0) + twoMtT * (y2 - y1) + t2 * (y3 - y2));

          sum += GL5_WEIGHTS[i] * Math.hypot(dx, dy);
        }

        total += halfLen * sum;
      }

      return total;
    },
    from: 0,
    to: 1,
  };
}

/**
 * quadratic Bezier의 구간 적분기를 만든다.
 * XYInput은 한 번만 읽어 closure에 담는다.
 */
export function quadraticSpeed(p0: XYInput, p1: XYInput, p2: XYInput): CurveSpeed {
  const p0x = readX(p0);
  const p0y = readY(p0);
  const p1x = readX(p1);
  const p1y = readY(p1);
  const p2x = readX(p2);
  const p2y = readY(p2);

  return {
    integrate: (from, to, segments) => {
      // closure 변수를 지역 변수로 복사한다. 루프 안에서 context load가 반복되는 것을 막는다.
      const x0 = p0x;
      const y0 = p0y;
      const x1 = p1x;
      const y1 = p1y;
      const x2 = p2x;
      const y2 = p2y;

      const step = (to - from) / segments;
      let total = 0;

      for (let s = 0; s < segments; s++) {
        const a = from + s * step;
        const b = from + (s + 1) * step;

        // 구간 [a, b]를 [-1, 1]로 변환: t = (b-a)/2 * u + (a+b)/2
        const halfLen = (b - a) * 0.5;
        const mid = (a + b) * 0.5;
        let sum = 0;

        for (let i = 0; i < GL5_NODES.length; i++) {
          const t = halfLen * GL5_NODES[i] + mid;
          const twoMt = 2 * (1 - t);
          const twoT = 2 * t;

          // B'(t) = 2(1-t)(p1-p0) + 2t(p2-p1)
          const dx = twoMt * (x1 - x0) + twoT * (x2 - x1);
          const dy = twoMt * (y1 - y0) + twoT * (y2 - y1);

          sum += GL5_WEIGHTS[i] * Math.hypot(dx, dy);
        }

        total += halfLen * sum;
      }

      return total;
    },
    from: 0,
    to: 1,
  };
}

/**
 * center arc의 구간 적분기를 만든다.
 *
 * rotated ellipse의 |dP/dθ|² = rx²·sin²θ + ry²·cos²θ이다.
 * 회전 xRotation은 위치만 바꾸고 호 길이는 바꾸지 않으므로 식에 들어가지 않는다.
 *
 * degenerate 반지름(rx <= 0, ry <= 0, NaN)은 길이 0 곡선을 돌려준다.
 * kernel은 from === to를 0으로 처리하므로 leaf에 별도 guard가 필요 없다.
 */
export function centerArcSpeed(centerArc: CenterArcLike): CurveSpeed {
  const { rx, ry, startAngle, endAngle } = centerArc;

  if (isDegenerateRadii(rx, ry)) {
    return { integrate: () => 0, from: 0, to: 0 };
  }

  return {
    integrate: (from, to, segments) => {
      // closure 변수를 지역 변수로 복사한다. 루프 안에서 context load가 반복되는 것을 막는다.
      const radiusX = rx;
      const radiusY = ry;

      const step = (to - from) / segments;
      let total = 0;

      for (let s = 0; s < segments; s++) {
        const a = from + s * step;
        const b = from + (s + 1) * step;

        const halfLen = (b - a) * 0.5;
        const mid = (a + b) * 0.5;
        let sum = 0;

        for (let i = 0; i < GL5_NODES.length; i++) {
          const theta = halfLen * GL5_NODES[i] + mid;
          sum += GL5_WEIGHTS[i] * Math.hypot(radiusX * Math.sin(theta), radiusY * Math.cos(theta));
        }

        total += halfLen * sum;
      }

      return total;
    },
    from: startAngle,
    to: endAngle,
  };
}
