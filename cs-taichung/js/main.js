/* main.js — 遊戲主控：初始化、主迴圈、狀態機、計分、計時挑戰 */
window.Game = (function () {
  'use strict';

  var clock = null, rayTmp = null;
  var fpsAcc = 0, fpsCnt = 0, fpsShow = 60;

  function init() {
    // renderer
    var renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    document.getElementById('app').appendChild(renderer.domElement);

    G.renderer = renderer;
    G.canvas = renderer.domElement;
    G.scene = new THREE.Scene();
    G.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 800);
    G.scene.add(G.camera); // 掛 view model 用

    window.addEventListener('resize', onResize);

    Input.init(G.canvas);
    FX.init(G.scene);
    City.build();
    Props.build();
    Range.build();
    Player.init(G.camera);
    ViewModels.buildAll(G.camera);
    Weapons.init(G.camera, G.scene);
    HUD.init();
    HUD.refreshRadar();
    Menu.init();
    Menu.show('main');
    applyQuality();

    document.getElementById('loading').classList.add('hidden');
    clock = new THREE.Clock();
    rayTmp = new THREE.Raycaster();
    renderer.setAnimationLoop(tick);
  }

  function onResize() {
    G.camera.aspect = window.innerWidth / window.innerHeight;
    G.camera.updateProjectionMatrix();
    G.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function applyQuality() {
    var high = G.settings.quality !== 'low';
    G.renderer.shadowMap.enabled = high;
    if (G.sunLight) G.sunLight.castShadow = high;
    G.renderer.setPixelRatio(high ? Math.min(window.devicePixelRatio, 2) : 1);
    G.scene.traverse(function (o) { if (o.material) o.material.needsUpdate = true; });
  }

  // ---------- 狀態 ----------
  var api = {};

  api.start = function () {
    G.state = 'playing';
    Menu.show(null);
    document.getElementById('hud').classList.remove('hidden');
    AudioSys.unlock();
    AudioSys.ambience();
    Input.requestLock();
  };

  api.pause = function () {
    if (G.state !== 'playing') return;
    G.state = 'paused';
    Menu.show('pause');
    Input.exitLock();
  };

  api.resume = function () {
    G.state = 'playing';
    Menu.show(null);
    Input.requestLock();
  };

  api.quitToMenu = function () {
    G.state = 'menu';
    Menu.show('main');
    document.getElementById('hud').classList.add('hidden');
    Input.exitLock();
  };

  api.applySettings = function () {
    AudioSys.setVolume(G.settings.vol);
    applyQuality();
    try { localStorage.setItem('cst_settings', JSON.stringify(G.settings)); } catch (e) {}
  };

  api.resetTargets = function () {
    Range.resetAll();
    HUD.centerMsg('目標已重置', 1.2);
  };

  api.resetStats = function () {
    G.score = 0; G.combo = 0; G.comboT = 0; G.time = 0;
    G.stats = { shots: 0, hits: 0, heads: 0, kills: 0 };
  };

  // ---------- 計分 ----------
  api.addScore = function (info) {
    G.combo = (G.comboT > 0) ? G.combo + 1 : 1;
    G.comboT = 3;
    var mult = 1 + 0.1 * (G.combo - 1);
    var pts = Math.round(info.points * mult);
    G.score += pts;
    G.stats.hits++;
    if (info.head) G.stats.heads++;
    if (info.killed !== false) G.stats.kills++;
    var label = info.head ? '<span class="hs">爆頭</span> ' : '';
    HUD.killfeed('<b>' + info.name + '</b> ' + label + '<span class="pts">+' + pts + '</span>');
    HUD.hitmarker(info.head);
    AudioSys.play(info.head ? 'headshot' : 'score');
  };

  // 非擊破的命中（紙靶擦過等）
  api.addHit = function (head) {
    G.stats.hits++;
    if (head) G.stats.heads++;
    HUD.hitmarker(head);
  };

  // ---------- 計時挑戰 ----------
  api.startChallenge = function () {
    Range.resetAll();
    G.challenge.active = true;
    G.challenge.t = 0;
    HUD.centerMsg('計時挑戰開始！清除所有目標', 2);
    AudioSys.play('click');
  };

  function endChallenge() {
    G.challenge.active = false;
    var t = G.challenge.t;
    var msg = '挑戰完成 ' + t.toFixed(2) + ' 秒';
    if (G.challenge.best === 0 || t < G.challenge.best) {
      G.challenge.best = t;
      try { localStorage.setItem('cst_best', String(t)); } catch (e) {}
      msg += ' — 新紀錄！';
    }
    HUD.centerMsg(msg, 4);
    AudioSys.play('win');
  }

  // ---------- 主迴圈 ----------
  function tick() {
    var dt = Math.min(clock.getDelta(), 0.05);
    var playing = G.state === 'playing';

    // FPS
    fpsAcc += dt; fpsCnt++;
    if (fpsAcc >= 0.5) {
      fpsShow = Math.round(fpsCnt / fpsAcc);
      fpsAcc = 0; fpsCnt = 0;
    }

    if (playing) {
      G.time += dt;
      if (G.comboT > 0) { G.comboT -= dt; if (G.comboT <= 0) G.combo = 0; }

      Player.update(dt);
      Weapons.update(dt);
      Range.update(dt);

      // 挑戰計時
      if (G.challenge.active) {
        G.challenge.t += dt;
        if (Range.challengeCleared() >= Range.challengeTotal()) endChallenge();
      }
      // 快捷鍵
      if (Input.pressed('KeyT')) api.startChallenge();
      if (Input.pressed('KeyB')) api.resetTargets();
    }

    FX.update(dt, G.camera);
    HUD.update(dt, fpsShow);

    // Tab 記分板
    var sb = Input.key('Tab') && playing;
    document.getElementById('scoreboard').classList.toggle('hidden', !sb);
    if (sb) HUD.updateScoreboard();

    G.renderer.render(G.scene, G.camera);
    Input.endFrame();
  }

  window.addEventListener('DOMContentLoaded', init);
  return api;
})();
