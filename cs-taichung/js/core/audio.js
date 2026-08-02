/* core/audio.js — WebAudio 程序化音效（無音檔，全部合成） */
window.AudioSys = (function () {
  'use strict';

  var ctx = null, master = null, noiseBuf = null;

  function ensure() {
    if (ctx) return true;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = G.settings.vol;
      master.connect(ctx.destination);
      // 2 秒白噪音 buffer 供各音效取用
      var len = ctx.sampleRate * 2;
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      return true;
    } catch (e) { return false; }
  }

  function noise(dur, filterType, freq, q, gain, when, decay) {
    var t = ctx.currentTime + (when || 0);
    var src = ctx.createBufferSource(); src.buffer = noiseBuf;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    var f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q || 1;
    var g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + (decay || dur));
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t); src.stop(t + dur + 0.05);
    return { f: f, g: g, t: t };
  }

  function tone(freq, dur, type, gain, when, slideTo) {
    var t = ctx.currentTime + (when || 0);
    var o = ctx.createOscillator(); o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  // 槍聲：低頻轟 + 高頻噪
  function gunshot(body, crack, dur, dist) {
    var v = dist > 0 ? Math.max(0.06, 1 - dist / 90) : 1;
    noise(0.06, 'highpass', 3000, 1, crack * 0.5 * v, 0, 0.06);
    var n = noise(dur, 'lowpass', 900, 1, body * v, 0, dur);
    n.f.frequency.exponentialRampToValueAtTime(120, n.t + dur);
    tone(90, dur * 0.8, 'triangle', body * 0.35 * v, 0, 40);
  }

  var sounds = {
    shot_pistol: function (d) { gunshot(0.9, 1.0, 0.14, d); },
    shot_rifle: function (d) { gunshot(1.15, 0.9, 0.18, d); },
    shot_sniper: function (d) {
      gunshot(1.5, 1.2, 0.42, d);
      noise(0.5, 'lowpass', 500, 1, 0.5, 0.05, 0.5); // 尾音
    },
    knife: function () { noise(0.16, 'bandpass', 1800, 2, 0.35, 0, 0.16); },
    dryfire: function () { tone(1400, 0.03, 'square', 0.12); tone(900, 0.04, 'square', 0.1, 0.03); },
    reload_start: function () { tone(700, 0.05, 'square', 0.14); noise(0.08, 'bandpass', 2400, 3, 0.2, 0.02, 0.08); },
    reload_end: function () { tone(1000, 0.05, 'square', 0.16); tone(1300, 0.06, 'square', 0.16, 0.07); },
    bolt: function () {
      tone(850, 0.05, 'square', 0.15);
      tone(620, 0.05, 'square', 0.15, 0.12);
      noise(0.06, 'bandpass', 3000, 3, 0.15, 0.06, 0.06);
    },
    ping: function (d) { // 鋼靶
      var v = d > 0 ? Math.max(0.05, 1 - d / 120) : 1;
      tone(2200 + Math.random() * 300, 0.5, 'sine', 0.4 * v, 0, 1800);
      tone(3300, 0.25, 'sine', 0.15 * v, 0, 2900);
    },
    glass: function (d) {
      var v = d > 0 ? Math.max(0.05, 1 - d / 80) : 1;
      noise(0.25, 'highpass', 4000, 1, 0.5 * v, 0, 0.25);
      tone(5200, 0.1, 'sine', 0.2 * v); tone(3900, 0.14, 'sine', 0.18 * v, 0.03);
    },
    pop: function (d) {
      var v = d > 0 ? Math.max(0.05, 1 - d / 80) : 1;
      noise(0.09, 'lowpass', 1600, 1, 0.7 * v, 0, 0.09);
      tone(300, 0.09, 'sine', 0.4 * v, 0, 90);
    },
    paper: function (d) {
      var v = d > 0 ? Math.max(0.05, 1 - d / 80) : 1;
      noise(0.1, 'bandpass', 1200, 1.5, 0.35 * v, 0, 0.1);
    },
    popup: function () { tone(500, 0.07, 'square', 0.14, 0, 700); },
    hit: function () { tone(1600, 0.045, 'sine', 0.22); },
    headshot: function () { tone(2100, 0.07, 'sine', 0.3); tone(2700, 0.09, 'sine', 0.24, 0.06); },
    footstep: function () { noise(0.07, 'lowpass', 480, 1, 0.13, 0, 0.07); },
    click: function () { tone(950, 0.04, 'square', 0.12); },
    score: function () { tone(880, 0.09, 'sine', 0.2); tone(1320, 0.12, 'sine', 0.18, 0.08); },
    win: function () {
      [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.22, 'triangle', 0.22, i * 0.13); });
    },
  };

  var api = {};
  api.unlock = function () { if (ensure() && ctx.state === 'suspended') ctx.resume(); };
  api.setVolume = function (v) { if (master) master.gain.value = v; };
  api.play = function (name, opts) {
    if (!ctx || ctx.state !== 'running') return;
    var fn = sounds[name];
    if (fn) fn((opts && opts.dist) || 0);
  };

  return api;
})();
