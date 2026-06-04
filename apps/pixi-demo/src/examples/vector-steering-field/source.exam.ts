/**
 * Vector Steering Field
 *
 * 40개의 agent가 pointer를 향해 방향을 바꾸며 이동한다.
 *
 * - Vectorx.normalizeInto: 목표 방향 단위벡터 계산
 * - Vectorx.addScaledInto: vel 가속 누적 및 pos delta-time 업데이트
 * - Anglex.fromVector: vel에서 heading 각도 추출
 * - Anglex.moveTowardAngle: visual facing을 vel heading으로 부드럽게 회전
 * - Randomx.direction: 에이전트 초기 무작위 속도 방향
 * - Randomx.float: 에이전트 초기 무작위 위치
 * - Mathx.cycle: 화면 밖 위치를 [0, W)·[0, H)로 감싸는 경계 wrap (steering 핵심 아닌 보조 산술)
 */

import * as Anglex from '@cp949/vectra/angle';
import * as Mathx from '@cp949/vectra/math';
import * as Randomx from '@cp949/vectra/random';
import * as Vectorx from '@cp949/vectra/vec';

const AGENT_COUNT = 40;
const MAX_SPEED = 3;
const ACCEL = 0.25;
const MAX_TURN_RATE = 0.12;

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app } = runtime;

  const canvas = app.canvas as HTMLCanvasElement;
  const W = app.screen.width;
  const H = app.screen.height;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  // 에이전트 초기화
  const agents = Array.from({ length: AGENT_COUNT }, () => {
    const vel = Randomx.direction(MAX_SPEED * 0.5);
    return {
      pos: { x: Randomx.float(0, W), y: Randomx.float(0, H) },
      vel,
      facing: Anglex.fromVector(vel),
    };
  });

  const pointer = { x: W / 2, y: H / 2 };

  const onPointerMove = (e: PointerEvent): void => {
    // canvas CSS 크기가 screen 크기(W,H)와 다를 수 있어 비율로 보정한다
    const rect = canvas.getBoundingClientRect();
    pointer.x = (e.clientX - rect.left) * (W / rect.width);
    pointer.y = (e.clientY - rect.top) * (H / rect.height);
  };
  canvas.addEventListener('pointermove', onPointerMove);

  const dir = { x: 0, y: 0 };

  const render = (): void => {
    // deltaTime은 프레임 단위(60fps에서 ≈1.0). 상수들은 이 단위 기준으로 튜닝됐다.
    // 탭 비활성 후 복귀 시 dt 폭주로 agent가 wrap 경계를 건너뛰는 것을 막기 위해 clamp.
    const dt = Math.min(app.ticker.deltaTime, 2);
    g.clear();

    for (const agent of agents) {
      // 목표 방향 단위벡터
      dir.x = pointer.x - agent.pos.x;
      dir.y = pointer.y - agent.pos.y;
      const dist = Math.hypot(dir.x, dir.y);
      if (dist > 0.5) {
        Vectorx.normalizeInto(dir, dir);
        // vel += dir * ACCEL * dt (목표 방향으로 가속)
        Vectorx.addScaledInto(agent.vel, agent.vel, dir, ACCEL * dt);
      }

      // 속도 제한
      const speed = Math.hypot(agent.vel.x, agent.vel.y);
      if (speed > MAX_SPEED) {
        agent.vel.x = (agent.vel.x / speed) * MAX_SPEED;
        agent.vel.y = (agent.vel.y / speed) * MAX_SPEED;
      }

      // vel 방향으로 visual facing 부드럽게 회전
      agent.facing = Anglex.moveTowardAngle(agent.facing, Anglex.fromVector(agent.vel), MAX_TURN_RATE * dt);

      // pos += vel * dt
      Vectorx.addScaledInto(agent.pos, agent.pos, agent.vel, dt);

      // 경계 wrap: 화면 밖으로 나간 위치를 [0, W)·[0, H)로 감싼다 (음수 위치도 positive modulo)
      agent.pos.x = Mathx.cycle(agent.pos.x, W);
      agent.pos.y = Mathx.cycle(agent.pos.y, H);

      // facing 방향 삼각형 그리기
      const nx = Math.cos(agent.facing);
      const ny = Math.sin(agent.facing);
      const px = -ny;
      const py = nx;
      g.moveTo(agent.pos.x + nx * 8, agent.pos.y + ny * 8)
        .lineTo(agent.pos.x - nx * 4 + px * 4, agent.pos.y - ny * 4 + py * 4)
        .lineTo(agent.pos.x - nx * 4 - px * 4, agent.pos.y - ny * 4 - py * 4)
        .closePath()
        .fill({ color: 0x7dd3fc, alpha: 0.85 });
    }

    // pointer 마커 (분홍)
    g.circle(pointer.x, pointer.y, 6).fill({ color: 0xf472b6 });
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointermove', onPointerMove);
    g.destroy();
  };
}
