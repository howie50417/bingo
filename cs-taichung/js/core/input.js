/* core/input.js — 鍵盤/滑鼠輸入與 Pointer Lock 管理 */
window.Input = (function () {
  'use strict';

  var keys = {};          // 實體鍵盤按住
  var virtualKeys = {};   // 手機虛擬按鈕按住
  var pressSet = {};      // 單次觸發（每幀末清除）
  var mouseBtns = {};     // 實體滑鼠按住
  var virtualMouse = {};  // 手機虛擬按鈕按住
  var mousePress = {};
  var canvas = null;

  var api = {
    dx: 0, dy: 0, wheel: 0, moveX: 0, moveY: 0, locked: false,
    touchEnabled: false,
  };

  api.key = function (code) { return !!keys[code] || !!virtualKeys[code]; };
  api.pressed = function (code) { return !!pressSet[code]; };
  api.mouse = function (btn) { return !!mouseBtns[btn] || !!virtualMouse[btn]; };
  api.mousePressed = function (btn) { return !!mousePress[btn]; };

  api.setVirtualKey = function (code, down) {
    if (down && !virtualKeys[code]) pressSet[code] = true;
    virtualKeys[code] = down;
  };

  api.setVirtualMouse = function (btn, down) {
    if (down && !virtualMouse[btn]) mousePress[btn] = true;
    virtualMouse[btn] = down;
  };

  api.setMove = function (x, y) {
    api.moveX = U.clamp(x, -1, 1);
    api.moveY = U.clamp(y, -1, 1);
  };

  api.addLook = function (dx, dy) {
    api.dx += dx;
    api.dy += dy;
  };

  api.resetVirtual = function () {
    virtualKeys = {};
    virtualMouse = {};
    api.moveX = 0;
    api.moveY = 0;
  };

  api.init = function (cv) {
    canvas = cv;

    window.addEventListener('keydown', function (e) {
      if (e.code === 'Tab') e.preventDefault();
      if (!e.repeat) pressSet[e.code] = true;
      keys[e.code] = true;
    });
    window.addEventListener('keyup', function (e) { keys[e.code] = false; });
    var hasTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    var coarsePointer = window.matchMedia &&
      (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches);
    api.touchEnabled = !!(hasTouch && coarsePointer);

    window.addEventListener('blur', function () {
      keys = {}; mouseBtns = {}; api.resetVirtual();
    });

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
      if (!api.touchEnabled && !api.locked && G.state === 'playing' && window.Game) Game.pause();
    });
  };

  api.requestLock = function () {
    if (api.touchEnabled) return;
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
