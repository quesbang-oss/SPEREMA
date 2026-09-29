import { CONFIG as C } from '../config.js';
const rnd = a => a[Math.floor(Math.random() * a.length)];
// ウェイト抽選。直前と同じ演出は出にくくする
function pick(w, hist) {
  const e = Object.entries(w).map(([k, v]) => [k, hist[hist.length - 1] === k ? v * 0.3 : v]);
  let r = Math.random() * e.reduce((a, b) => a + b[1], 0);
  for (const [k, v] of e) if ((r -= v) < 0) return k;
  return e[0][0];
}
// 倍率テーブルからウェイト抽選
function pickMult(t) {
  const e = C.payout[t]; let r = Math.random() * e.reduce((a, b) => a + b[1], 0);
  for (const [m, w] of e) if ((r -= w) < 0) return m;
  return e[0][0];
}
/** 抽選：結果(tier)・停止図柄・演出・3段階ルートを演出より先に確定する */
export function draw(hist) {
  const r = Math.random(); let acc = 0, tier = null;
  for (const t of ['premium', 'super', 'big', 'normal']) { acc += C.odds[t]; if (r < acc) { tier = t; break; } }
  const keys = Object.keys(C.symbols), mult = tier ? pickMult(tier) : 0;
  let effect = pick(C.effects[tier || 'lose'], hist);
  if (tier && mult >= 1000 && (mult >= 10000 || Math.random() < .5)) effect = 'mega'; // 高倍率は専用演出
  let symbols;
  if (tier) { const s = rnd(C.tierSymbols[tier]); symbols = [s, s, s]; }
  else if (effect === 'reach') { const a = rnd(keys); symbols = [a, a, rnd(keys.filter(k => k !== a))]; }
  else {
    symbols = [0, 0, 0].map(() => rnd(keys));
    if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) symbols[2] = rnd(keys.filter(k => k !== symbols[0]));
  }
  // 3段階演出のルート：当たり=最終段階まで／ハズレ=途中終了 or 最終段階でハズレ
  let route = null;
  if (effect === 'three') route = tier ? { end: 's3' } : { end: rnd(['fall', 's2', 's3', 's3']) };
  return { tier, mult, symbols, effect, route };
}
