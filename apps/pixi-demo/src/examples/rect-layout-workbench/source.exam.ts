/**
 * Rect Layout Workbench
 *
 * UI frame, selection bounds, split pane 같은 rect layout 작업을 한 화면에서 비교한다. 각 행의 주황
 * handle을 drag하면 해당 layout helper의 결과 rect가 다시 계산된다.
 *
 * - Rectx.expandToIncludePointInto: base rect가 probe point를 포함하도록 최소 확장한다.
 * - Rectx.inflateInto: base rect를 단일 amount로 사방 uniform inflate/deflate한다.
 * - Rectx.halves: frame을 divider ratio 기준 좌/우 두 panel로 나눈다.
 * - Boundsx.expandToIncludeBoundsInto: 두 AABB를 모두 감싸는 union bounds를 만든다.
 */

import * as Boundsx from '@cp949/vectra/bounds';
import * as Rectx from '@cp949/vectra/rect';

type XY = { x: number; y: number };
type Rect = { x: number; y: number; width: number; height: number };
type Bounds = { min: XY; max: XY };
type CaseId = 'include' | 'inflate' | 'split' | 'union';

const BG = 0x0f172a;
const BASE = 0x64748b;
const RESULT = 0x4ade80;
const SECOND = 0xfbbf24;
const WARN = 0xf87171;
const HANDLE = 0xf97316;
const LABEL = 0xe2e8f0;
const ROW_H = 104;
const GRAB_R = 18;

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const title = new PIXI.Text({
    text: 'Rect Layout Workbench',
    style: { fill: LABEL, fontFamily: 'monospace', fontSize: 15, fontWeight: '700' },
  });
  title.position.set(16, 14);
  app.stage.addChild(title);

  const label = new PIXI.Text({
    text: '',
    style: { fill: LABEL, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 38);
  app.stage.addChild(label);

  const rows = {
    include: { y: 86, name: 'selection grows to include point', fn: 'rect.expandToIncludePointInto' },
    inflate: { y: 190, name: 'padding / margin inflate', fn: 'rect.inflateInto' },
    split: { y: 294, name: 'split pane divider', fn: 'rect.halves' },
    union: { y: 398, name: 'group selection bounds', fn: 'bounds.expandToIncludeBoundsInto' },
  } satisfies Record<CaseId, { y: number; name: string; fn: string }>;

  const includeBase: Rect = { x: 370, y: rows.include.y + 22, width: 150, height: 50 };
  const includePoint: XY = { x: 585, y: rows.include.y + 72 };
  const includeOut: Rect = { x: 0, y: 0, width: 0, height: 0 };

  const inflateBase: Rect = { x: 386, y: rows.inflate.y + 26, width: 130, height: 44 };
  const inflateHandle: XY = { x: inflateBase.x + inflateBase.width + 34, y: inflateBase.y + inflateBase.height / 2 };
  const inflateOut: Rect = { x: 0, y: 0, width: 0, height: 0 };

  const splitFrame: Rect = { x: 340, y: rows.split.y + 18, width: 240, height: 62 };
  let splitX = splitFrame.x + splitFrame.width * 0.56;

  const boxA: Bounds = {
    min: { x: 355, y: rows.union.y + 16 },
    max: { x: 495, y: rows.union.y + 66 },
  };
  const boxBSize = { width: 92, height: 54 };
  const boxB: Bounds = {
    min: { x: 520, y: rows.union.y + 40 },
    max: { x: 520 + boxBSize.width, y: rows.union.y + 40 + boxBSize.height },
  };
  const unionOut: Bounds = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };

  let dragTarget: CaseId | null = null;
  let unionGrabOffset: XY = { x: 0, y: 0 };

  const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
  const distance = (a: XY, b: XY): number => Math.hypot(a.x - b.x, a.y - b.y);

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (size.width / rect.width),
      y: (e.clientY - rect.top) * (size.height / rect.height),
    };
  };

  const handleFor = (id: CaseId): XY => {
    if (id === 'include') return includePoint;
    if (id === 'inflate') return inflateHandle;
    if (id === 'split') return { x: splitX, y: splitFrame.y + splitFrame.height / 2 };
    return {
      x: (boxB.min.x + boxB.max.x) / 2,
      y: (boxB.min.y + boxB.max.y) / 2,
    };
  };

  const nearestHandle = (p: XY): CaseId | null => {
    const order: CaseId[] = ['include', 'inflate', 'split', 'union'];
    return order.find((id) => distance(p, handleFor(id)) <= GRAB_R) ?? null;
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    dragTarget = nearestHandle(p);
    if (dragTarget === 'union') {
      unionGrabOffset = { x: p.x - boxB.min.x, y: p.y - boxB.min.y };
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (dragTarget === null) return;
    const p = getCanvasXY(e);
    const row = rows[dragTarget];
    const x = clamp(p.x, 24, size.width - 24);
    const y = clamp(p.y, row.y + 8, row.y + ROW_H - 12);

    if (dragTarget === 'include') {
      includePoint.x = x;
      includePoint.y = y;
    } else if (dragTarget === 'inflate') {
      inflateHandle.x = clamp(p.x, 220, size.width - 24);
    } else if (dragTarget === 'split') {
      splitX = clamp(p.x, splitFrame.x, splitFrame.x + splitFrame.width);
    } else {
      const minX = clamp(p.x - unionGrabOffset.x, 250, size.width - boxBSize.width - 20);
      const minY = clamp(p.y - unionGrabOffset.y, row.y + 6, row.y + ROW_H - boxBSize.height - 6);
      boxB.min.x = minX;
      boxB.min.y = minY;
      boxB.max.x = minX + boxBSize.width;
      boxB.max.y = minY + boxBSize.height;
    }
  };

  const onPointerUp = (): void => {
    dragTarget = null;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawHeader = (id: CaseId, metric: string): void => {
    const row = rows[id];
    g.rect(0, row.y - 8, size.width, ROW_H).fill({ color: RESULT, alpha: 0.05 });
  };

  const drawRect = (r: Rect, color: number, alpha = 0.16, width = 2): void => {
    g.rect(r.x, r.y, r.width, r.height).fill({ color, alpha }).stroke({ color, width });
  };

  const drawBounds = (b: Bounds, color: number, alpha = 0.16, width = 2): void => {
    g.rect(b.min.x, b.min.y, b.max.x - b.min.x, b.max.y - b.min.y)
      .fill({ color, alpha })
      .stroke({ color, width });
  };

  const render = (): void => {
    Rectx.expandToIncludePointInto(includeOut, includeBase, includePoint);
    const inflateAmount = inflateHandle.x - (inflateBase.x + inflateBase.width);
    Rectx.inflateInto(inflateOut, inflateBase, inflateAmount);
    const splitRatio = (splitX - splitFrame.x) / splitFrame.width;
    const split = Rectx.halves(splitFrame, { ratio: splitRatio });
    Boundsx.expandToIncludeBoundsInto(unionOut, boxA, boxB);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG });

    const includeMetric = `${includeOut.width.toFixed(0)} x ${includeOut.height.toFixed(0)} expanded`;
    drawHeader('include', includeMetric);
    drawRect(includeOut, RESULT, 0.12);
    drawRect(includeBase, BASE, 0.04);
    g.circle(includePoint.x, includePoint.y, dragTarget === 'include' ? 8 : 6).fill({ color: HANDLE });

    const inflateCollapsed = inflateOut.width <= 0 || inflateOut.height <= 0;
    const inflateMetric = `${inflateAmount.toFixed(0)} px ${inflateCollapsed ? 'collapsed' : 'amount'}`;
    drawHeader('inflate', inflateMetric);
    drawRect(inflateBase, BASE, 0.04);
    drawRect(
      {
        x: Math.min(inflateOut.x, inflateOut.x + inflateOut.width),
        y: Math.min(inflateOut.y, inflateOut.y + inflateOut.height),
        width: Math.abs(inflateOut.width),
        height: Math.abs(inflateOut.height),
      },
      inflateCollapsed ? WARN : RESULT,
      0.12
    );
    g.circle(inflateHandle.x, inflateHandle.y, dragTarget === 'inflate' ? 8 : 6).fill({ color: HANDLE });

    const splitMetric = `${(splitRatio * 100).toFixed(0)}% / ${((1 - splitRatio) * 100).toFixed(0)}%`;
    drawHeader('split', splitMetric);
    drawRect(split.first, RESULT, 0.24);
    drawRect(split.second, SECOND, 0.24);
    g.rect(splitFrame.x, splitFrame.y, splitFrame.width, splitFrame.height).stroke({ color: LABEL, width: 1 });
    g.moveTo(splitX, splitFrame.y)
      .lineTo(splitX, splitFrame.y + splitFrame.height)
      .stroke({ color: LABEL, width: 2 });
    g.circle(splitX, splitFrame.y + splitFrame.height / 2, dragTarget === 'split' ? 8 : 6).fill({ color: HANDLE });

    const unionW = unionOut.max.x - unionOut.min.x;
    const unionH = unionOut.max.y - unionOut.min.y;
    const unionMetric = `${unionW.toFixed(0)} x ${unionH.toFixed(0)} group bounds`;
    drawHeader('union', unionMetric);
    drawBounds(unionOut, RESULT, 0.1, 3);
    drawBounds(boxA, BASE, 0.08);
    drawBounds(boxB, SECOND, 0.14, dragTarget === 'union' ? 3 : 2);
    const unionHandle = handleFor('union');
    g.circle(unionHandle.x, unionHandle.y, dragTarget === 'union' ? 8 : 6).fill({ color: HANDLE });

    label.text = [
      'Rect Layout Workbench',
      `include: ${includeMetric}   inflate: ${inflateMetric}`,
      `split: ${splitMetric}   union: ${unionMetric}`,
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
    title.destroy();
    label.destroy();
    g.destroy();
  };
}
