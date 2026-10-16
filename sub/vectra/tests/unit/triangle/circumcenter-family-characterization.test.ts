/**
 * triangle circumcenter 계열 6개 leaf의 출력을 고정하는 characterization test.
 *
 * circumcenterInto, circumcircleInto, circumradius, eulerLineInto,
 * ninePointCircleInto, orthocenterInto가 같은 입력에서 내는 값을 비트 단위로 기록한다.
 * 숫자는 -0과 NaN까지 구분되는 문자열로 기록한다.
 * `out`이 입력 vertex와 alias인 경우도 함께 기록한다.
 *
 * 공유 kernel로 옮기는 refactor가 출력을 바꾸지 않았는지 확인하는 임시 안전망이다.
 * 이동이 끝나면 삭제한다.
 */
import { describe, expect, test } from 'vitest';
import { circumcenterInto } from '../../../src/triangle/circumcenter-into';
import { circumcircleInto } from '../../../src/triangle/circumcircle-into';
import { circumradius } from '../../../src/triangle/circumradius';
import { eulerLineInto } from '../../../src/triangle/euler-line-into';
import { ninePointCircleInto } from '../../../src/triangle/nine-point-circle-into';
import { orthocenterInto } from '../../../src/triangle/orthocenter-into';
import type { TriangleLike } from '../../../src/types';

type ObjectTriangle = { a: { x: number; y: number }; b: { x: number; y: number }; c: { x: number; y: number } };

/** 좌표 세 쌍으로 object 형태 triangle을 만든다. */
function tri(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): ObjectTriangle {
  return { a: { x: ax, y: ay }, b: { x: bx, y: by }, c: { x: cx, y: cy } };
}

/** 비교 대상 triangle 목록. 일반 형태, 방향, 스케일, near-collinear, 실패 입력을 고르게 담는다. */
const CASES: ReadonlyArray<{ name: string; triangle: TriangleLike }> = [
  { name: '직각삼각형', triangle: tri(0, 0, 4, 0, 0, 3) },
  { name: '예각삼각형', triangle: tri(0, 0, 4, 0, 1, 3) },
  { name: '둔각삼각형', triangle: tri(0, 0, 10, 0, 5, 1) },
  { name: 'CW 방향 예각삼각형', triangle: tri(1, 3, 4, 0, 0, 0) },
  { name: '정삼각형', triangle: tri(0, 0, 1, 0, 0.5, Math.sqrt(3) / 2) },
  {
    name: 'tuple 형태 예각삼각형',
    triangle: [
      [0, 0],
      [4, 0],
      [1, 3],
    ],
  },
  { name: '큰 좌표 오프셋', triangle: tri(1e8, 1e8, 1e8 + 3, 1e8, 1e8, 1e8 + 4) },
  { name: '작은 스케일', triangle: tri(0, 0, 4e-8, 0, 1e-8, 3e-8) },
  {
    name: 'near-collinear (signedArea2x≠0, raw D 전개는 0)',
    triangle: tri(
      3.8400211035452747,
      17.281933327867037,
      8.156115648087077,
      31.91817240438104,
      9.039683586890016,
      34.91442548901669
    ),
  },
  { name: 'collinear', triangle: tri(0, 0, 2, 0, 4, 0) },
  { name: '세 vertex가 한 점', triangle: tri(1, 1, 1, 1, 1, 1) },
  { name: 'NaN vertex', triangle: tri(0, 0, Number.NaN, 0, 0, 3) },
  { name: 'Infinity vertex', triangle: tri(0, 0, Number.POSITIVE_INFINITY, 0, 0, 3) },
];

/** number를 -0, NaN까지 구분되는 문자열로 바꾼다. 문자열은 round-trip이 정확해 비트 단위 비교가 된다. */
function fmt(n: number): string {
  return Object.is(n, -0) ? '-0' : String(n);
}

/** 실패(false, undefined)는 그 이름으로, 성공은 좌표 목록으로 기록한다. */
function record(result: unknown, values: () => number[]): string[] {
  if (result === false) return ['false'];
  if (result === undefined) return ['undefined'];
  return values().map(fmt);
}

/** 6개 leaf를 새 out으로 호출해 결과를 기록한다. */
function runAll(triangle: TriangleLike): Record<string, string[]> {
  const center = { x: 0, y: 0 };
  const circle = { center: { x: 0, y: 0 }, radius: 0 };
  const nine = { center: { x: 0, y: 0 }, radius: 0 };
  const euler = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
  const ortho = { x: 0, y: 0 };
  const radius = circumradius(structuredClone(triangle));
  return {
    circumcenter: record(circumcenterInto(center, structuredClone(triangle)), () => [center.x, center.y]),
    circumcircle: record(circumcircleInto(circle, structuredClone(triangle)), () => [
      circle.center.x,
      circle.center.y,
      circle.radius,
    ]),
    circumradius: record(radius, () => [radius as number]),
    eulerLine: record(eulerLineInto(euler, structuredClone(triangle)), () => [
      euler.a.x,
      euler.a.y,
      euler.b.x,
      euler.b.y,
    ]),
    ninePointCircle: record(ninePointCircleInto(nine, structuredClone(triangle)), () => [
      nine.center.x,
      nine.center.y,
      nine.radius,
    ]),
    orthocenter: record(orthocenterInto(ortho, structuredClone(triangle)), () => [ortho.x, ortho.y]),
  };
}

/** out이 입력 vertex 객체와 같은 참조가 되도록 6개 leaf를 호출해 결과를 기록한다. */
function runAliased(source: ObjectTriangle): Record<string, string[]> {
  const t1 = structuredClone(source);
  const t2 = structuredClone(source);
  const t3 = structuredClone(source);
  const t4 = structuredClone(source);
  const t5 = structuredClone(source);
  const circle = { center: t2.a, radius: 0 };
  const nine = { center: t3.a, radius: 0 };
  const euler = { a: t4.a, b: t4.b };
  return {
    circumcenter: record(circumcenterInto(t1.a, t1), () => [t1.a.x, t1.a.y]),
    circumcircle: record(circumcircleInto(circle, t2), () => [circle.center.x, circle.center.y, circle.radius]),
    ninePointCircle: record(ninePointCircleInto(nine, t3), () => [nine.center.x, nine.center.y, nine.radius]),
    eulerLine: record(eulerLineInto(euler, t4), () => [euler.a.x, euler.a.y, euler.b.x, euler.b.y]),
    orthocenter: record(orthocenterInto(t5.b, t5), () => [t5.b.x, t5.b.y]),
  };
}

describe('triangle circumcenter 계열 characterization', () => {
  test('새 out으로 호출한 6개 leaf의 출력이 기록과 같다', () => {
    const actual = Object.fromEntries(CASES.map((c) => [c.name, runAll(c.triangle)]));
    expect(actual).toMatchInlineSnapshot(`
      {
        "CW 방향 예각삼각형": {
          "circumcenter": [
            "2",
            "1",
          ],
          "circumcircle": [
            "2",
            "1",
            "2.23606797749979",
          ],
          "circumradius": [
            "2.23606797749979",
          ],
          "eulerLine": [
            "1.6666666666666667",
            "1",
            "1",
            "1",
          ],
          "ninePointCircle": [
            "1.5",
            "1",
            "1.118033988749895",
          ],
          "orthocenter": [
            "1",
            "1",
          ],
        },
        "Infinity vertex": {
          "circumcenter": [
            "false",
          ],
          "circumcircle": [
            "false",
          ],
          "circumradius": [
            "undefined",
          ],
          "eulerLine": [
            "false",
          ],
          "ninePointCircle": [
            "false",
          ],
          "orthocenter": [
            "false",
          ],
        },
        "NaN vertex": {
          "circumcenter": [
            "false",
          ],
          "circumcircle": [
            "false",
          ],
          "circumradius": [
            "undefined",
          ],
          "eulerLine": [
            "false",
          ],
          "ninePointCircle": [
            "false",
          ],
          "orthocenter": [
            "false",
          ],
        },
        "collinear": {
          "circumcenter": [
            "false",
          ],
          "circumcircle": [
            "false",
          ],
          "circumradius": [
            "undefined",
          ],
          "eulerLine": [
            "false",
          ],
          "ninePointCircle": [
            "false",
          ],
          "orthocenter": [
            "false",
          ],
        },
        "near-collinear (signedArea2x≠0, raw D 전개는 0)": {
          "circumcenter": [
            "29572315163337470",
            "-8720608311923776",
          ],
          "circumcircle": [
            "29572315163337470",
            "-8720608311923776",
            "30831328765555230",
          ],
          "circumradius": [
            "30831328765555230",
          ],
          "eulerLine": [
            "7.01194011284079",
            "28.038177073754923",
            "-59144630326674920",
            "17441216623847636",
          ],
          "ninePointCircle": [
            "-14786157581668726",
            "4360304155961930",
            "15415664382777616",
          ],
          "orthocenter": [
            "-59144630326674920",
            "17441216623847636",
          ],
        },
        "tuple 형태 예각삼각형": {
          "circumcenter": [
            "2",
            "1",
          ],
          "circumcircle": [
            "2",
            "1",
            "2.23606797749979",
          ],
          "circumradius": [
            "2.23606797749979",
          ],
          "eulerLine": [
            "1.6666666666666667",
            "1",
            "1",
            "1",
          ],
          "ninePointCircle": [
            "1.5",
            "1",
            "1.118033988749895",
          ],
          "orthocenter": [
            "1",
            "1",
          ],
        },
        "둔각삼각형": {
          "circumcenter": [
            "5",
            "-12",
          ],
          "circumcircle": [
            "5",
            "-12",
            "13",
          ],
          "circumradius": [
            "13",
          ],
          "eulerLine": [
            "5",
            "0.3333333333333333",
            "5",
            "25",
          ],
          "ninePointCircle": [
            "5",
            "6.5",
            "6.5",
          ],
          "orthocenter": [
            "5",
            "25",
          ],
        },
        "세 vertex가 한 점": {
          "circumcenter": [
            "false",
          ],
          "circumcircle": [
            "false",
          ],
          "circumradius": [
            "undefined",
          ],
          "eulerLine": [
            "false",
          ],
          "ninePointCircle": [
            "false",
          ],
          "orthocenter": [
            "false",
          ],
        },
        "예각삼각형": {
          "circumcenter": [
            "2",
            "1",
          ],
          "circumcircle": [
            "2",
            "1",
            "2.23606797749979",
          ],
          "circumradius": [
            "2.23606797749979",
          ],
          "eulerLine": [
            "1.6666666666666667",
            "1",
            "1",
            "1",
          ],
          "ninePointCircle": [
            "1.5",
            "1",
            "1.118033988749895",
          ],
          "orthocenter": [
            "1",
            "1",
          ],
        },
        "작은 스케일": {
          "circumcenter": [
            "2e-8",
            "9.999999999999999e-9",
          ],
          "circumcircle": [
            "2e-8",
            "9.999999999999999e-9",
            "2.2360679774997898e-8",
          ],
          "circumradius": [
            "2.2360679774997898e-8",
          ],
          "eulerLine": [
            "1.6666666666666667e-8",
            "9.999999999999999e-9",
            "9.999999999999997e-9",
            "1e-8",
          ],
          "ninePointCircle": [
            "1.5e-8",
            "1e-8",
            "1.1180339887498949e-8",
          ],
          "orthocenter": [
            "9.999999999999997e-9",
            "1e-8",
          ],
        },
        "정삼각형": {
          "circumcenter": [
            "0.5",
            "0.2886751345948128",
          ],
          "circumcircle": [
            "0.5",
            "0.2886751345948128",
            "0.5773502691896257",
          ],
          "circumradius": [
            "0.5773502691896257",
          ],
          "eulerLine": [
            "0.5",
            "0.28867513459481287",
            "0.5",
            "0.288675134594813",
          ],
          "ninePointCircle": [
            "0.5",
            "0.28867513459481287",
            "0.28867513459481287",
          ],
          "orthocenter": [
            "0.5",
            "0.288675134594813",
          ],
        },
        "직각삼각형": {
          "circumcenter": [
            "2",
            "1.5",
          ],
          "circumcircle": [
            "2",
            "1.5",
            "2.5",
          ],
          "circumradius": [
            "2.5",
          ],
          "eulerLine": [
            "1.3333333333333333",
            "1",
            "0",
            "0",
          ],
          "ninePointCircle": [
            "1",
            "0.75",
            "1.25",
          ],
          "orthocenter": [
            "0",
            "0",
          ],
        },
        "큰 좌표 오프셋": {
          "circumcenter": [
            "100000001.33333333",
            "100000002",
          ],
          "circumcircle": [
            "100000001.33333333",
            "100000002",
            "2.4037008475541004",
          ],
          "circumradius": [
            "2.4037008475541004",
          ],
          "eulerLine": [
            "100000001",
            "100000001.33333333",
            "100000000.33333334",
            "100000000",
          ],
          "ninePointCircle": [
            "100000000.83333334",
            "100000001",
            "1.2018504237770502",
          ],
          "orthocenter": [
            "100000000.33333334",
            "100000000",
          ],
        },
      }
    `);
  });

  test('out이 입력 vertex와 alias여도 출력이 기록과 같다', () => {
    const objectCases = CASES.filter((c) => !Array.isArray(c.triangle));
    const actual = Object.fromEntries(objectCases.map((c) => [c.name, runAliased(c.triangle as ObjectTriangle)]));
    expect(actual).toMatchInlineSnapshot(`
      {
        "CW 방향 예각삼각형": {
          "circumcenter": [
            "2",
            "1",
          ],
          "circumcircle": [
            "2",
            "1",
            "2.23606797749979",
          ],
          "eulerLine": [
            "1.6666666666666667",
            "1",
            "1",
            "1",
          ],
          "ninePointCircle": [
            "1.5",
            "1",
            "1.118033988749895",
          ],
          "orthocenter": [
            "1",
            "1",
          ],
        },
        "Infinity vertex": {
          "circumcenter": [
            "false",
          ],
          "circumcircle": [
            "false",
          ],
          "eulerLine": [
            "false",
          ],
          "ninePointCircle": [
            "false",
          ],
          "orthocenter": [
            "false",
          ],
        },
        "NaN vertex": {
          "circumcenter": [
            "false",
          ],
          "circumcircle": [
            "false",
          ],
          "eulerLine": [
            "false",
          ],
          "ninePointCircle": [
            "false",
          ],
          "orthocenter": [
            "false",
          ],
        },
        "collinear": {
          "circumcenter": [
            "false",
          ],
          "circumcircle": [
            "false",
          ],
          "eulerLine": [
            "false",
          ],
          "ninePointCircle": [
            "false",
          ],
          "orthocenter": [
            "false",
          ],
        },
        "near-collinear (signedArea2x≠0, raw D 전개는 0)": {
          "circumcenter": [
            "29572315163337470",
            "-8720608311923776",
          ],
          "circumcircle": [
            "29572315163337470",
            "-8720608311923776",
            "30831328765555230",
          ],
          "eulerLine": [
            "7.01194011284079",
            "28.038177073754923",
            "-59144630326674920",
            "17441216623847636",
          ],
          "ninePointCircle": [
            "-14786157581668726",
            "4360304155961930",
            "15415664382777616",
          ],
          "orthocenter": [
            "-59144630326674920",
            "17441216623847636",
          ],
        },
        "둔각삼각형": {
          "circumcenter": [
            "5",
            "-12",
          ],
          "circumcircle": [
            "5",
            "-12",
            "13",
          ],
          "eulerLine": [
            "5",
            "0.3333333333333333",
            "5",
            "25",
          ],
          "ninePointCircle": [
            "5",
            "6.5",
            "6.5",
          ],
          "orthocenter": [
            "5",
            "25",
          ],
        },
        "세 vertex가 한 점": {
          "circumcenter": [
            "false",
          ],
          "circumcircle": [
            "false",
          ],
          "eulerLine": [
            "false",
          ],
          "ninePointCircle": [
            "false",
          ],
          "orthocenter": [
            "false",
          ],
        },
        "예각삼각형": {
          "circumcenter": [
            "2",
            "1",
          ],
          "circumcircle": [
            "2",
            "1",
            "2.23606797749979",
          ],
          "eulerLine": [
            "1.6666666666666667",
            "1",
            "1",
            "1",
          ],
          "ninePointCircle": [
            "1.5",
            "1",
            "1.118033988749895",
          ],
          "orthocenter": [
            "1",
            "1",
          ],
        },
        "작은 스케일": {
          "circumcenter": [
            "2e-8",
            "9.999999999999999e-9",
          ],
          "circumcircle": [
            "2e-8",
            "9.999999999999999e-9",
            "2.2360679774997898e-8",
          ],
          "eulerLine": [
            "1.6666666666666667e-8",
            "9.999999999999999e-9",
            "9.999999999999997e-9",
            "1e-8",
          ],
          "ninePointCircle": [
            "1.5e-8",
            "1e-8",
            "1.1180339887498949e-8",
          ],
          "orthocenter": [
            "9.999999999999997e-9",
            "1e-8",
          ],
        },
        "정삼각형": {
          "circumcenter": [
            "0.5",
            "0.2886751345948128",
          ],
          "circumcircle": [
            "0.5",
            "0.2886751345948128",
            "0.5773502691896257",
          ],
          "eulerLine": [
            "0.5",
            "0.28867513459481287",
            "0.5",
            "0.288675134594813",
          ],
          "ninePointCircle": [
            "0.5",
            "0.28867513459481287",
            "0.28867513459481287",
          ],
          "orthocenter": [
            "0.5",
            "0.288675134594813",
          ],
        },
        "직각삼각형": {
          "circumcenter": [
            "2",
            "1.5",
          ],
          "circumcircle": [
            "2",
            "1.5",
            "2.5",
          ],
          "eulerLine": [
            "1.3333333333333333",
            "1",
            "0",
            "0",
          ],
          "ninePointCircle": [
            "1",
            "0.75",
            "1.25",
          ],
          "orthocenter": [
            "0",
            "0",
          ],
        },
        "큰 좌표 오프셋": {
          "circumcenter": [
            "100000001.33333333",
            "100000002",
          ],
          "circumcircle": [
            "100000001.33333333",
            "100000002",
            "2.4037008475541004",
          ],
          "eulerLine": [
            "100000001",
            "100000001.33333333",
            "100000000.33333334",
            "100000000",
          ],
          "ninePointCircle": [
            "100000000.83333334",
            "100000001",
            "1.2018504237770502",
          ],
          "orthocenter": [
            "100000000.33333334",
            "100000000",
          ],
        },
      }
    `);
  });
});
