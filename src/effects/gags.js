// ===== 下ネタ・ダジャレ演出データ（ここに足すだけで演出が増える）=====
// 予告: t=テロップ / cls=文字スタイル / bg=背景 / sfx=効果音 / fx=パーティクル(gather|ball|coin|mix) / shake=揺れ
const y = (t, o = {}) => ({ t, ...o });
export const GAGS = {
  yokoku: [
    y('泳げ！精子くん！', { fx: 'ball', sfx: 'chance' }),
    y('ゴールは卵子ちゃん！', { fx: 'gather', sfx: 'chance' }),
    y('尻尾フリフリ全開！', { fx: 'ball' }),
    y('数億匹スタンバイ！', { fx: 'mix', sfx: 'rush', bg: 'pink' }),
    y('保健体育の時間です', { bg: 'blue', sfx: 'chance' }),
    y('性教育、始まります', { bg: 'pink', sfx: 'chance' }),
    y('白い球が止まらない！', { fx: 'ball', sfx: 'rush' }),
    y('遺伝子が騒いでる…', { sfx: 'don', shake: 1 }),
    y('ムラムラ…いやワクワク！', { bg: 'pink', sfx: 'chance' }),
    y('賢者タイム…（早いよ）', { bg: 'mono', sfx: 'lose' }),
    y('コウノトリ出動準備！', { fx: 'coin', sfx: 'chance' }),
    y('いきなりクライマックス！', { bg: 'rainbow', sfx: 'rush', shake: 1 }),
    y('暴発注意！！', { sfx: 'don', shake: 1, bg: 'dark' }),
    y('早すぎたか？（何が）', { sfx: 'lose' }),
    y('「ちょっとだけ」は信じるな', { bg: 'dark', sfx: 'don' }),
    y('出るか！？ 出ないか！？', { sfx: 'rush', shake: 1 }),
    y('ティッシュ準備よし？', { bg: 'silver', sfx: 'chance' }),
    y('保健室の先生、登場！', { fx: 'coin', sfx: 'chance' }),
    y('生命の神秘、発動！', { bg: 'rainbow', fx: 'mix', sfx: 'rush' }),
    y('皮をかぶったまま突撃！', { sfx: 'don', shake: 1 }),
    y('スタミナ切れ寸前…', { bg: 'mono', sfx: 'lose' }),
    y('ドクドクと脈打つ予感！', { bg: 'pink', sfx: 'rush', shake: 1 }),
    y('避妊は計画的に！', { bg: 'blue', sfx: 'chance' }),
    y('パパになる覚悟はあるか', { bg: 'dark', sfx: 'don' }),
    y('ピュッと一発、夢いっぱい', { fx: 'ball', sfx: 'rush' })
  ],
  reach: ['ゴール前リーチ！', '卵子ゾーン侵入リーチ！', 'あと1匹リーチ！', '着床目前リーチ！', '先っぽ入ったリーチ！', '合体直前リーチ！'],
  count: ['あと3cm…', 'あと2cm…', 'あと1cm…！！'],
  hit: ['ゴールイン！', 'ズブリと命中！', '見事に到達！', '入っちゃった！！'],
  miss: ['ドビュッ…と外れた', '惜しい…空振り', '不発…', '途中で力尽きた…', 'ゴム越しだった…'],
  geki: [['発射準備OK！', '発射ーッ！'], ['スタンバイ完了！', '出撃ーッ！'], ['暴発寸前！', 'どっぴゅーん！'], ['我慢の限界！', '解き放てーッ！'], ['カウパー全開！', 'いっけぇぇぇ！']],
  kakutei: ['受精確定！', '着床確定！', 'ご懐妊確定！', 'パパ確定！', '種付け完了！'],
  premium: ['全員ゴールイン！！', '双子どころか大家族！', '6億匹の大合唱！', '人類誕生の瞬間！']
};
