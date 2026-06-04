/**
 * Path Morph
 *
 * 두 path command list를 morph 전처리한 뒤, ticker가 만든 진행도에 easing을 적용해 중간 path를
 * 그린다. 하늘색 path는 현재 morph 결과이고, 작은 점들은 flatten된 polyline sample이다.
 * 회색 ghost path는 시작/도착 shape를 보여준다.
 *
 * - Paths.normalizeCommandsInto: morph 입력 path에 명시적인 시작 command를 보장
 * - Paths.equalizeSegmentsInto: draw segment 수가 다른 두 path에 zero-length cubic을 삽입해 길이를 맞춤
 * - Paths.flattenInto: 현재 morph path를 polyline sample로 변환해 렌더링 diagnostics 생성
 * - Easing.cubicInOut: 왕복 진행도를 부드러운 morph timing으로 변환
 * - Interpolation.lerpPointInto: 각 command endpoint/control point를 보간
 */

import * as Easing from '@cp949/vectra/easing';
import * as Interpolation from '@cp949/vectra/interpolation';
import * as Paths from '@cp949/vectra/path';

type Point = { x: number; y: number };
type MutableCommand =
  | { kind: 'move'; x: number; y: number }
  | { kind: 'line'; x: number; y: number }
  | { kind: 'quadratic'; x1: number; y1: number; x: number; y: number }
  | { kind: 'cubic'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | {
      kind: 'arc';
      rx: number;
      ry: number;
      xRotation: number;
      largeArc: boolean;
      sweep: boolean;
      x: number;
      y: number;
    }
  | { kind: 'close' };

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(18, 18);
  app.stage.addChild(label);

  const blobPath: Paths.PathCommand[] = [
    { kind: 'move', x: 360, y: 92 },
    { kind: 'cubic', x1: 470, y1: 82, x2: 574, y2: 150, x: 560, y: 230 },
    { kind: 'cubic', x1: 548, y1: 318, x2: 458, y2: 366, x: 348, y: 348 },
    { kind: 'cubic', x1: 236, y1: 330, x2: 150, y2: 274, x: 174, y: 190 },
    { kind: 'cubic', x1: 194, y1: 120, x2: 278, y2: 102, x: 360, y: 92 },
  ];

  const ribbonPath: Paths.PathCommand[] = [
    { kind: 'move', x: 130, y: 245 },
    { kind: 'cubic', x1: 230, y1: 96, x2: 342, y2: 358, x: 450, y: 210 },
    { kind: 'cubic', x1: 526, y1: 106, x2: 604, y2: 258, x: 590, y: 334 },
  ];

  const normalizedA: Paths.PathCommand[] = [];
  const normalizedB: Paths.PathCommand[] = [];
  const equalizedA: Paths.PathCommand[] = [];
  const equalizedB: Paths.PathCommand[] = [];
  const morphed: MutableCommand[] = [];
  const flat: Point[] = [];
  const tmpA = { x: 0, y: 0 };
  const tmpB = { x: 0, y: 0 };
  const tmpC = { x: 0, y: 0 };

  Paths.normalizeCommandsInto(normalizedA, blobPath);
  Paths.normalizeCommandsInto(normalizedB, ribbonPath);
  Paths.equalizeSegmentsInto(equalizedA, equalizedB, normalizedA, normalizedB);

  const copyCommand = (cmd: Paths.PathCommand): MutableCommand => ({ ...cmd }) as MutableCommand;
  for (const cmd of equalizedA) {
    morphed.push(copyCommand(cmd));
  }

  const morphPathInto = (
    out: MutableCommand[],
    a: readonly Paths.PathCommand[],
    b: readonly Paths.PathCommand[],
    t: number
  ): void => {
    for (let i = 0; i < out.length; i++) {
      const ca = a[i];
      const cb = b[i];
      const co = out[i];
      if (ca.kind !== cb.kind || ca.kind !== co.kind) {
        continue;
      }

      if (ca.kind === 'move' && cb.kind === 'move' && co.kind === 'move') {
        Interpolation.lerpPointInto(tmpA, ca, cb, t);
        co.x = tmpA.x;
        co.y = tmpA.y;
        continue;
      }

      if (ca.kind === 'cubic' && cb.kind === 'cubic' && co.kind === 'cubic') {
        Interpolation.lerpPointInto(tmpA, { x: ca.x1, y: ca.y1 }, { x: cb.x1, y: cb.y1 }, t);
        Interpolation.lerpPointInto(tmpB, { x: ca.x2, y: ca.y2 }, { x: cb.x2, y: cb.y2 }, t);
        Interpolation.lerpPointInto(tmpC, ca, cb, t);
        co.x1 = tmpA.x;
        co.y1 = tmpA.y;
        co.x2 = tmpB.x;
        co.y2 = tmpB.y;
        co.x = tmpC.x;
        co.y = tmpC.y;
      }
    }
  };

  const drawPath = (commands: readonly Paths.PathCommand[], color: number, width: number, alpha = 1): void => {
    for (const cmd of commands) {
      if (cmd.kind === 'move') {
        g.moveTo(cmd.x, cmd.y);
      } else if (cmd.kind === 'line') {
        g.lineTo(cmd.x, cmd.y);
      } else if (cmd.kind === 'quadratic') {
        g.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
      } else if (cmd.kind === 'cubic') {
        g.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
      } else if (cmd.kind === 'close') {
        g.closePath();
      }
    }
    g.stroke({ color, width, alpha });
  };

  const render = (ticker: PIXI.Ticker): void => {
    const cycle = (ticker.lastTime % 3600) / 3600;
    const pingPong = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2;
    const eased = Easing.cubicInOut(pingPong);

    morphPathInto(morphed, equalizedA, equalizedB, eased);
    Paths.flattenInto(flat, morphed, { flatness: 2 });

    g.clear();

    drawPath(equalizedA, 0x64748b, 1, 0.45);
    drawPath(equalizedB, 0x64748b, 1, 0.45);
    drawPath(morphed, 0x38bdf8, 4);

    for (let i = 0; i < flat.length; i += 3) {
      g.circle(flat[i].x, flat[i].y, 2.5).fill({ color: 0xf472b6, alpha: 0.8 });
    }

    label.text = `path morph  t ${eased.toFixed(2)}  segments ${equalizedA.length - 1}/${equalizedB.length - 1}`;
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    g.destroy();
    label.destroy();
  };
}
