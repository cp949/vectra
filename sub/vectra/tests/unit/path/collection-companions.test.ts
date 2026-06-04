/**
 * path domain collection companion unit test.
 *
 * 각 companion이 대응 *-into 함수와 동등한 결과를 반환하는지 검증한다.
 */
import { describe, expect, test } from 'vitest';
import { arcByEndpointCommands } from '../../../src/path/arc-by-endpoint-commands';
import { arcByEndpointCommandsInto } from '../../../src/path/arc-by-endpoint-commands-into';
import { arcThroughCommands } from '../../../src/path/arc-through-commands';
import { arcThroughCommandsInto } from '../../../src/path/arc-through-commands-into';
import { circleCommands } from '../../../src/path/circle-commands';
import { circleCommandsInto } from '../../../src/path/circle-commands-into';
import { cubicThroughCommands } from '../../../src/path/cubic-through-commands';
import { cubicThroughCommandsInto } from '../../../src/path/cubic-through-commands-into';
import { ellipseCommands } from '../../../src/path/ellipse-commands';
import { ellipseCommandsInto } from '../../../src/path/ellipse-commands-into';
import { equalizeSegments } from '../../../src/path/equalize-segments';
import { equalizeSegmentsInto } from '../../../src/path/equalize-segments-into';
import { flatten } from '../../../src/path/flatten';
import { flattenInto } from '../../../src/path/flatten-into';
import { lineCommands } from '../../../src/path/line-commands';
import { lineCommandsInto } from '../../../src/path/line-commands-into';
import { normalizeCommands } from '../../../src/path/normalize-commands';
import { normalizeCommandsInto } from '../../../src/path/normalize-commands-into';
import { orientCommands } from '../../../src/path/orient-commands';
import { orientCommandsInto } from '../../../src/path/orient-commands-into';
import { polygonCommands } from '../../../src/path/polygon-commands';
import { polygonCommandsInto } from '../../../src/path/polygon-commands-into';
import { polylineCommands } from '../../../src/path/polyline-commands';
import { polylineCommandsInto } from '../../../src/path/polyline-commands-into';
import { quadraticThroughCommands } from '../../../src/path/quadratic-through-commands';
import { quadraticThroughCommandsInto } from '../../../src/path/quadratic-through-commands-into';
import { rectCommands } from '../../../src/path/rect-commands';
import { rectCommandsInto } from '../../../src/path/rect-commands-into';
import { regularPolygonCommands } from '../../../src/path/regular-polygon-commands';
import { regularPolygonCommandsInto } from '../../../src/path/regular-polygon-commands-into';
import { removeCollinearCommands } from '../../../src/path/remove-collinear-commands';
import { removeCollinearCommandsInto } from '../../../src/path/remove-collinear-commands-into';
import { reverseCommands } from '../../../src/path/reverse-commands';
import { reverseCommandsInto } from '../../../src/path/reverse-commands-into';
import { roundedRectCommands } from '../../../src/path/rounded-rect-commands';
import { roundedRectCommandsInto } from '../../../src/path/rounded-rect-commands-into';
import { segmentCommands } from '../../../src/path/segment-commands';
import { segmentCommandsInto } from '../../../src/path/segment-commands-into';
import { splitSubpaths } from '../../../src/path/split-subpaths';
import { splitSubpathsInto } from '../../../src/path/split-subpaths-into';
import { starCommands } from '../../../src/path/star-commands';
import { starCommandsInto } from '../../../src/path/star-commands-into';
import { transformCommands } from '../../../src/path/transform-commands';
import { transformCommandsInto } from '../../../src/path/transform-commands-into';
import type { ArcCommand, PathCommand } from '../../../src/types/index';

const RECT = { x: 0, y: 0, width: 100, height: 50 };
const CMDS: PathCommand[] = [
  { kind: 'move', x: 0, y: 0 },
  { kind: 'line', x: 10, y: 0 },
  { kind: 'line', x: 10, y: 10 },
  { kind: 'close' },
];
const MATRIX = { a: 1, b: 0, c: 0, d: 1, tx: 5, ty: 3 };

// ──────────────────────────────────────────────
// normalizeCommands
// ──────────────────────────────────────────────
describe('normalizeCommands', () => {
  test('normalizeCommandsInto 결과와 deep equal이다', () => {
    const expected = normalizeCommandsInto([], CMDS);
    expect(normalizeCommands(CMDS)).toEqual(expected);
  });

  test('empty input은 empty array를 반환한다', () => {
    expect(normalizeCommands([])).toEqual([]);
  });

  test('새 배열을 반환한다', () => {
    const a = normalizeCommands(CMDS);
    const b = normalizeCommands(CMDS);
    expect(a).not.toBe(b);
  });
});

// ──────────────────────────────────────────────
// removeCollinearCommands
// ──────────────────────────────────────────────
describe('removeCollinearCommands', () => {
  test('removeCollinearCommandsInto 결과와 deep equal이다', () => {
    const expected = removeCollinearCommandsInto([], CMDS);
    expect(removeCollinearCommands(CMDS)).toEqual(expected);
  });

  test('empty input은 empty array를 반환한다', () => {
    expect(removeCollinearCommands([])).toEqual([]);
  });

  test('options를 전달해도 동일하다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 1e-9 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const opts = { angleTolerance: 1e-3 };
    expect(removeCollinearCommands(cmds, opts)).toEqual(removeCollinearCommandsInto([], cmds, opts));
  });
});

// ──────────────────────────────────────────────
// flatten
// ──────────────────────────────────────────────
describe('flatten', () => {
  test('flattenInto 결과와 deep equal이다', () => {
    const expected = flattenInto([], CMDS);
    expect(flatten(CMDS)).toEqual(expected);
  });

  test('empty input은 empty array를 반환한다', () => {
    expect(flatten([])).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// reverseCommands
// ──────────────────────────────────────────────
describe('reverseCommands', () => {
  test('reverseCommandsInto 결과와 deep equal이다', () => {
    const expected = reverseCommandsInto([], CMDS);
    expect(reverseCommands(CMDS)).toEqual(expected);
  });

  test('empty input은 empty array를 반환한다', () => {
    expect(reverseCommands([])).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// orientCommands
// ──────────────────────────────────────────────
describe('orientCommands', () => {
  test('orientCommandsInto 결과와 deep equal이다 (clockwise=true)', () => {
    const expected = orientCommandsInto([], CMDS, true);
    expect(orientCommands(CMDS, true)).toEqual(expected);
  });

  test('orientCommandsInto 결과와 deep equal이다 (clockwise=false)', () => {
    const expected = orientCommandsInto([], CMDS, false);
    expect(orientCommands(CMDS, false)).toEqual(expected);
  });

  test('empty input은 empty array를 반환한다', () => {
    expect(orientCommands([], true)).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// transformCommands
// ──────────────────────────────────────────────
describe('transformCommands', () => {
  test('transformCommandsInto 결과와 deep equal이다', () => {
    const expected = transformCommandsInto([], CMDS, MATRIX);
    expect(transformCommands(CMDS, MATRIX)).toEqual(expected);
  });

  test('empty input은 empty array를 반환한다', () => {
    expect(transformCommands([], MATRIX)).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// lineCommands
// ──────────────────────────────────────────────
describe('lineCommands', () => {
  test('lineCommandsInto 결과와 deep equal이다', () => {
    const expected = lineCommandsInto([], { x: 1, y: 2 }, { x: 5, y: 6 });
    expect(lineCommands({ x: 1, y: 2 }, { x: 5, y: 6 })).toEqual(expected);
  });
});

// ──────────────────────────────────────────────
// rectCommands
// ──────────────────────────────────────────────
describe('rectCommands', () => {
  test('rectCommandsInto 결과와 deep equal이다', () => {
    const expected = rectCommandsInto([], RECT);
    expect(rectCommands(RECT)).toEqual(expected);
  });
});

// ──────────────────────────────────────────────
// roundedRectCommands
// ──────────────────────────────────────────────
describe('roundedRectCommands', () => {
  test('roundedRectCommandsInto 결과와 deep equal이다', () => {
    const expected = roundedRectCommandsInto([], RECT, 10);
    expect(roundedRectCommands(RECT, 10)).toEqual(expected);
  });
});

// ──────────────────────────────────────────────
// polylineCommands
// ──────────────────────────────────────────────
describe('polylineCommands', () => {
  test('polylineCommandsInto 결과와 deep equal이다', () => {
    const polyline = {
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    };
    const expected = polylineCommandsInto([], polyline);
    expect(polylineCommands(polyline)).toEqual(expected);
  });

  test('empty points는 empty array를 반환한다', () => {
    expect(polylineCommands({ points: [] })).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// polygonCommands
// ──────────────────────────────────────────────
describe('polygonCommands', () => {
  test('polygonCommandsInto 결과와 deep equal이다', () => {
    const polygon = {
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 5, y: 10 },
      ],
    };
    const expected = polygonCommandsInto([], polygon);
    expect(polygonCommands(polygon)).toEqual(expected);
  });

  test('empty points는 empty array를 반환한다', () => {
    expect(polygonCommands({ points: [] })).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// circleCommands
// ──────────────────────────────────────────────
describe('circleCommands', () => {
  test('circleCommandsInto 결과와 deep equal이다', () => {
    const circle = { center: { x: 0, y: 0 }, radius: 10 };
    const expected = circleCommandsInto([], circle);
    expect(circleCommands(circle)).toEqual(expected);
  });
});

// ──────────────────────────────────────────────
// ellipseCommands
// ──────────────────────────────────────────────
describe('ellipseCommands', () => {
  test('ellipseCommandsInto 결과와 deep equal이다', () => {
    const ellipse = { center: { x: 0, y: 0 }, radiusX: 20, radiusY: 10 };
    const expected = ellipseCommandsInto([], ellipse);
    expect(ellipseCommands(ellipse)).toEqual(expected);
  });
});

// ──────────────────────────────────────────────
// segmentCommands
// ──────────────────────────────────────────────
describe('segmentCommands', () => {
  test('segmentCommandsInto 결과와 deep equal이다', () => {
    const seg = { a: { x: 1, y: 2 }, b: { x: 3, y: 4 } };
    const expected = segmentCommandsInto([], seg);
    expect(segmentCommands(seg)).toEqual(expected);
  });
});

// ──────────────────────────────────────────────
// regularPolygonCommands
// ──────────────────────────────────────────────
describe('regularPolygonCommands', () => {
  test('regularPolygonCommandsInto 결과와 deep equal이다', () => {
    const expected = regularPolygonCommandsInto([], { x: 0, y: 0 }, 10, 6);
    expect(regularPolygonCommands({ x: 0, y: 0 }, 10, 6)).toEqual(expected);
  });
});

// ──────────────────────────────────────────────
// starCommands
// ──────────────────────────────────────────────
describe('starCommands', () => {
  test('starCommandsInto 결과와 deep equal이다', () => {
    const expected = starCommandsInto([], { x: 0, y: 0 }, 5, 10, 5);
    expect(starCommands({ x: 0, y: 0 }, 5, 10, 5)).toEqual(expected);
  });
});

// ──────────────────────────────────────────────
// arcThroughCommands
// ──────────────────────────────────────────────
describe('arcThroughCommands', () => {
  test('arcThroughCommandsInto 결과와 deep equal이다', () => {
    const from = { x: 0, y: 0 };
    const through = { x: 5, y: 5 };
    const to = { x: 10, y: 0 };
    const expected = arcThroughCommandsInto([], from, through, to);
    expect(arcThroughCommands(from, through, to)).toEqual(expected);
  });
});

// ──────────────────────────────────────────────
// arcByEndpointCommands
// ──────────────────────────────────────────────
describe('arcByEndpointCommands', () => {
  test('arcByEndpointCommandsInto 결과와 deep equal이다', () => {
    const from = { x: 0, y: 0 };
    const arcCmd: ArcCommand = { kind: 'arc', rx: 5, ry: 5, xRotation: 0, largeArc: false, sweep: true, x: 10, y: 0 };
    const expected = arcByEndpointCommandsInto([], from, arcCmd);
    expect(arcByEndpointCommands(from, arcCmd)).toEqual(expected);
  });
});

// ──────────────────────────────────────────────
// quadraticThroughCommands
// ──────────────────────────────────────────────
describe('quadraticThroughCommands', () => {
  test('quadraticThroughCommandsInto 결과와 deep equal이다', () => {
    const from = { x: 0, y: 0 };
    const through = { x: 5, y: 5 };
    const to = { x: 10, y: 0 };
    const expected = quadraticThroughCommandsInto([], from, through, to);
    expect(quadraticThroughCommands(from, through, to)).toEqual(expected);
  });
});

// ──────────────────────────────────────────────
// cubicThroughCommands
// ──────────────────────────────────────────────
describe('cubicThroughCommands', () => {
  test('cubicThroughCommandsInto 결과와 deep equal이다', () => {
    const from = { x: 0, y: 0 };
    const through = { x: 5, y: 5 };
    const to = { x: 10, y: 0 };
    const expected = cubicThroughCommandsInto([], from, through, to);
    expect(cubicThroughCommands(from, through, to)).toEqual(expected);
  });
});

// ──────────────────────────────────────────────
// splitSubpaths
// ──────────────────────────────────────────────
describe('splitSubpaths', () => {
  test('splitSubpathsInto 결과와 deep equal이다', () => {
    const expected = splitSubpathsInto([], CMDS);
    expect(splitSubpaths(CMDS)).toEqual(expected);
  });

  test('empty input은 empty array를 반환한다', () => {
    expect(splitSubpaths([])).toEqual([]);
  });

  test('multi-subpath를 분리한다', () => {
    const cmds: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
      { kind: 'move', x: 20, y: 20 },
      { kind: 'line', x: 30, y: 20 },
    ];
    expect(splitSubpaths(cmds)).toEqual(splitSubpathsInto([], cmds));
  });

  test('새 배열을 반환한다', () => {
    const a = splitSubpaths(CMDS);
    const b = splitSubpaths(CMDS);
    expect(a).not.toBe(b);
  });
});

// ──────────────────────────────────────────────
// equalizeSegments
// ──────────────────────────────────────────────
describe('equalizeSegments', () => {
  test('equalizeSegmentsInto 결과와 deep equal이다', () => {
    const cmds1: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const cmds2: PathCommand[] = [
      { kind: 'move', x: 0, y: 0 },
      { kind: 'line', x: 5, y: 0 },
      { kind: 'line', x: 10, y: 0 },
    ];
    const out1: PathCommand[] = [];
    const out2: PathCommand[] = [];
    equalizeSegmentsInto(out1, out2, cmds1, cmds2);
    const result = equalizeSegments(cmds1, cmds2);
    expect(result.a).toEqual(out1);
    expect(result.b).toEqual(out2);
  });

  test('empty inputs는 { a: [], b: [] }를 반환한다', () => {
    const result = equalizeSegments([], []);
    expect(result).toEqual({ a: [], b: [] });
  });

  test('새 객체를 반환한다', () => {
    const r1 = equalizeSegments(CMDS, CMDS);
    const r2 = equalizeSegments(CMDS, CMDS);
    expect(r1).not.toBe(r2);
    expect(r1.a).not.toBe(r2.a);
    expect(r1.b).not.toBe(r2.b);
  });
});
