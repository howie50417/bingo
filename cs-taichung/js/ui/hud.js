/* ui/hud.js — HUD：動態準星/彈藥/血量/金額/計時/雷達/擊破訊息/記分板/開鏡 */
window.HUD = (function () {
  'use strict';

  var el = {};
  var radarCtx = null;
  var domAcc = 0;          // DOM 節流
  var hitT = 0;
  var msgT = 0;

  function $(id) { return document.getElementById(id); }

  function init() {
    el.crosshair = $('crosshair');
    el.hitmarker = $('hitmarker');
    el.scope = $('scope');
    el.radar = $('radar');
    el.hp = $('hp-num');
    el.armor = $('armor-num');
    el.mag = $('ammo-mag');
    el.reserve = $('ammo-reserve');
    el.weaponName = $('weapon-name');
    el.money = $('money');
    el.timer = $('timer');
    el.combo = $('combo');
    el.killfeed = $('killfeed');
    el.centerMsg = $('center-msg');
    el.challenge = $('challenge-timer');
    el.sbBody = $('sb-body');
    el.fps = $('fps');
    radarCtx = el.radar.getContext('2d');
  }

  // ---------- 準星 ----------
  function updateCrosshair() {
    var hide = Weapons.current === 'knife' || Weapons.scoped;
    el.crosshair.style.opacity = hide ? '0' : '1';
    if (hide) return;
    var spread = Weapons.spread || 0;
    var fovRad = G.camera.fov * Math.PI / 180;
    var px = Math.tan(spread) / Math.tan(fovRad / 2) * (window.innerHeight / 2);
    var gap = Math.max(4, Math.min(80, px + 4));
    el.crosshair.style.setProperty('--gap', gap + 'px');
  }

  // ---------- 雷達 ----------
  function drawRadar() {
    if (!G.radar) return;
    var ctx = radarCtx;
    var size = 180;
    var r = G.radar;
    // 雷達以玩家為中心顯示周圍 40m
    var viewM = 40;
    var srcSize = viewM * 2 * r.scale;
    var sx = 256 + (Player.pos.x - r.cx) * r.scale - srcSize / 2;
    var sy = 256 + (Player.pos.z - r.cz) * r.scale - srcSize / 2;
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(r.canvas, sx, sy, srcSize, srcSize, 0, 0, size, size);
    // 目標紅點
    ctx.fillStyle = '#ff5050';
    for (var i = 0; i < G.targets.length; i++) {
      var t = G.targets[i];
      if (!t.alive || t.down || !t.group) continue;
      var dx = (t.group.position.x - Player.pos.x) / (viewM * 2) * size + size / 2;
      var dz = (t.group.position.z - Player.pos.z) / (viewM * 2) * size + size / 2;
      if (dx < 4 || dx > size - 4 || dz < 4 || dz > size - 4) continue;
      ctx.beginPath();
      ctx.arc(dx, dz, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // 玩家箭頭（中心）
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(-Player.yaw);
    ctx.fillStyle = '#ffe9a0';
    ctx.beginPath();
    ctx.moveTo(0, -7); ctx.lineTo(5, 6); ctx.lineTo(0, 3); ctx.lineTo(-5, 6);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    // 邊框掃描線裝飾
    ctx.strokeStyle = 'rgba(120,200,160,.25)';
    ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2); ctx.stroke();
  }

  // ---------- DOM 更新（節流） ----------
  function fmtTime(s) {
    var m = Math.floor(s / 60), ss = Math.floor(s % 60);
    return (m < 10 ? '0' : '') + m + ':' + (ss < 10 ? '0' : '') + ss;
  }

  function updateDom() {
    // 彈藥
    var d = Weapons.data;
    if (d.melee) {
      el.mag.textContent = '--';
      el.reserve.textContent = '--';
      el.mag.classList.remove('low');
    } else {
      el.mag.textContent = Weapons.mag;
      el.reserve.textContent = Weapons.reserveAmmo;
      el.mag.classList.toggle('low', Weapons.mag <= Math.ceil(d.mag * 0.25));
    }
    el.weaponName.textContent = d.en + (Weapons.reloading ? ' · 換彈中' : '');
    el.money.textContent = '$' + (G.score * 10);
    el.timer.textContent = fmtTime(G.time);
    // 連擊
    if (G.combo >= 2) {
      el.combo.textContent = '連擊 x' + G.combo;
      el.combo.classList.remove('hidden');
    } else {
      el.combo.classList.add('hidden');
    }
    // 挑戰計時
    if (G.challenge.active) {
      el.challenge.classList.remove('hidden');
      el.challenge.textContent = '挑戰 ' + G.challenge.t.toFixed(2) +
        ' · ' + Range.challengeCleared() + '/' + Range.challengeTotal();
    } else {
      el.challenge.classList.add('hidden');
    }
  }

  var api = {};
  api.init = init;

  api.update = function (dt, fps) {
    if (G.state === 'menu') return;
    updateCrosshair();
    drawRadar();
    // 中央訊息計時
    if (msgT > 0) {
      msgT -= dt;
      if (msgT <= 0) el.centerMsg.classList.add('hidden');
    }
    // hitmarker 消退
    if (hitT > 0) {
      hitT -= dt;
      if (hitT <= 0) el.hitmarker.classList.remove('show', 'head');
    }
    domAcc += dt;
    if (domAcc >= 0.066) {
      domAcc = 0;
      updateDom();
      el.fps.textContent = fps + ' FPS';
    }
  };

  api.hitmarker = function (isHead) {
    el.hitmarker.classList.remove('show', 'head');
    void el.hitmarker.offsetWidth; // 強制 reflow 重啟動畫
    el.hitmarker.classList.add('show');
    if (isHead) el.hitmarker.classList.add('head');
    hitT = 0.15;
    AudioSys.play('hit');
  };

  api.killfeed = function (html) {
    var div = document.createElement('div');
    div.className = 'kf';
    div.innerHTML = html;
    el.killfeed.insertBefore(div, el.killfeed.firstChild);
    while (el.killfeed.children.length > 5) {
      el.killfeed.removeChild(el.killfeed.lastChild);
    }
    setTimeout(function () {
      div.style.transition = 'opacity .5s';
      div.style.opacity = '0';
      setTimeout(function () { if (div.parentNode) div.parentNode.removeChild(div); }, 500);
    }, 4000);
  };

  api.centerMsg = function (text, dur) {
    el.centerMsg.textContent = text;
    el.centerMsg.classList.remove('hidden');
    msgT = dur || 2;
  };

  api.setScope = function (on) {
    el.scope.classList.toggle('hidden', !on);
  };

  api.refreshRadar = function () { /* 雷達底圖由 G.radar 提供，drawRadar 每幀取用 */ };

  api.updateScoreboard = function () {
    var acc = G.stats.shots > 0 ? Math.round(G.stats.hits / G.stats.shots * 100) : 0;
    el.sbBody.innerHTML = '<table>' +
      '<tr><td>射擊次數</td><td>' + G.stats.shots + '</td></tr>' +
      '<tr><td>命中次數</td><td>' + G.stats.hits + '</td></tr>' +
      '<tr><td>命中率</td><td>' + acc + '%</td></tr>' +
      '<tr><td>爆頭次數</td><td>' + G.stats.heads + '</td></tr>' +
      '<tr><td>擊破目標</td><td>' + G.stats.kills + '</td></tr>' +
      '<tr><td>訓練分數</td><td>' + G.score + '</td></tr>' +
      '<tr><td>挑戰最佳</td><td>' + (G.challenge.best > 0 ? G.challenge.best.toFixed(2) + 's' : '--') + '</td></tr>' +
      '<tr><td>遊玩時間</td><td>' + fmtTime(G.time) + '</td></tr>' +
      '</table>';
  };

  return api;
})();
