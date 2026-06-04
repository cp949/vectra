/**
 * SVG Points Roundtrip Editor
 *
 * SVG `<polygon>`과 `<polyline>` points 문자열을 파싱해 도형을 그리고, 꼭짓점을 드래그하면
 * 편집된 좌표가 다시 SVG points 문자열과 generic point-array 문자열로 직렬화된다.
 *
 * - Adapters.parseSvgPolygon: polygon points 문자열을 `{ x, y }` 배열로 변환
 * - Adapters.parseSvgPolyline: polyline points 문자열을 `{ x, y }` 배열로 변환
 * - Adapters.svgPolygonToString: 편집된 polygon 좌표를 SVG points 문자열로 직렬화
 * - Adapters.svgPolylineToString: 편집된 polyline 좌표를 SVG points 문자열로 직렬화
 * - Adapters.parsePointArray: generic point-array 입력을 같은 grammar로 파싱
 * - Adapters.pointsToString: generic point-array 문자열 round-trip 결과 생성
 * - Adapters.toFlatCoords: 외부 flat coordinate payload 미리보기 생성
 */

import * as Adapters from '@cp949/vectra/adapter';

type Point = { x: number; y: number };

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 12, wordWrap: true, wordWrapWidth: size.width - 32 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  const captions = [
    new PIXI.Text({
      text: '<polygon>',
      style: { fill: 0x38bdf8, fontSize: 13, fontFamily: 'monospace' },
    }),
    new PIXI.Text({
      text: '<polyline>',
      style: { fill: 0x4ade80, fontSize: 13, fontFamily: 'monospace' },
    }),
    new PIXI.Text({
      text: 'generic point-array',
      style: { fill: 0xf472b6, fontSize: 13, fontFamily: 'monospace' },
    }),
    new PIXI.Text({
      text: 'flat coords preview',
      style: { fill: 0xfacc15, fontSize: 13, fontFamily: 'monospace' },
    }),
  ];
  captions[0].position.set(124, 318);
  captions[1].position.set(486, 306);
  captions[2].position.set(112, 396);
  captions[3].position.set(430, 394);
  for (const caption of captions) app.stage.addChild(caption);

  const polygonInput = '126,132 244,88 338,170 286,300 146,272';
  const polylineInput = '450,112 536,92 618,144 592,246 488,284 438,220';
  const pointArrayInput = '112 354, 168 328, 238 372, 318 340';

  const polygon = Adapters.parseSvgPolygon(polygonInput);
  const polyline = Adapters.parseSvgPolyline(polylineInput);
  const genericPoints = Adapters.parsePointArray(pointArrayInput);

  let grabbed: { points: Point[]; index: number } | null = null;

  const getCanvasXY = (e: PointerEvent): Point => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const findHandle = (p: Point): { points: Point[]; index: number } | null => {
    const sets = [polygon, polyline, genericPoints];
    for (const points of sets) {
      for (let i = 0; i < points.length; i++) {
        const dx = p.x - points[i].x;
        const dy = p.y - points[i].y;
        if (dx * dx + dy * dy <= 144) return { points, index: i };
      }
    }
    return null;
  };

  const onPointerDown = (e: PointerEvent): void => {
    grabbed = findHandle(getCanvasXY(e));
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    grabbed.points[grabbed.index].x = Math.max(42, Math.min(size.width - 42, p.x));
    grabbed.points[grabbed.index].y = Math.max(72, Math.min(size.height - 36, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = null;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const drawPointList = (points: Point[], color: number, closed: boolean): void => {
    if (points.length === 0) return;
    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) g.lineTo(points[i].x, points[i].y);
    if (closed) g.closePath();
    if (closed) g.fill({ color, alpha: 0.14 });
    g.stroke({ color, width: 2 });

    for (const p of points) {
      g.circle(p.x, p.y, 6).fill({ color: 0x0f172a }).stroke({ color, width: 2 });
    }
  };

  const drawFlatPreview = (coords: readonly number[]): void => {
    for (let i = 0; i < coords.length; i += 2) {
      const x = 430 + i * 3;
      const y = 346 + coords[i + 1] * 0.08;
      g.circle(x, y, 3).fill({ color: 0xfacc15, alpha: 0.85 });
    }
  };

  const render = (): void => {
    const polygonOut = Adapters.svgPolygonToString(polygon, { precision: 1 });
    const polylineOut = Adapters.svgPolylineToString(polyline, { precision: 1 });
    const genericOut = Adapters.pointsToString(genericPoints, { precision: 1 });
    const flatPreview = Adapters.toFlatCoords(polyline);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    drawPointList(polygon, 0x38bdf8, true);
    drawPointList(polyline, 0x4ade80, false);
    drawPointList(genericPoints, 0xf472b6, false);
    drawFlatPreview(flatPreview);

    label.text =
      `polygon:  ${polygonOut}\n` +
      `polyline: ${polylineOut}\n` +
      `generic:  ${genericOut}\n` +
      `flat[0..5]: ${flatPreview
        .slice(0, 6)
        .map((n) => n.toFixed(1))
        .join(', ')}   drag vertices`;
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    g.destroy();
    label.destroy();
    for (const caption of captions) caption.destroy();
  };
}
