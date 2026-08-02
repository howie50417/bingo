/* config.js — 全域共享狀態 G、常數 CFG、武器數據 WEAPON_DATA（CS 風參數） */
(function () {
  'use strict';

  window.G = {
    renderer: null, scene: null, camera: null, canvas: null,
    colliders: [],      // THREE.Box3 靜態碰撞盒（世界座標）
    worldMeshes: [],    // 可產生彈孔的網格
    targets: [],        // Range 註冊的目標
    state: 'menu',      // 'menu' | 'playing' | 'paused'
    score: 0, combo: 0, comboT: 0,
    stats: { shots: 0, hits: 0, heads: 0, kills: 0 },
    settings: { sens: 1.0, vol: 0.8, quality: 'high', invertY: false },
    time: 0,
    challenge: { active: false, t: 0, best: 0 },
    radar: null,        // City 填入 {canvas, scale, cx, cz}
    sunLight: null,     // City 填入 DirectionalLight
  };

  // 讀取持久化設定
  try {
    var saved = JSON.parse(localStorage.getItem('cst_settings') || 'null');
    if (saved) Object.assign(G.settings, saved);
    G.challenge.best = parseFloat(localStorage.getItem('cst_best') || '0') || 0;
  } catch (e) { /* file:// 下 localStorage 可能受限，忽略 */ }

  window.CFG = {
    EYE_STAND: 1.62,
    EYE_CROUCH: 1.05,
    GRAVITY: 22,
    WALK: 4.4,
    SPRINT: 6.8,
    CROUCH_SPEED: 2.2,
    JUMP: 7.2,
    PLAYER_RADIUS: 0.35,
    BOUNDS: { minX: -88, maxX: 88, minZ: -88, maxZ: 88 },
  };

  // 武器數據（參考 CS:GO）
  window.WEAPON_DATA = {
    knife: {
      slot: 1, name: '小刀', en: 'KNIFE', melee: true,
      damage: 40, heavyDamage: 65, rate: 0.42, heavyRate: 1.0, range: 2.4, price: 0,
    },
    pistol: {
      slot: 2, name: '格洛克 18', en: 'GLOCK-18',
      damage: 30, headMult: 4, rpm: 400, mag: 20, reserve: 120, reload: 2.2, auto: false,
      spreadBase: 0.010, spreadMove: 0.020, bloom: 0.006, recoil: 0.011, price: 400,
    },
    rifle: {
      slot: 3, name: 'AK-47', en: 'AK-47',
      damage: 36, headMult: 4, rpm: 600, mag: 30, reserve: 90, reload: 2.5, auto: true,
      spreadBase: 0.012, spreadMove: 0.030, bloom: 0.010, recoil: 0.020, price: 2700,
    },
    sniper: {
      slot: 4, name: 'AWP', en: 'AWP',
      damage: 115, headMult: 4, rpm: 41, mag: 10, reserve: 30, reload: 3.2, auto: false,
      bolt: 1.45, spreadBase: 0.001, spreadMove: 0.05, bloom: 0, recoil: 0.06,
      zoom: [2.25, 6], price: 4750,
    },
  };

  // 武器切換順序（滾輪 / Q）
  window.WEAPON_ORDER = ['knife', 'pistol', 'rifle', 'sniper'];
})();
