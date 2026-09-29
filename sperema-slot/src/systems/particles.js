// コイン・球のパーティクル。最大数に上限あり、寿命で自動破棄、空になればループ停止。
export class Particles {
  constructor(c, s) { this.c = c; this.g = c.getContext('2d'); this.s = s; this.p = []; this.run = false; this.rs(); addEventListener('resize', () => this.rs()); }
  rs() { this.c.width = innerWidth; this.c.height = innerHeight; }
  emit(n, kind, o = {}) {
    const W = innerWidth, H = innerHeight, max = this.s.lite ? 80 : 300;
    n = Math.round(n * this.s.coinAmt * (this.s.lite ? .4 : 1));
    for (let i = 0; i < n && this.p.length < max; i++) {
      const a = o.dir === undefined ? Math.random() * 6.283 : o.dir + (Math.random() - .5) * (o.spread || 1), v = (o.speed || 8) * (.4 + Math.random());
      let x = (o.x ?? .5) * W, y = (o.y ?? .5) * H, vx = Math.cos(a) * v, vy = Math.sin(a) * v;
      if (o.gather) { const r = Math.min(W, H) * .6, b = Math.random() * 6.283; x = W / 2 + Math.cos(b) * r; y = H / 2 + Math.sin(b) * r; vx = -Math.cos(b) * r / 45; vy = -Math.sin(b) * r / 45; }
      this.p.push({ x, y, vx, vy, g: o.g ?? .25, r: 5 + Math.random() * 7, l: o.gather ? 45 : 80 + Math.random() * 60, k: kind === 'mix' ? ['coin', 'ball', 'gold'][i % 3] : kind });
    }
    if (!this.run && this.p.length) { this.run = true; requestAnimationFrame(() => this.tick()); }
  }
  gather(n) { this.emit(n, 'ball', { gather: 1, g: 0 }); }
  tick() {
    const g = this.g; g.clearRect(0, 0, this.c.width, this.c.height);
    this.p = this.p.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.l--;
      if (p.l <= 0 || p.y > innerHeight + 30) return false;
      g.globalAlpha = Math.min(1, p.l / 20); g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283);
      g.fillStyle = p.k === 'ball' ? '#fff' : p.k === 'gold' ? '#ffd34d' : '#cfd6e0'; g.fill();
      if (p.k !== 'ball') { g.lineWidth = 2; g.strokeStyle = p.k === 'gold' ? '#a87a00' : '#8a94a6'; g.stroke(); }
      return true;
    });
    g.globalAlpha = 1;
    if (this.p.length) requestAnimationFrame(() => this.tick()); else { this.run = false; g.clearRect(0, 0, this.c.width, this.c.height); }
  }
}
