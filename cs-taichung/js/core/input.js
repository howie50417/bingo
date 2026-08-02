/* core/input.js — 鍵盤/滑鼠輸入與 Pointer Lock 管理 */
window.Input = (function () {
  'use strict';

  var keys = {};          // 按住
  var pressSet = {};      // 單次觸發（每幀末清除）
  var mouseBtns = {};
  var mousePress = {};
  var canvas = null;

  var api = {
    dx: 0, dy: 0, wheel: 0, locked: false,
  };

  api.key = function (code) { return !!keys[code]; };
  api.pressed = function (code) { return !!pressSet[code]; };
  api.mouse = function (btn) { return !!mouseBtns[btn]; };
  api.mousePressed = function (btn) { return !!mousePress[btn]; };

  api.init = function (cv) {
    canvas = cv;

    window.addEventListener('keydown', function (e) {
      if (e.code === 'Tab') e.preventDefault();
      if (!e.repeat) pressSet[e.code] = true;
      keys[e.code] = true;
    });
    window.addEventListener('keyup', function (e) { keys[e.code] = false; });
    window.addEventListener('blur', function () { keys = {}; mouseBtns = {}; });

    canvas.addEventListener('mousedown', function (e) {
      mouseBtns[e.button] = true;
      mousePress[e.button] = true;
      e.preventDefault();
    });
    window.addEventListener('mouseup', function (e) { mouseBtns[e.button] = false; });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    window.addEventListener('mousemove', function (e) {
      if (!api.locked) return;
      api.dx += e.movementX || 0;
      api.dy += e.movementY || 0;
    });
    window.addEventListener('wheel', function (e) {
      api.wheel = e.deltaY > 0 ? 1 : -1;
    }, { passive: true });

    document.addEventListener('pointerlockchange', function () {
      api.locked = document.pointerLockElement === canvas;
      if (!api.locked && G.state === 'playing' && window.Game) Game.pause();
    });
  };

  api.requestLock = function () {
    if (canvas && !api.locked) {
      var p = canvas.requestPointerLock({ unadjustedMovement: true });
      if (p && p.catch) p.catch(function () { canvas.requestPointerLock(); });
    }
  };
  api.exitLock = function () {
    if (document.pointerLockElement) document.exitPointerLock();
  };

  api.endFrame = function () {
    pressSet = {};
    mousePress = {};
    api.dx = 0; api.dy = 0; api.wheel = 0;
  };

  return api;
})();
