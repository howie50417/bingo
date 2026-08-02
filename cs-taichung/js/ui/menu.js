/* ui/menu.js — 主選單 / 暫停 / 操作說明 / 設定 */
window.Menu = (function () {
  'use strict';

  var current = 'main';      // 目前畫面
  var settingsFrom = 'main'; // 設定頁返回目標

  function $(id) { return document.getElementById(id); }

  function showOnly(id) {
    ['menu', 'pause', 'help-panel', 'settings'].forEach(function (m) {
      $(m).classList.toggle('hidden', m !== id);
    });
  }

  function bind(id, fn) {
    $(id).addEventListener('click', function () {
      AudioSys.unlock();
      AudioSys.play('click');
      fn();
    });
  }

  function init() {
    bind('btn-start', function () { Game.start(); });
    bind('btn-help', function () { current = 'help'; showOnly('help-panel'); });
    bind('btn-help-back', function () { showOnly(current === 'help' ? 'menu' : current); current = 'main'; showOnly('menu'); });
    bind('btn-settings', function () { settingsFrom = 'main'; showOnly('settings'); });
    bind('btn-resume', function () { Game.resume(); });
    bind('btn-reset', function () { Game.resetTargets(); Game.resume(); });
    bind('btn-pause-settings', function () { settingsFrom = 'pause'; showOnly('settings'); });
    bind('btn-quit', function () { Game.quitToMenu(); });
    bind('btn-settings-back', function () {
      if (settingsFrom === 'pause') showOnly('pause');
      else showOnly('menu');
    });

    // 設定控制
    var sens = $('set-sens'), vol = $('set-vol'), qual = $('set-quality'), inv = $('set-inverty');
    sens.value = G.settings.sens;
    vol.value = G.settings.vol;
    qual.value = G.settings.quality;
    inv.checked = !!G.settings.invertY;
    $('set-sens-v').textContent = Number(G.settings.sens).toFixed(2);
    $('set-vol-v').textContent = Number(G.settings.vol).toFixed(2);

    sens.addEventListener('input', function () {
      G.settings.sens = parseFloat(sens.value);
      $('set-sens-v').textContent = G.settings.sens.toFixed(2);
      Game.applySettings();
    });
    vol.addEventListener('input', function () {
      G.settings.vol = parseFloat(vol.value);
      $('set-vol-v').textContent = G.settings.vol.toFixed(2);
      AudioSys.setVolume(G.settings.vol);
      Game.applySettings();
    });
    qual.addEventListener('change', function () {
      G.settings.quality = qual.value;
      Game.applySettings();
    });
    inv.addEventListener('change', function () {
      G.settings.invertY = inv.checked;
      Game.applySettings();
    });
  }

  function show(name) {
    current = name || 'none';
    if (name === 'main') showOnly('menu');
    else if (name === 'pause') showOnly('pause');
    else showOnly(null);
  }

  return { init: init, show: show };
})();
