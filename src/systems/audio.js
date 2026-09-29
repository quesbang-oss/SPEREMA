// 効果音・BGMはWeb Audioで合成。ボイスは public/voice/<key>.mp3 があれば優先、無ければ音声合成で代替。
export class Sound {
  constructor(s) { this.s = s; this.ctx = null; this.cur = null; }
  init() {
    try {
      if (!this.ctx) { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.bgm(); }
      this.ctx.resume();
    } catch { /* 音が出なくても継続 */ }
  }
  tone(f, d, type = 'square', v = .2, at = 0, bus = 'sfx', to = f) {
    if (!this.ctx) return;
    try {
      const c = this.ctx, t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(Math.max(to, 20), t + d);
      g.gain.setValueAtTime(Math.max(v * this.s[bus], .0001), t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + d);
    } catch { /* noop */ }
  }
  // ノイズ（ジャラジャラ・ガチャン系の金属音に使用）
  noise(d, v = .3, at = 0, f = 3000, bus = 'sfx') {
    if (!this.ctx) return;
    try {
      const c = this.ctx, n = (c.sampleRate * d) | 0, buf = c.createBuffer(1, n, c.sampleRate), a = buf.getChannelData(0);
      for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const src = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
      src.buffer = buf; fl.type = 'bandpass'; fl.frequency.value = f; g.gain.value = Math.max(v * this.s[bus], .0001);
      src.connect(fl).connect(g).connect(c.destination); src.start(c.currentTime + at);
    } catch { /* noop */ }
  }
  // パチンコ風の効果音
  sfx(n) {
    const T = (...a) => this.tone(...a), N = (...a) => this.noise(...a);
    ({
      bet: () => { N(.05, .5, 0, 4000); T(1200, .06, 'square', .25); T(1800, .08, 'square', .25, .06); },
      spin: () => { for (let i = 0; i < 10; i++) N(.03, .35, i * .06, 2500 + i * 80); },
      stop: () => { N(.08, .7, 0, 1200); T(180, .15, 'square', .4, 0, 'sfx', 50); },
      coin: () => { for (let i = 0; i < 6; i++) { N(.04, .4, i * .05, 5000 + Math.random() * 2000); T(2200 + Math.random() * 1200, .05, 'triangle', .15, i * .05); } },
      chance: () => [880, 1108, 1318, 1760, 2217].forEach((f, i) => T(f, .12, 'square', .2, i * .07)),
      don: () => { N(.3, .9, 0, 200); T(120, .4, 'sawtooth', .5, 0, 'sfx', 30); },
      rush: () => { T(200, 1.2, 'sawtooth', .2, 0, 'sfx', 2400); for (let i = 0; i < 12; i++) N(.03, .3, i * .1, 3000 + i * 300); },
      fanfare: () => {
        [523, 659, 784, 1047, 1319, 1047, 1319, 1568, 2093].forEach((f, i) => { T(f, .22, 'square', .2, i * .11); T(f / 2, .22, 'sawtooth', .12, i * .11); });
        for (let i = 0; i < 20; i++) N(.04, .35, .3 + i * .07, 4500 + Math.random() * 2500);
      },
      kakutei: () => {
        this.sfx('don');
        [[784, 988, 1175], [1047, 1319, 1568], [1319, 1568, 2093]].forEach((ch, i) => ch.forEach(f => T(f, .35, 'sawtooth', .16, .15 + i * .18)));
      },
      lose: () => [400, 300, 200].forEach((f, i) => T(f, .25, 'triangle', .25, i * .2, 'sfx', f * .8))
    })[n]?.();
  }
  // ノリのいいBGM（8分音符アルペジオ＋キック＋ハイハット）
  bgm() {
    const n = [523, 659, 784, 659, 523, 784, 1047, 784]; let i = 0;
    setInterval(() => {
      if (this.s.bgm > 0) {
        this.tone(n[i % 8], .12, 'square', .09, 0, 'bgm');
        if (i % 2 === 0) this.tone(110, .15, 'sine', .3, 0, 'bgm', 40);
        if (i % 4 === 2) this.noise(.05, .15, 0, 7000, 'bgm');
      }
      i++;
    }, 150);
  }
  stopVoice() { try { this.cur?.pause(); speechSynthesis.cancel(); } catch { /* noop */ } }
  voice(key, text) {
    if (!this.s.voiceOn) return;
    this.stopVoice(); // 重複再生防止
    this.tone(90, .3, 'sawtooth', .35, 0, 'voice', 60);
    try {
      const a = new Audio(import.meta.env.BASE_URL + 'voice/' + key + '.mp3');
      a.volume = Math.min(1, this.s.voice); this.cur = a;
      a.play().catch(() => this.tts(text));
    } catch { this.tts(text); }
  }
  tts(text) {
    try {
      if (!('speechSynthesis' in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text), vs = speechSynthesis.getVoices();
      u.lang = 'ja-JP'; u.pitch = 0.1; u.rate = .85; u.volume = Math.min(1, this.s.voice);
      const v = vs.find(x => x.name === this.s.voiceName) || vs.find(x => x.lang.startsWith('ja'));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch { /* noop */ }
  }
}
