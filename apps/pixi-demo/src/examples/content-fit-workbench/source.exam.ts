/**
 * Content Fit Workbench
 *
 * 같은 콘텐츠와 같은 프레임을 두고 contain / cover fit을 나란히 비교한다. corner handle로 프레임
 * 크기와 aspect를 바꾸면 왼쪽 preview는 전체 콘텐츠를 보존하는 contain fit을, 오른쪽 preview는
 * 프레임을 꽉 채우고 넘친 부분을 자르는 cover fit을 다시 계산한다.
 *
 * - Matrix.fitRect: source rect를 대상 프레임 안에 contain으로 맞추는 transform을 만든다.
 * - Rectx.fitOutside: source aspect를 유지하면서 대상 프레임을 완전히 덮는 cover rect를 만든다.
 */

import * as Matrix from '@cp949/vectra/matrix';
import * as Rectx from '@cp949/vectra/rect';

type XY = { x: number; y: number };
type Rect = { x: number; y: number; width: number; height: number };
type Corner = 'tl' | 'br';
type DragTarget = { corner: Corner; origin: XY };

const BG = 0x0f172a;
const FRAME = 0x38bdf8;
const CONTENT = 0x0e7490;
const GRID = 0x67e8f9;
const FOCAL = 0xfacc15;
const HANDLE = 0xf97316;
const GHOST = 0x64748b;
const MIN_SIZE = 48;
const HIT_RADIUS = 18;

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const bgG = new PIXI.Graphics();
  const containG = new PIXI.Graphics();
  const coverG = new PIXI.Graphics();
  const coverMask = new PIXI.Graphics();
  const overlayG = new PIXI.Graphics();
  app.stage.addChild(bgG);
  app.stage.addChild(containG);
  app.stage.addChild(coverG);
  app.stage.addChild(coverMask);
  app.stage.addChild(overlayG);
  coverG.mask = coverMask;

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  const src: Rect = { x: 0, y: 0, width: 300, height: 200 };
  const srcBounds = { min: { x: 0, y: 0 }, max: { x: src.width, y: src.height } };
  const srcPoints: readonly XY[] = [
    { x: 0, y: 0 },
    { x: src.width, y: 0 },
    { x: src.width, y: src.height },
    { x: 0, y: src.height },
  ];
  const out: XY = { x: 0, y: 0 };

  const panelY = 104;
  const leftOrigin: XY = { x: 56, y: panelY };
  const rightOrigin: XY = { x: 410, y: panelY };
  const corners: Record<Corner, XY> = {
    tl: { x: 24, y: 36 },
    br: { x: 276, y: 236 },
  };

  let dragTarget: DragTarget | null = null;

  const containTitle = new PIXI.Text({
    text: 'contain: full image, letterbox',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  containTitle.position.set(leftOrigin.x, 76);
  app.stage.addChild(containTitle);

  const coverTitle = new PIXI.Text({
    text: 'cover: full frame, cropped image',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  coverTitle.position.set(rightOrigin.x, 76);
  app.stage.addChild(coverTitle);

  const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
  const distance = (a: XY, b: XY): number => Math.hypot(a.x - b.x, a.y - b.y);

  const frameSize = (): { width: number; height: number } => ({
    width: Math.max(MIN_SIZE, Math.abs(corners.br.x - corners.tl.x)),
    height: Math.max(MIN_SIZE, Math.abs(corners.br.y - corners.tl.y)),
  });

  const panelFrame = (origin: XY): Rect => {
    const minX = Math.min(corners.tl.x, corners.br.x);
    const minY = Math.min(corners.tl.y, corners.br.y);
    const maxX = Math.max(corners.tl.x, corners.br.x);
    const maxY = Math.max(corners.tl.y, corners.br.y);
    return {
      x: origin.x + minX,
      y: origin.y + minY,
      width: Math.max(MIN_SIZE, maxX - minX),
      height: Math.max(MIN_SIZE, maxY - minY),
    };
  };

  const handleWorld = (origin: XY, key: Corner): XY => ({
    x: origin.x + corners[key].x,
    y: origin.y + corners[key].y,
  });

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (size.width / rect.width),
      y: (e.clientY - rect.top) * (size.height / rect.height),
    };
  };

  const nearestHandle = (p: XY): DragTarget | null => {
    for (const origin of [leftOrigin, rightOrigin]) {
      for (const key of ['tl', 'br'] as Corner[]) {
        if (distance(p, handleWorld(origin, key)) <= HIT_RADIUS) return { corner: key, origin };
      }
    }
    return null;
  };

  const onPointerDown = (e: PointerEvent): void => {
    dragTarget = nearestHandle(getCanvasXY(e));
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (dragTarget === null) return;
    const p = getCanvasXY(e);
    corners[dragTarget.corner].x = clamp(p.x - dragTarget.origin.x, 0, 292);
    corners[dragTarget.corner].y = clamp(p.y - dragTarget.origin.y, 0, 276);
  };

  const onPointerUp = (): void => {
    dragTarget = null;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawImageRect = (target: PIXI.Graphics, r: Rect): void => {
    target.rect(r.x, r.y, r.width, r.height).fill({ color: CONTENT, alpha: 0.9 });
    for (let i = 1; i < 6; i++) {
      const x = r.x + (r.width * i) / 6;
      target.moveTo(x, r.y).lineTo(x, r.y + r.height);
    }
    for (let i = 1; i < 4; i++) {
      const y = r.y + (r.height * i) / 4;
      target.moveTo(r.x, y).lineTo(r.x + r.width, y);
    }
    target.stroke({ color: GRID, width: 1, alpha: 0.62 });
    target.circle(r.x + r.width / 2, r.y + r.height / 2, Math.min(r.width, r.height) * 0.18).stroke({
      color: FOCAL,
      width: 3,
    });
  };

  const renderContain = (): Rect => {
    const frame = panelFrame(leftOrigin);
    const matrix = Matrix.fitRect(src, frame);
    const rect = Rectx.fitInside(src, frame);
    const fitted = Matrix.transformBounds(matrix, srcBounds);

    containG.clear();
    drawImageRect(containG, rect);
    for (let i = 0; i < srcPoints.length; i++) {
      Matrix.transformPointInto(out, matrix, srcPoints[i]);
      if (i === 0) containG.moveTo(out.x, out.y);
      else containG.lineTo(out.x, out.y);
    }
    containG.closePath().stroke({ color: FOCAL, width: 2, alpha: 0.8 });
    overlayG.rect(frame.x, frame.y, frame.width, frame.height).stroke({ color: FRAME, width: 2 });
    overlayG.rect(fitted.min.x, fitted.min.y, fitted.max.x - fitted.min.x, fitted.max.y - fitted.min.y).stroke({
      color: HANDLE,
      width: 1,
      alpha: 0.8,
    });

    return rect;
  };

  const renderCover = (): Rect => {
    const frame = panelFrame(rightOrigin);
    const cover = Rectx.fitOutside(src, frame);

    coverMask.clear();
    coverMask.rect(frame.x, frame.y, frame.width, frame.height).fill({ color: 0xffffff });

    coverG.clear();
    drawImageRect(coverG, cover);

    overlayG.rect(cover.x, cover.y, cover.width, cover.height).stroke({ color: GHOST, width: 1, alpha: 0.9 });
    overlayG.rect(frame.x, frame.y, frame.width, frame.height).stroke({ color: FRAME, width: 2 });

    return cover;
  };

  const render = (): void => {
    const s = frameSize();
    bgG.clear();
    overlayG.clear();
    bgG.rect(0, 0, size.width, size.height).fill({ color: BG });

    const contain = renderContain();
    const cover = renderCover();

    for (const origin of [leftOrigin, rightOrigin]) {
      for (const key of ['tl', 'br'] as Corner[]) {
        const h = handleWorld(origin, key);
        const isDragging = dragTarget?.corner === key;
        overlayG.circle(h.x, h.y, isDragging ? 10 : 8).fill({ color: HANDLE });
        overlayG.circle(h.x, h.y, HIT_RADIUS).stroke({ color: HANDLE, width: 1, alpha: 0.18 });
      }
    }

    label.text = [
      `frame   : ${s.width.toFixed(0)} x ${s.height.toFixed(0)}`,
      `contain : ${contain.width.toFixed(0)} x ${contain.height.toFixed(0)}`,
      `cover   : ${cover.width.toFixed(0)} x ${cover.height.toFixed(0)}`,
    ].join('\n');
  };

  app.ticker.add(render);
  render();

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    label.destroy();
    containTitle.destroy();
    coverTitle.destroy();
    coverG.mask = null;
    bgG.destroy();
    containG.destroy();
    coverG.destroy();
    coverMask.destroy();
    overlayG.destroy();
  };
}
