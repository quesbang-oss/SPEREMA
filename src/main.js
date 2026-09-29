import './styles/style.css';
import { CONFIG as C } from './config.js';
import { draw } from './systems/lottery.js';
import { Sound } from './systems/audio.js';
import { Particles } from './systems/particles.js';
import { load, save } from './systems/save.js';

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const wait = ms => new Promise(r => setTimeout(r, ms));
const rnd = a => a[Math.floor(Math.random() * a.length)];
const DEF = { bgm: .3, sfx: .7, voice: 1, voiceOn: true, lite: false, autoOk: true, coinAmt: 1, bet: 10, showStats: true, voiceName: '' };
const ZERO = { spins: 0, bet: 0, won: 0, max: 0 };
const sv = load() || {};
const st = { coins: sv.coins ?? C.startCoins, stats: { ...ZERO, ...sv.stats }, set: { ...DEF, ...sv.set } };
const snd = new Sound(st.set), fx = new Particles($('#fx'), st.set);
const S = C.symbols, KEYS = Object.keys(S), reelEl = $$('.reel span'), spin = [false, false, false];
let phase = 'idle', round = null, auto = false, hist = [], slow = 70, freeze = false, lastY = -1;

// 進行中・演出中は保存しない（idle / over のみ）
const persist = () => { if (phase === 'idle' || phase === 'over') save({ coins: st.coins, stats: st.stats, set: st.set }); };

function render() {
  const idle = phase === 'idle';
  $('#coins').textContent = st.coins.toLocaleString();
  if (idle && st.set.bet > st.coins) { const ok = C.bets.filter(b => b <= st.coins); if (ok.length) st.set.bet = ok[ok.length - 1]; }
  $('#bets').innerHTML = C.bets.map(b => `<button data-b="${b}" class="${b === st.set.bet ? 'on' : ''}" ${(!idle || b > st.coins) ? 'disabled' : ''}>${b}</button>`).join('');
  $('#start').disabled = !idle || st.coins < st.set.bet;
  $$('.stop').forEach((b, i) => b.disabled = !(phase === 'stopping' && spin[i]));
  $('#auto').classList.toggle('on', auto); $('#auto').disabled = !st.set.autoOk;
  const s = st.stats; $('#stats').hidden = !st.set.showStats;
  $('#stats').textContent = `回転${s.spins} / BET${s.bet} / 獲得${s.won} / 最大${s.max}`;
}

// ===== 演出ヘルパー =====
async function telop(t, cls = '', ms = 1200) { const e = $('#telop'); e.textContent = t; e.className = 'show ' + cls; await wait(ms); e.className = ''; }
const bg = c => { document.body.dataset.bg = c; };
const flash = (n = 3) => { const b = document.body; let i = 0; const t = setInterval(() => { b.classList.toggle('flash'); if (++i > n * 2) { clearInterval(t); b.classList.remove('flash'); } }, 90); };
const shake = (ms = 600) => { const c = $('#cab'); c.classList.add('shake'); setTimeout(() => c.classList.remove('shake'), ms); };

// ===== 演出データ（追加は関数を足すだけ）=====
const yokokuList = [
  async () => { fx.emit(14, 'ball', { x: 0, y: .3 + Math.random() * .4, dir: 0, spread: .2, speed: 9, g: 0 }); await wait(1100); },
  async () => { $('#reels').classList.add('glow'); await wait(900); $('#reels').classList.remove('glow'); },
  async () => { bg('silver'); await wait(1000); },
  async () => { await telop('🐟 登場！', 'small', 1000); },
  async () => { fx.emit(10, 'coin', { x: .1, y: 0, dir: 1.57, spread: .6, speed: 3 }); fx.emit(10, 'coin', { x: .9, y: 0, dir: 1.57, spread: .6, speed: 3 }); await wait(1100); },
  async () => { snd.sfx('chance'); fx.gather(30); await telop('ゴールまであと少し！', 'small', 1200); },
  async () => { snd.sfx('chance'); fx.emit(40, 'ball', { x: 0, y: .5, dir: 0, spread: .8, speed: 10, g: 0 }); await telop('🐟🐟🐟 大量発生！', 'small', 1200); },
  async () => { snd.sfx('rush'); bg('pink'); await telop('受精チャンス！', 'big', 1300); },
  async () => { snd.sfx('don'); shake(400); flash(2); await telop('先頭集団、突入！', 'small', 1200); },
  async () => { bg('rainbow'); snd.sfx('chance'); await telop('虹色ゾーン！', 'small', 1200); }
];
const EFFECTS = {
  async yokoku() { let i; do { i = Math.floor(Math.random() * yokokuList.length); } while (i === lastY); lastY = i; await yokokuList[i](); if (Math.random() < .5) await yokokuList[(i + 1) % yokokuList.length](); },
  async reach(r) {
    bg('rainbow'); slow = 160; snd.sfx('don'); shake(500); await telop('ゴール前リーチ！', 'shout', 1000);
    for (const n of [3, 2, 1]) { snd.sfx('chance'); await telop('ラストスパート ' + n, 'big', 550); }
    await telop(r.tier ? 'いける！ゴールイン！' : '惜しい…力尽きた', '', 700);
  },
  async gekiatsu(r) {
    bg('rainbow'); fx.gather(60); snd.sfx('rush'); await telop('発射準備OK！', 'big', 1100);
    snd.sfx('don'); flash(4); shake(1200); snd.voice('gekiatsu', '激アツ！');
    await telop('激アツ！', 'shout', 1500);
    if (!r.tier) await telop('…', 'small', 600);
  },
  async kakutei() {
    bg('rainbow'); snd.sfx('rush'); flash(5); fx.emit(80, 'mix'); await telop('🌈7', 'big', 800); snd.sfx('kakutei'); shake(1000);
    snd.voice('kakutei', '大当たり確定！'); await telop('大当たり確定！', 'shout', 1500);
  },
  async premium() {
    bg('rainbow'); snd.voice('premium', 'プレミアム！'); snd.sfx('rush'); flash(8); fx.emit(120, 'mix'); shake(1500);
    await telop('👑 PREMIUM 👑', 'shout', 1200); snd.sfx('kakutei'); fx.emit(120, 'mix'); await telop('全員ゴールイン！！', 'shout', 1300);
  },
  // 看板演出：3段階連続演出
  async three(r) {
    const win = !!r.tier, end = r.route.end;
    bg('dark'); slow = 200; snd.sfx('rush'); fx.gather(50); shake(900);
    await telop('Uのinに出そう...？', 'big', 1500);
    snd.sfx('don'); flash(3); snd.voice('question', '疑問形！'); await telop('疑問形！', 'shout', 1200);
    if (end === 'fall') { bg(''); await telop('…？', 'small', 600); return; }
    if (win) { bg('rainbow'); snd.sfx('chance'); flash(4); fx.emit(60, 'mix'); await telop('Uのinに出た...', 'big', 1400); }
    else { bg('pink'); await telop('Uのoutに出そう...', 'big', 1400); }
    snd.sfx('don'); shake(600); snd.voice('past', '過去形！'); await telop('過去形！', 'shout', 1200);
    if (end === 's2') return;
    if (win) {
      bg('rainbow'); snd.sfx('rush'); shake(2000); flash(8); fx.emit(250, 'mix');
      await telop('Uのinに出てるぅぅぅ！', 'big', 1500);
      snd.voice('now', '現在進行形いいいいい！'); await telop('現在進行形いいいいい！', 'shout', 2000);
      snd.sfx('kakutei'); fx.emit(250, 'mix'); await telop('受精成功！！ 🎉', 'shout', 1500);
    } else {
      bg('mono'); freeze = true; snd.sfx('lose'); await telop('Uのoutにドビュッシー...', 'big', 1800);
    }
  }
};
async function playEffect(r) {
  try { await EFFECTS[r.effect](r); } catch (e) { console.error(e); }
  bg(''); slow = 70; freeze = false;
}

// ===== リール =====
function spinAll() {
  snd.sfx('spin');
  [0, 1, 2].forEach(i => {
    spin[i] = true; reelEl[i].parentElement.classList.add('spin');
    (function loop() { if (!spin[i]) return; if (!freeze) reelEl[i].textContent = S[rnd(KEYS)]; setTimeout(loop, slow); })();
  });
}
function stopReel(i) {
  if (phase !== 'stopping' || !spin[i]) return;
  spin[i] = false; const box = reelEl[i].parentElement;
  box.classList.remove('spin'); reelEl[i].textContent = S[round.res.symbols[i]];
  box.classList.add('bump'); setTimeout(() => box.classList.remove('bump'), 300);
  snd.sfx('stop'); navigator.vibrate?.(30); shake(150); render();
  if (!spin.some(Boolean)) settle();
}

// ===== ゲーム進行 =====
async function start() {
  if (phase !== 'idle' || st.coins <= 0 || st.set.bet > st.coins) return;
  snd.init();
  const bet = st.set.bet;
  st.coins -= bet; st.stats.spins++; st.stats.bet += bet; phase = 'busy';
  round = { bet, res: draw(hist), paid: false }; // 抽選結果を先に確定
  hist.push(round.res.effect); if (hist.length > 5) hist.shift();
  snd.sfx('bet'); fx.emit(6, 'coin', { x: .5, y: .6, dir: 1.57, spread: .4, speed: 4 });
  render(); spinAll();
  await wait(700);
  await playEffect(round.res);
  phase = 'stopping'; render();
  if (auto) [0, 1, 2].forEach((i, k) => setTimeout(() => stopReel(i), 300 + k * 350));
}
async function settle() {
  phase = 'settle'; render();
  const r = round.res;
  if (r.tier && !round.paid) { // 払い出しは1回のみ
    round.paid = true;
    const pay = round.bet * C.payout[r.tier];
    st.coins += pay; st.stats.won += pay; st.stats.max = Math.max(st.stats.max, pay);
    snd.sfx('fanfare'); flash(r.tier === 'premium' ? 10 : r.tier === 'normal' ? 2 : 5);
    if (!['kakutei', 'three', 'premium'].includes(r.effect)) snd.voice('jackpot', '大当たり！');
    for (let i = 0; i < 14; i++) setTimeout(() => snd.sfx('coin'), 300 + i * 150);
    const B = C.burst[r.tier]; fx.emit(B[0], B[1], { y: .55, dir: -1.57, spread: B[2], speed: 11 });
    render(); if (r.tier !== 'normal') bg('rainbow'); await telop(`${C.labels[r.tier]} +${pay}枚`, 'win', 2300);
  } else { snd.sfx('lose'); if (Math.random() < .6) snd.voice('lose', 'ハズレ！'); await wait(600); }
  round = null; phase = 'idle'; bg('');
  if (st.coins <= 0) return gameOver();
  persist(); render();
  if (auto) setTimeout(() => { if (auto) start(); }, 500);
}
function gameOver() {
  phase = 'over'; auto = false; const s = st.stats;
  $('#over').innerHTML = `<div class="box"><h2 class="go">GAME OVER</h2>
   <p>最終所持金：${st.coins}枚</p><p>総回転数：${s.spins}</p><p>総BET枚数：${s.bet}</p><p>総獲得枚数：${s.won}</p><p>最大払い出し枚数：${s.max}</p>
   <label class="row">統計もリセットする<input type="checkbox" id="rs"></label><button id="retry">リトライ</button></div>`;
  $('#over').hidden = false; snd.sfx('lose'); persist(); render();
}
$('#over').onclick = e => {
  if (e.target.id !== 'retry') return;
  st.coins = C.startCoins; if ($('#rs').checked) st.stats = { ...ZERO };
  phase = 'idle'; $('#over').hidden = true; persist(); render();
};

// ===== 設定 =====
function fillVoices() {
  const sel = $('#vn'); if (!sel || !window.speechSynthesis) return;
  const vs = speechSynthesis.getVoices().filter(v => v.lang.startsWith('ja'));
  sel.innerHTML = '<option value="">自動</option>' + vs.map(v => `<option ${v.name === st.set.voiceName ? 'selected' : ''}>${v.name}</option>`).join('');
}
function openSet() {
  const s = st.set, o = $('#set');
  o.innerHTML = `<div class="box"><h2>設定</h2>
  ${[['bgm', 'BGM音量'], ['sfx', '効果音音量'], ['voice', 'ボイス音量']].map(([k, l]) => `<label>${l}<input type="range" min="0" max="1" step=".05" data-k="${k}" value="${s[k]}"></label>`).join('')}
  ${[['voiceOn', 'ボイス有効'], ['lite', '演出軽量化モード'], ['autoOk', 'オートプレイ有効'], ['showStats', '統計表示']].map(([k, l]) => `<label class="row">${l}<input type="checkbox" data-k="${k}" ${s[k] ? 'checked' : ''}></label>`).join('')}
  <label>コイン演出量<select data-k="coinAmt">${[.5, 1, 1.5].map(v => `<option value="${v}" ${v === s.coinAmt ? 'selected' : ''}>${v}x</option>`).join('')}</select></label>
  <label>BET額<select data-k="bet">${C.bets.map(v => `<option value="${v}" ${v === s.bet ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
  <label>ボイス選択<select data-k="voiceName" id="vn"></select></label>
  <button id="sclose">閉じる</button></div>`;
  o.hidden = false; fillVoices();
}
$('#set').oninput = e => {
  const t = e.target, k = t.dataset.k; if (!k) return;
  const v = t.type === 'checkbox' ? t.checked : (t.type === 'range' || (t.tagName === 'SELECT' && k !== 'voiceName')) ? +t.value : t.value;
  if (k === 'bet' && (phase !== 'idle' || v > st.coins)) { t.value = st.set.bet; return; }
  st.set[k] = v; if (k === 'autoOk' && !v) auto = false;
  render(); persist();
};
$('#set').onclick = e => { if (e.target.id === 'sclose') { $('#set').hidden = true; persist(); } };
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = fillVoices;

// ===== 入力 =====
$('#bets').onclick = e => { const b = e.target.closest('button'); if (b && phase === 'idle') { st.set.bet = +b.dataset.b; snd.init(); render(); persist(); } };
$('#start').onclick = start;
$$('.stop').forEach(b => { b.onclick = () => stopReel(+b.dataset.i); });
$('#auto').onclick = () => { snd.init(); auto = !auto && st.set.autoOk; render(); if (auto && phase === 'idle') start(); };
$('#gear').onclick = openSet;
addEventListener('keydown', e => {
  if (e.repeat || !$('#set').hidden || !$('#over').hidden) return;
  const k = e.key.toLowerCase();
  if (e.code === 'Space') { e.preventDefault(); start(); }
  else if (k === 'z') stopReel(0); else if (k === 'x') stopReel(1); else if (k === 'c') stopReel(2);
  else if (k === 'a') $('#auto').click();
});
['seven', 'char', 'coin'].forEach((k, i) => { reelEl[i].textContent = S[k]; });
if (st.coins <= 0) gameOver(); else render();
