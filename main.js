const { atan2, floor, min, PI, sin, cos } = Math;
const { innerWidth, innerHeight } = window;
const w = innerWidth;
const h = min(innerHeight, w);
const size = min(w, h);
const NUM_OF_CREATURES = floor(size / 50);

const canvas = document.getElementById("canvas");
canvas.width = w;
canvas.height = h;
const ctx = canvas.getContext("2d");

const range = (n, m = 0) =>
  Array(n)
    .fill(m)
    .map((i, j) => i + j);

const rand = (max, min = 0) => min + Math.random() * (max - min);

const map = (value, sMin, sMax, dMin, dMax) => {
  return dMin + ((value - sMin) / (sMax - sMin)) * (dMax - dMin);
};
const polar = (ang, r = 1) => [r * cos(ang), r * sin(ang)];

const colorMap = (val, dmin, dmax, colorStart, colorEnd) => {
  const color = [];
  for (let i = 0; i < 4; i++) {
    const c1 = colorStart[i];
    const c2 = colorEnd[i];
    color.push(map(val, dmin, dmax, c1, c2));
  }
  const [r, g, b, a] = color;
  return `rgba(${r}, ${g}, ${b},${a})`;
};

class Creature {
  constructor(rx, ry, ctx) {
    this.root = [rx, ry];
    this.head = [rand(w), rand(h)];
    this.phase = [rand(100), rand(100)];
    this.items = range(70).map(() => ({
      x: 0,
      y: 0,
      a: 0,
      l: size / 50
    }));
    this.ctx = ctx;
  }

  getHeadPosition(time) {
    time = time || 0;
    const [hx, hy] = this.head;
    const [phx, phy] = this.phase;
    const x = map(noise.perlin2(hx * 0.001, time + phx), -0.7, 0.7, 0, w);
    const y = map(noise.perlin2(hy * 0.001, time + phy), -0.7, 0.7, 0, h);
    return [x, y];
  }

  update(time) {
    let parent = null;
    const newItems = [];
    for (let i = 0; i < this.items.length; i++) {
      const { x, y, a, l } = this.items[i];
      let [px, py] = this.getHeadPosition(time);
      if (parent) {
        px = parent.x;
        py = parent.y;
      }
      const [dx, dy] = [px - x, py - y];
      const newAngle = atan2(dy, dx);
      const [nx, ny] = polar(newAngle, l);
      const newX = px - nx;
      const newY = py - ny;

      const temp = { x: newX, y: newY, a: newAngle, l };

      parent = temp;
      newItems.push(temp);
    }
    this.items = newItems;
    this.calcBack();
    this.draw();
  }

  draw() {
    const { ctx } = this;
    for (let i = 0; i < this.items.length; i++) {
      const { x, y, a, l } = this.items[i];
      const [dx, dy] = polar(a, l);
      ctx.beginPath();
      ctx.arc(dx + x, dy + y, map(i, 0, 70, size / 100, size / 20), 0, PI * 2);
      (ctx.fillStyle = colorMap(i, 0, 70, [83, 82, 4, 0.6], [0, 0, 0, 1])),
        ctx.fill();
      ctx.closePath();
    }
  }

  calcBack() {
    let child = null;
    const newItems = [];
    for (let i = this.items.length - 1; i >= 0; i--) {
      const { a, l } = this.items[i];
      let [cx, cy] = this.root;
      if (child) {
        cx = child.x;
        cy = child.y;
        const pa = child.a;
        const pl = child.l;
        const [nx, ny] = polar(pa, pl);
        cx += nx;
        cy += ny;
      }

      const temp = { x: cx, y: cy, a, l };
      child = temp;
      newItems.push(temp);
    }

    newItems.reverse();
    this.items = newItems;
  }
}

const creatures = range(NUM_OF_CREATURES).map(
  (i) => new Creature((w / NUM_OF_CREATURES) * i, h + size / 20, ctx)
);

const animate = (time) => {
  ctx.clearRect(0, 0, w, h);
  time *= 0.4 / size;
  for (let i = 0; i < creatures.length; i++) {
    const creature = creatures[i];
    creature.update(time);
  }
  requestAnimationFrame(animate);
};

animate();
