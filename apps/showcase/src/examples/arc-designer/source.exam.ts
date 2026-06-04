import * as Curve from '@cp949/vectra/curve';
import * as SvgPath from '@cp949/vectra/svg-path';
import * as PIXI from 'pixi.js';

type Runtime = {
  app: PIXI.Application;
  size: { width: number; height: number };
};

export async function setup({ app, size }: Runtime) {
  const cx = size.width / 2;
  const cy = size.height / 2;

  const gfx = new PIXI.Graphics();
  app.stage.addChild(gfx);

  // 애니메이션 상태
  let elapsed = 0;
  const RADIUS_X = 130;
  const RADIUS_Y = 80;

  function draw(t: number) {
    gfx.clear();
    // 텍스트 제거
    for (const child of [...app.stage.children]) {
      if (child instanceof PIXI.Text) child.destroy();
    }

    // sweep angle 애니메이션 (0 → 2π)
    const sweepAngle = ((t * 0.4) % 1) * Math.PI * 2;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + sweepAngle;

    // center-form arc 정의 (vectra/curve CenterArcLike)
    const centerArc = {
      cx,
      cy,
      rx: RADIUS_X,
      ry: RADIUS_Y,
      xRotation: 0,
      startAngle,
      endAngle,
      sweep: true,
    };

    // center arc → endpoint arc 변환
    const endpointArc = { kind: 'arc' as const, x: 0, y: 0, rx: 0, ry: 0, xRotation: 0, largeArc: false, sweep: false };
    Curve.centerArcToEndpointInto(endpointArc, centerArc);

    // arc 길이 계산
    const len = Curve.arcLength(centerArc);

    // 호 그리기 (샘플링)
    const STEPS = 80;
    const tmp = { x: 0, y: 0 };
    Curve.arcPointAtLengthInto(tmp, centerArc, 0);
    gfx.moveTo(tmp.x, tmp.y);
    for (let i = 1; i <= STEPS; i++) {
      Curve.arcPointAtLengthInto(tmp, centerArc, (len * i) / STEPS);
      gfx.lineTo(tmp.x, tmp.y);
    }
    gfx.stroke({ color: 0x34d399, width: 3 });

    // 중심점
    gfx.circle(cx, cy, 4).fill(0x94a3b8);

    // 타원 외곽 (가이드)
    {
      const ellipsePath =
        'M ' +
        cx +
        ' ' +
        (cy - RADIUS_Y) +
        ' A ' +
        RADIUS_X +
        ' ' +
        RADIUS_Y +
        ' 0 1 1 ' +
        (cx - 0.001) +
        ' ' +
        (cy - RADIUS_Y);
      const cmds: any[] = [];
      SvgPath.parsePathDataInto(cmds, ellipsePath);
    }
    gfx.ellipse(cx, cy, RADIUS_X, RADIUS_Y).stroke({ color: 0x475569, width: 1, alpha: 0.3 });

    // 시작점(startAngle) / 끝점(endAngle) 마커
    Curve.arcPointAtLengthInto(tmp, centerArc, 0);
    gfx.circle(tmp.x, tmp.y, 5).fill(0x60a5fa);
    gfx.circle(endpointArc.x, endpointArc.y, 5).fill(0xf472b6);

    // 정보 텍스트
    const sweepDeg = ((sweepAngle / Math.PI) * 180).toFixed(1);
    const infoText = new PIXI.Text({
      text: `sweep: ${sweepDeg}°   arc length: ${Math.round(len)}px`,
      style: { fontSize: 13, fill: 0xe2e8f0 },
    });
    infoText.x = 20;
    infoText.y = 20;
    app.stage.addChild(infoText);

    const endpointText = new PIXI.Text({
      text: `largeArc: ${endpointArc.largeArc ? '1' : '0'}   sweep: ${endpointArc.sweep ? '1' : '0'}`,
      style: { fontSize: 12, fill: 0x94a3b8 },
    });
    endpointText.x = 20;
    endpointText.y = 40;
    app.stage.addChild(endpointText);
  }

  function tick(ticker: PIXI.Ticker) {
    elapsed += ticker.deltaMS / 1000;
    draw(elapsed);
  }

  app.ticker.add(tick);
  draw(0);
  return () => {
    app.ticker.remove(tick);
    gfx.destroy();
  };
}
