import * as Easing from '@cp949/vectra/easing';
import * as Interp from '@cp949/vectra/interpolation';
import * as Path from '@cp949/vectra/path';
import * as PIXI from 'pixi.js';

type PathCommand = { kind: 'move'; x: number; y: number } | { kind: 'line'; x: number; y: number } | { kind: 'close' };

type Runtime = {
  app: PIXI.Application;
  size: { width: number; height: number };
};

export async function setup({ app, size }: Runtime) {
  const cx = size.width / 2;
  const cy = size.height / 2;
  const r = Math.min(size.width, size.height) * 0.3;

  // 두 경로: 사각형 → 별 (각각 9개 L 커맨드로 균등화)
  function makeRect(): PathCommand[] {
    return Path.roundedRectCommandsInto(
      [],
      { x: cx - r, y: cy - r * 0.7, width: r * 2, height: r * 1.4 },
      12
    ) as PathCommand[];
  }

  function makeStar(n = 5): PathCommand[] {
    const out: PathCommand[] = [];
    for (let i = 0; i < n * 2; i++) {
      const angle = (Math.PI * i) / n - Math.PI / 2;
      const radius = i % 2 === 0 ? r : r * 0.45;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      out.push(i === 0 ? { kind: 'move', x, y } : { kind: 'line', x, y });
    }
    out.push({ kind: 'close' });
    return out;
  }

  // 샘플링으로 두 경로를 균등한 점 목록으로 변환
  const SAMPLE_COUNT = 60;
  const rectCmds = makeRect() as any[];
  const starCmds = makeStar() as any[];

  function samplePath(cmds: any[]): { x: number; y: number }[] {
    const total = Path.length(cmds);
    const pts: { x: number; y: number }[] = [];
    const tmp = { x: 0, y: 0 };
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      const t = i / SAMPLE_COUNT;
      Path.pointAtLengthInto(tmp, cmds, total * t);
      pts.push({ x: tmp.x, y: tmp.y });
    }
    return pts;
  }

  const rectPts = samplePath(rectCmds);
  const starPts = samplePath(starCmds);

  const gfx = new PIXI.Graphics();
  app.stage.addChild(gfx);

  let elapsed = 0;
  const CYCLE = 2.5; // 초 단위

  function tick(ticker: PIXI.Ticker) {
    elapsed += ticker.deltaMS / 1000;
    const phase = (elapsed % (CYCLE * 2)) / CYCLE;
    // 0→1: rect→star, 1→2: star→rect
    const raw = phase <= 1 ? phase : 2 - phase;
    const t = Easing.cubicInOut(raw);

    gfx.clear();

    // 보간된 경로 그리기
    const tmp2 = { x: 0, y: 0 };
    Interp.lerpPointInto(tmp2, rectPts[0], starPts[0], t);
    gfx.moveTo(tmp2.x, tmp2.y);
    for (let i = 1; i < SAMPLE_COUNT; i++) {
      Interp.lerpPointInto(tmp2, rectPts[i], starPts[i], t);
      gfx.lineTo(tmp2.x, tmp2.y);
    }
    gfx.closePath().fill({ color: 0x818cf8, alpha: 0.75 }).stroke({ color: 0xc7d2fe, width: 2 });
  }

  app.ticker.add(tick);
  return () => {
    app.ticker.remove(tick);
    gfx.destroy();
  };
}
