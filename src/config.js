// ===== 設定ファイル：確率・払い出し・演出ウェイト =====
export const CONFIG = {
  startCoins: 1000,
  bets: [10, 20, 50, 100],
  // 払い出し倍率（BET額 × 倍率）
  // 当たり種別ごとの倍率テーブル [倍率, ウェイト]。当たった時にウェイトで倍率を抽選（払い出し=BET額×倍率）
  payout: {
    normal: [[2, 50], [3, 25], [5, 15], [8, 7], [10, 3]],
    big: [[10, 40], [20, 25], [50, 20], [100, 10], [200, 5]],
    super: [[100, 40], [300, 25], [500, 20], [1000, 10], [2000, 5]],
    premium: [[1000, 35], [3000, 25], [5000, 20], [10000, 15], [30000, 4], [100000, 1]]
  },
  // 1ゲームあたりの当たり確率。比較対象機種の公表確率は未確認のため、独自の初期値（合計約13%）を使用。
  odds: { normal: 0.08, big: 0.035, super: 0.012, premium: 0.004 },
  labels: { normal: '受精成功！', big: '着床！大当たり', super: '双子！超大当たり', premium: '大家族！プレミアム' },
  // 当たり時に揃う図柄
  tierSymbols: { normal: ['ball', 'coin', 'heart'], big: ['seven', 'char'], super: ['rainbow'], premium: ['premium'] },
  // 図柄（画像に差し替える場合はここを変更）
  symbols: { seven: '7', coin: '🪙', ball: '⚪', char: '🐟', heart: '💗', rainbow: '🌈', premium: '👑' },
  // 演出の出現ウェイト（抽選結果ごと）。確定系(kakutei/premium)は当たり時のみ設定されている。
  effects: {
    normal: { yokoku: 5, reach: 3, roulette: 2, cutin: 2, story: 1.5 },
    big: { yokoku: 2, reach: 3, gekiatsu: 3, three: 3, roulette: 2, cutin: 2, battle: 2, story: 2, countdown: 2 },
    super: { gekiatsu: 3, three: 4, kakutei: 3, battle: 2, story: 2, countdown: 2, roulette: 1 },
    premium: { premium: 1 },
    lose: { yokoku: 6, reach: 3, gekiatsu: 1.5, three: 1.2, roulette: 2, cutin: 2, battle: 2, story: 2, countdown: 2 }
  },
  // 当たり時のコイン演出 [数, 種類, 広がり]
  burst: { normal: [40, 'coin', 1.5], big: [120, 'mix', 3], super: [180, 'mix', 6.28], premium: [260, 'mix', 6.28] }
};
