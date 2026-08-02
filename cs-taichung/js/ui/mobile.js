/* ui/mobile.js — 手機觸控搖桿、滑動瞄準、虛擬按鈕與橫向鎖定 */
window.MobileControls = (function () {
  'use strict';

  var enabled = false;
  var movePointer = null;
  var lookPointer = null;
  var lookX = 0, lookY = 0;
  var knob = null;
  var ownsFullscreen = false;

  function releaseMove() {
    movePointer = null;
    Input.setMove(0, 0);
    if (knob) knob.style.transform = 'translate3d(0,0,0)';
  }

  function updateStick(e, stick) {
    var rect = stick.getBoundingClientRect();
    var dx = e.clientX - (rect.left + rect.width / 2);
    var dy = e.clientY - (rect.top + rect.height / 2);
    var max = rect.width * 0.3;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len > max) { dx = dx / len * max; dy = dy / len * max; }
    var nx = dx / max, ny = dy / max;
    if (Math.sqrt(nx * nx + ny * ny) < 0.12) { nx = 0; ny = 0; }
    Input.setMove(nx, ny);
    knob.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
  }

  function bindStick() {
    var stick = document.getElementById('move-stick');
    knob = document.getElementById('move-knob');
    stick.addEventListener('pointerdown', function (e) {
      if (G.state !== 'playing') return;
      e.preventDefault(); e.stopPropagation();
      movePointer = e.pointerId;
      try { stick.setPointerCapture(e.pointerId); } catch (err) {}
      updateStick(e, stick);
    });
    stick.addEventListener('pointermove', function (e) {
      if (e.pointerId !== movePointer) return;
      e.preventDefault();
      updateStick(e, stick);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (name) {
      stick.addEventListener(name, function (e) {
        if (e.pointerId === movePointer) releaseMove();
      });
    });
  }

  function bindLook(canvas) {
    canvas.addEventListener('pointerdown', function (e) {
      if (!enabled || G.state !== 'playing' || e.pointerType === 'mouse') return;
      e.preventDefault();
      if (lookPointer !== null) return;
      lookPointer = e.pointerId;
      lookX = e.clientX; lookY = e.clientY;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });
    canvas.addEventListener('pointermove', function (e) {
      if (e.pointerId !== lookPointer) return;
      e.preventDefault();
      Input.addLook((e.clientX - lookX) * 1.15, (e.clientY - lookY) * 1.15);
      lookX = e.clientX; lookY = e.clientY;
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (name) {
      canvas.addEventListener(name, function (e) {
        if (e.pointerId === lookPointer) lookPointer = null;
      });
    });
  }

  function bindHoldButton(btn) {
    var key = btn.getAttribute('data-key');
    var mouse = btn.getAttribute('data-mouse');
    var pointer = null;

    function setDown(down) {
      if (key) Input.setVirtualKey(key, down);
      if (mouse !== null) Input.setVirtualMouse(Number(mouse), down);
      btn.classList.toggle('active', down);
    }

    btn.addEventListener('pointerdown', function (e) {
      if (G.state !== 'playing') return;
      e.preventDefault(); e.stopPropagation();
      pointer = e.pointerId;
      try { btn.setPointerCapture(e.pointerId); } catch (err) {}
      setDown(true);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (name) {
      btn.addEventListener(name, function (e) {
        if (e.pointerId !== pointer) return;
        pointer = null;
        setDown(false);
      });
    });
  }

  function updateOrientation() {
    if (!enabled) return;
    document.body.classList.toggle('portrait-device', window.innerHeight > window.innerWidth);
  }

  function lockLandscape() {
    if (!enabled) return;
    var root = document.documentElement;
    var fullscreen = Promise.resolve();
    if (!document.fullscreenElement && root.requestFullscreen) {
      fullscreen = root.requestFullscreen({ navigationUI: 'hide' }).then(function () {
        ownsFullscreen = true;
      }).catch(function () {});
    }
    fullscreen.then(function () {
      if (screen.orientation && screen.orientation.lock) {
        try {
          var result = screen.orientation.lock('landscape');
          if (result && result.catch) result.catch(function () {});
        } catch (e) {}
      }
    });
  }

  function init(canvas) {
    enabled = Input.touchEnabled;
    if (!enabled) return;
    document.body.classList.add('touch-device');
    bindStick();
    bindLook(canvas);
    Array.prototype.forEach.call(document.querySelectorAll('#mobile-controls [data-key], #mobile-controls [data-mouse]'), bindHoldButton);
    document.getElementById('btn-landscape').addEventListener('click', lockLandscape);
    document.getElementById('touch-pause').addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (G.state === 'playing') Game.pause();
    });
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    if (screen.orientation && screen.orientation.addEventListener) {
      screen.orientation.addEventListener('change', updateOrientation);
    }
    updateOrientation();
  }

  function enterGame() {
    if (!enabled) return;
    document.body.classList.add('mobile-playing');
    Input.resetVirtual();
    releaseMove();
    lockLandscape();
  }

  function pause() {
    if (!enabled) return;
    document.body.classList.remove('mobile-playing');
    Input.resetVirtual();
    releaseMove();
    lookPointer = null;
  }

  function exitGame() {
    pause();
    if (!enabled) return;
    if (screen.orientation && screen.orientation.unlock) {
      try { screen.orientation.unlock(); } catch (e) {}
    }
    if (ownsFullscreen && document.fullscreenElement && document.exitFullscreen) {
      var result = document.exitFullscreen();
      if (result && result.catch) result.catch(function () {});
    }
    ownsFullscreen = false;
  }

  return { init: init, enterGame: enterGame, pause: pause, exitGame: exitGame };
})();
