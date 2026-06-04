/**
 * Triangle Side Classification
 *
 * 삼각형 세 꼭짓점을 drag하면 변 길이가 서로 같은지로 equilateral / isosceles / scalene을
 * 분류하고, 같은 길이로 판정된 변을 같은 색과 합동 tick으로 강조한다. 변 길이 비교에는 절대
 * tolerance(epsilon)가 쓰이므로, 두 변 길이 차가 epsilon 안에 들어와야 "같은 변"으로 본다.
 *
 * - Triangles.triangleFrom: 꼭짓점 3개로 분류 함수에 넣을 TriangleWritable을 만든다.
 * - Triangles.isEquilateral: 세 변 길이 차가 모두 epsilon 이하이면 equilateral로 판정한다.
 * - Triangles.isIsosceles: 두 변 길이가 epsilon 이내로 같으면 isosceles로 판정한다(equilateral 포함).
 * - Vectors.distance: 세 변 길이를 구해 diagnostics 표시와 같은 변 쌍 색칠에 쓴다.
 */

import * as Triangles from '@cp949/vectra/triangle';
import * as Vectors from '@cp949/vectra/vec';

type XY = { x: number; y: number };

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  // 삼각형 세 꼭짓점(주 drag 대상). 시작 모양은 AB=CA인 isosceles
  const verts: XY[] = [
    { x: 360, y: 110 },
    { x: 250, y: 320 },
    { x: 470, y: 320 },
  ];

  // 변 길이 같음 판정에 쓰는 절대 tolerance(px). float drag에서는 기본 epsilon 0으로는 절대
  // 같아지지 않으므로 가시적 tolerance를 명시적으로 넘긴다
  const EPS = 14;
  const HIT_RADIUS = 22;
  const GRAY = 0x64748b;
  const CYAN = 0x38bdf8;
  const GOLD = 0xfbbf24;
  let grabbed = -1;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 가장 가까운 꼭짓점을 잡는다
    grabbed = -1;
    for (let i = 0; i < verts.length; i++) {
      if (Math.hypot(verts[i].x - p.x, verts[i].y - p.y) <= HIT_RADIUS) {
        grabbed = i;
        break;
      }
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (grabbed < 0) return;
    const p = getCanvasXY(e);
    // 잡은 꼭짓점을 화면 안으로 clamp
    verts[grabbed].x = Math.max(16, Math.min(size.width - 16, p.x));
    verts[grabbed].y = Math.max(16, Math.min(size.height - 16, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = -1;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  // 변 정의: 두 끝 꼭짓점 index. 0=AB, 1=BC, 2=CA
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 0],
  ];

  const drawTick = (a: XY, b: XY, color: number): void => {
    // 합동 표시 tick: 변 중점에서 변에 수직인 짧은 선분
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    const t = 7;
    g.moveTo(mx - nx * t, my - ny * t)
      .lineTo(mx + nx * t, my + ny * t)
      .stroke({ color, width: 3 });
  };

  const render = (): void => {
    const [A, B, C] = verts;
    // 꼭짓점 3개로 분류용 삼각형을 만든다
    const tri = Triangles.triangleFrom(A, B, C);

    // 변 길이 3개 (AB, BC, CA)
    const sideLens = edges.map(([i, j]) => Vectors.distance(verts[i], verts[j]));

    // equilateral ⊂ isosceles 이므로 equilateral을 먼저 판정한다
    let type: 'equilateral' | 'isosceles' | 'scalene';
    if (Triangles.isEquilateral(tri, EPS)) type = 'equilateral';
    else if (Triangles.isIsosceles(tri, EPS)) type = 'isosceles';
    else type = 'scalene';

    // 각 변이 다른 변과 epsilon 이내로 같은 짝이 있는지 (predicate가 비교하는 그 관계의 시각화)
    const hasPartner = sideLens.map((li, i) => sideLens.some((lj, j) => i !== j && Math.abs(li - lj) <= EPS));
    // equilateral은 금색, isosceles의 같은 변은 청색, 짝 없는 변은 회색
    const eqColor = type === 'equilateral' ? GOLD : CYAN;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 변을 색/두께로 그리고, 같은 짝이 있는 변에는 합동 tick을 단다
    for (let e = 0; e < edges.length; e++) {
      const [i, j] = edges[e];
      const equal = hasPartner[e];
      const color = equal ? eqColor : GRAY;
      g.moveTo(verts[i].x, verts[i].y)
        .lineTo(verts[j].x, verts[j].y)
        .stroke({ color, width: equal ? 4 : 2 });
      if (equal) drawTick(verts[i], verts[j], color);
    }

    // 꼭짓점 marker (잡은 것은 크게)
    for (let i = 0; i < verts.length; i++) {
      g.circle(verts[i].x, verts[i].y, grabbed === i ? 9 : 7).fill({ color: 0xe2e8f0 });
    }

    label.text = [
      `type : ${type}   (eps=${EPS}px)   drag vertices`,
      `|AB| : ${sideLens[0].toFixed(1)}`,
      `|BC| : ${sideLens[1].toFixed(1)}`,
      `|CA| : ${sideLens[2].toFixed(1)}`,
    ].join('\n');
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    label.destroy();
    g.destroy();
  };
}
