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
  sfx(n) {
    const T = (...a) => this.tone(...a);
    ({
      bet: () => { T(880, .08); T(1320, .1, 'square', .2, .08); },
      spin: () => T(120, .6, 'sawtooth', .1, 0, 'sfx', 300),
      stop: () => T(200, .12, 'square', .3, 0, 'sfx', 60),
      coin: () => { T(1800, .08, 'triangle'); T(2400, .1, 'triangle', .2, .06); },
      fanfare: () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => T(f, .25, 'square', .2, i * .14)),
      kakutei: () => [784, 988, 1175, 1568].forEach((f, i) => T(f, .3, 'sawtooth', .2, i * .1)),
      lose: () => T(220, .4, 'sawtooth', .2, 0, 'sfx', 80)
    })[n]?.();
  }
  bgm() {
    const n = [261, 329, 392, 523, 392, 329, 440, 523]; let i = 0;
    setInterval(() => { if (this.s.bgm > 0) this.tone(n[i++ % 8], .3, 'triangle', .12, 0, 'bgm'); }, 260);
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
