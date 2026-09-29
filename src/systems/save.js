const K = 'sperema_slot_v1';
export const load = () => { try { return JSON.parse(localStorage.getItem(K)); } catch { return null; } };
export const save = d => { try { localStorage.setItem(K, JSON.stringify(d)); } catch { /* 保存不可でも継続 */ } };
