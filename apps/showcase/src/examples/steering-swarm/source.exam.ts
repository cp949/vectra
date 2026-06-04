import * as Angles from '@cp949/vectra/angle';
import * as Vec from '@cp949/vectra/vec';
import * as PIXI from 'pixi.js';

type Runtime = {
  app: PIXI.Application;
  size: { width: number; height: number };
  pointer: { x: number; y: number };
  rng: () => number;
};

type Agent = {
  pos: { x: number; y: number };
  vel: { x: number; y: number };
};

const AGENT_COUNT = 80;
const MAX_SPEED = 2.2;
const STEER_FORCE = 0.12;
const ARRIVE_RADIUS = 60;

export async function setup({ app, size, pointer, rng }: Runtime) {
  // 에이전트 초기화: 화면에 무작위 배치
  const agents: Agent[] = Array.from({ length: AGENT_COUNT }, () => ({
    pos: { x: rng() * size.width, y: rng() * size.height },
    vel: { x: (rng() - 0.5) * 2, y: (rng() - 0.5) * 2 },
  }));

  const gfx = new PIXI.Graphics();
  app.stage.addChild(gfx);

  // 에이전트를 포인터 방향으로 조향
  function steerToward(agent: Agent, target: { x: number; y: number }) {
    const desired = Vec.sub(target, agent.pos);
    const dist = Vec.length(desired);
    if (dist < 1) return;

    // arrive: 반경 내에서 감속
    const speed = dist < ARRIVE_RADIUS ? (MAX_SPEED * dist) / ARRIVE_RADIUS : MAX_SPEED;
    const norm = Vec.scaleInto({ x: 0, y: 0 }, desired, speed / dist);
    const steer = Vec.subInto({ x: 0, y: 0 }, norm, agent.vel);
    const steerLen = Vec.length(steer);
    if (steerLen > STEER_FORCE) {
      Vec.scaleInto(steer, steer, STEER_FORCE / steerLen);
    }
    Vec.addInto(agent.vel, agent.vel, steer);
  }

  function tick() {
    gfx.clear();

    for (const agent of agents) {
      steerToward(agent, pointer);

      // 최대 속도 제한
      const spd = Vec.length(agent.vel);
      if (spd > MAX_SPEED) Vec.scaleInto(agent.vel, agent.vel, MAX_SPEED / spd);

      Vec.addInto(agent.pos, agent.pos, agent.vel);

      // 화면 경계 wrapping
      if (agent.pos.x < 0) agent.pos.x += size.width;
      if (agent.pos.x > size.width) agent.pos.x -= size.width;
      if (agent.pos.y < 0) agent.pos.y += size.height;
      if (agent.pos.y > size.height) agent.pos.y -= size.height;

      // 진행 방향 각도로 삼각형 렌더링
      const angle = Angles.fromVector(agent.vel);
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const tip = { x: agent.pos.x + c * 8, y: agent.pos.y + s * 8 };
      const left = { x: agent.pos.x + (-s - c * 0.4) * 5, y: agent.pos.y + (c - s * 0.4) * 5 };
      const right = { x: agent.pos.x + (s - c * 0.4) * 5, y: agent.pos.y + (-c - s * 0.4) * 5 };

      gfx
        .moveTo(tip.x, tip.y)
        .lineTo(left.x, left.y)
        .lineTo(right.x, right.y)
        .closePath()
        .fill({ color: 0x60a5fa, alpha: 0.85 });
    }
  }

  app.ticker.add(tick);
  return () => {
    app.ticker.remove(tick);
    gfx.destroy();
  };
}
