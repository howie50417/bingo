/* world/textures.js — Canvas 程序化貼圖產生器（無外部圖檔） */
window.Tex = (function () {
  'use strict';

  var FONT = '"Microsoft JhengHei","PingFang TC","Noto Sans TC",sans-serif';

  function make(w, h, drawFn) {
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    var ctx = cv.getContext('2d');
    drawFn(ctx, w, h);
    var t = new THREE.CanvasTexture(cv);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return t;
  }

  // 噪點灑色
  function noise(ctx, w, h, n, colors, sMin, sMax) {
    for (var i = 0; i < n; i++) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      var s = sMin + Math.random() * (sMax - sMin);
      ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
    }
  }

  // ---------- 地面 ----------
  function asphalt() {
    var t = make(256, 256, function (ctx, w, h) {
      ctx.fillStyle = '#3a3d42'; ctx.fillRect(0, 0, w, h);
      noise(ctx, w, h, 2600, ['#33363b', '#41454b', '#2e3136', '#484c53'], 1, 3);
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  function sidewalk() {
    var t = make(256, 256, function (ctx, w, h) {
      ctx.fillStyle = '#9a938a'; ctx.fillRect(0, 0, w, h);
      noise(ctx, w, h, 900, ['#8f8880', '#a39c93', '#968f86'], 2, 5);
      ctx.strokeStyle = 'rgba(60,58,55,.55)'; ctx.lineWidth = 2;
      for (var i = 0; i <= 4; i++) {
        ctx.beginPath(); ctx.moveTo(i * 64, 0); ctx.lineTo(i * 64, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * 64); ctx.lineTo(w, i * 64); ctx.stroke();
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  function crosswalk() {
    return make(128, 256, function (ctx, w, h) {
      ctx.fillStyle = '#3a3d42'; ctx.fillRect(0, 0, w, h);
      noise(ctx, w, h, 500, ['#33363b', '#41454b'], 1, 3);
      ctx.fillStyle = 'rgba(230,230,225,.92)';
      for (var y = 8; y < h; y += 42) ctx.fillRect(10, y, w - 20, 24);
    });
  }

  function grass() {
    var t = make(256, 256, function (ctx, w, h) {
      ctx.fillStyle = '#5d7a3a'; ctx.fillRect(0, 0, w, h);
      noise(ctx, w, h, 2400, ['#546f34', '#668541', '#4d682f', '#71904b'], 1, 4);
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  function brick() {
    var t = make(256, 256, function (ctx, w, h) {
      ctx.fillStyle = '#8f4a34'; ctx.fillRect(0, 0, w, h);
      var bh = 16, bw = 42;
      for (var r = 0; r < h / bh; r++) {
        var off = (r % 2) * bw / 2;
        for (var c = -1; c < w / bw + 1; c++) {
          var v = Math.random() * 18 - 9;
          ctx.fillStyle = 'rgb(' + (150 + v) + ',' + (76 + v) + ',' + (54 + v) + ')';
          ctx.fillRect(c * bw + off + 2, r * bh + 2, bw - 3, bh - 3);
        }
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  // ---------- 靶材 ----------
  function target() {
    // 人形剪影靶：頭部在上 1/3，身軀在下（Range 依此對位 head/body mesh）
    return make(256, 512, function (ctx, w, h) {
      ctx.fillStyle = '#e8e2d4'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#b8b0a0'; ctx.lineWidth = 6; ctx.strokeRect(6, 6, w - 12, h - 12);
      // 得分環（身軀）
      ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 3;
      [150, 110, 70].forEach(function (r) {
        ctx.beginPath(); ctx.arc(w / 2, h * 0.58, r, 0, Math.PI * 2); ctx.stroke();
      });
      // 頭部
      ctx.fillStyle = '#22242a';
      ctx.beginPath(); ctx.arc(w / 2, h * 0.16, w * 0.16, 0, Math.PI * 2); ctx.fill();
      // 身軀剪影
      ctx.beginPath();
      ctx.moveTo(w * 0.30, h * 0.30);
      ctx.quadraticCurveTo(w * 0.5, h * 0.24, w * 0.70, h * 0.30);
      ctx.lineTo(w * 0.74, h * 0.62);
      ctx.quadraticCurveTo(w * 0.72, h * 0.88, w * 0.62, h * 0.95);
      ctx.lineTo(w * 0.38, h * 0.95);
      ctx.quadraticCurveTo(w * 0.28, h * 0.88, w * 0.26, h * 0.62);
      ctx.closePath(); ctx.fill();
      // 紅心
      ctx.fillStyle = '#c03028';
      ctx.beginPath(); ctx.arc(w / 2, h * 0.58, 34, 0, Math.PI * 2); ctx.fill();
      // 頭部紅點
      ctx.beginPath(); ctx.arc(w / 2, h * 0.16, 16, 0, Math.PI * 2); ctx.fill();
    });
  }

  function plate() {
    return make(256, 256, function (ctx, w, h) {
      ctx.fillStyle = '#585d63'; ctx.fillRect(0, 0, w, h);
      noise(ctx, w, h, 300, ['#4e5359', '#62676e'], 2, 6);
      var cx = w / 2, cy = h / 2;
      function ring(r, color) {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      }
      ring(118, '#7d838a'); ring(96, '#c8352b'); ring(64, '#e8e4da'); ring(30, '#c8352b');
      ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(cx, cy, 118, 0, Math.PI * 2); ctx.stroke();
    });
  }

  function bottle() {
    return make(128, 256, function (ctx, w, h) {
      ctx.fillStyle = '#2e6b34'; ctx.fillRect(0, 0, w, h);
      noise(ctx, w, h, 160, ['#2a6130', '#357a3c', '#276029'], 2, 6);
      ctx.fillStyle = '#e8dfc8'; ctx.fillRect(8, h * 0.38, w - 16, h * 0.26);
      ctx.fillStyle = '#b03030'; ctx.fillRect(8, h * 0.38, w - 16, 10);
      ctx.fillRect(8, h * 0.38 + h * 0.26 - 10, w - 16, 10);
      ctx.fillStyle = '#333'; ctx.font = 'bold 22px ' + FONT;
      ctx.textAlign = 'center'; ctx.fillText('台啤', w / 2, h * 0.53);
      // 高光
      ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(w * 0.18, 0, 10, h);
    });
  }

  function balloon(hex) {
    return make(128, 128, function (ctx, w, h) {
      var c = new THREE.Color(hex);
      var g = ctx.createRadialGradient(w * 0.38, h * 0.34, 8, w / 2, h / 2, w * 0.62);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.25, 'rgb(' + (c.r * 255 | 0) + ',' + (c.g * 255 | 0) + ',' + (c.b * 255 | 0) + ')');
      g.addColorStop(1, 'rgb(' + (c.r * 160 | 0) + ',' + (c.g * 160 | 0) + ',' + (c.b * 160 | 0) + ')');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
  }

  // ---------- 招牌 ----------
  function sign(text, opts) {
    opts = opts || {};
    var vertical = !!opts.vertical;
    var w = opts.w || (vertical ? 96 : 512);
    var h = opts.h || (vertical ? 448 : 128);
    var bg = opts.bg || '#f5f0e4';
    var fg = opts.fg || '#c22';
    return make(w, h, function (ctx) {
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      // 邊框
      ctx.strokeStyle = fg; ctx.lineWidth = Math.max(4, w * 0.015);
      ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2);
      ctx.fillStyle = fg;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (vertical) {
        var fs = Math.min(w * 0.72, h / (text.length + 0.5));
        ctx.font = 'bold ' + fs + 'px ' + FONT;
        for (var i = 0; i < text.length; i++) {
          ctx.fillText(text[i], w / 2, h * (i + 0.6) / (text.length + 0.4));
        }
      } else {
        var fs2 = Math.min(h * 0.62, w / (text.length * 1.05));
        ctx.font = 'bold ' + fs2 + 'px ' + FONT;
        ctx.fillText(text, w / 2, h / 2 + fs2 * 0.05);
      }
      // 微高光
      ctx.fillStyle = 'rgba(255,255,255,.08)';
      ctx.fillRect(0, 0, w, h * 0.3);
    });
  }

  function storefront(name, opts) {
    opts = opts || {};
    var bg = opts.bg || '#20446a';
    var accent = opts.accent || '#ffcf40';
    return make(512, 256, function (ctx, w, h) {
      // 招牌橫幅
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h * 0.34);
      ctx.fillStyle = accent;
      ctx.font = 'bold ' + (h * 0.2) + 'px ' + FONT;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(name, w / 2, h * 0.18);
      // 遮陽棚條紋
      for (var i = 0; i < 12; i++) {
        ctx.fillStyle = i % 2 ? accent : '#f0ece0';
        ctx.fillRect(i * w / 12, h * 0.34, w / 12, h * 0.12);
      }
      // 玻璃門窗
      var gy = h * 0.46;
      ctx.fillStyle = '#101820'; ctx.fillRect(0, gy, w, h - gy);
      var g = ctx.createLinearGradient(0, gy, 0, h);
      g.addColorStop(0, 'rgba(140,190,220,.75)');
      g.addColorStop(1, 'rgba(60,90,110,.85)');
      ctx.fillStyle = g;
      for (var p = 0; p < 4; p++) {
        ctx.fillRect(14 + p * (w / 4), gy + 10, w / 4 - 26, h - gy - 24);
      }
      // 門框
      ctx.fillStyle = '#d8d8d8';
      ctx.fillRect(w / 2 - 6, gy, 12, h - gy);
      // 店內暖光
      ctx.fillStyle = 'rgba(255,220,150,.25)';
      ctx.fillRect(0, gy, w, (h - gy) * 0.4);
    });
  }

  function facade(opts) {
    opts = opts || {};
    var floors = opts.floors || 4;
    var base = opts.color || '#c9b8a0';
    if (typeof base === 'number') base = '#' + ('000000' + base.toString(16)).slice(-6);
    return make(256, 64 * floors, function (ctx, w, h) {
      ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
      noise(ctx, w, h, 350, ['rgba(0,0,0,.06)', 'rgba(255,255,255,.07)'], 2, 8);
      var fh = h / floors;
      for (var f = 0; f < floors; f++) {
        var y = f * fh;
        // 雨遮
        ctx.fillStyle = 'rgba(0,0,0,.18)';
        ctx.fillRect(0, y, w, 5);
        // 窗
        var cols = 4;
        for (var c = 0; c < cols; c++) {
          var x = 12 + c * (w - 16) / cols;
          var ww = (w - 16) / cols - 12;
          var wy = y + fh * 0.22, wh = fh * 0.56;
          // 窗框
          ctx.fillStyle = '#3c3f45';
          ctx.fillRect(x - 3, wy - 3, ww + 6, wh + 6);
          // 玻璃：黃昏反光或亮燈
          var lit = Math.random() < 0.4;
          var gg = ctx.createLinearGradient(x, wy, x, wy + wh);
          if (lit) {
            gg.addColorStop(0, '#ffd98a'); gg.addColorStop(1, '#e8a850');
          } else {
            gg.addColorStop(0, '#7a9ab5'); gg.addColorStop(1, '#46607a');
          }
          ctx.fillStyle = gg;
          ctx.fillRect(x, wy, ww, wh);
          // 鐵窗
          if (Math.random() < 0.5) {
            ctx.strokeStyle = 'rgba(220,220,220,.75)'; ctx.lineWidth = 2;
            for (var b = 1; b < 4; b++) {
              ctx.beginPath(); ctx.moveTo(x + ww * b / 4, wy); ctx.lineTo(x + ww * b / 4, wy + wh); ctx.stroke();
            }
          }
          // 冷氣室外機
          if (Math.random() < 0.55) {
            ctx.fillStyle = '#b8bcc0';
            ctx.fillRect(x + ww * 0.15, wy + wh + 5, ww * 0.4, 9);
            ctx.fillStyle = 'rgba(0,0,0,.25)';
            ctx.fillRect(x + ww * 0.15, wy + wh + 5, ww * 0.4, 2);
          }
        }
      }
    });
  }

  function lantern() {
    return make(128, 160, function (ctx, w, h) {
      var g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#8f1610');
      g.addColorStop(0.5, '#e03a28');
      g.addColorStop(1, '#8f1610');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // 直紋
      ctx.strokeStyle = 'rgba(120,10,5,.6)'; ctx.lineWidth = 3;
      for (var i = 1; i < 6; i++) {
        ctx.beginPath(); ctx.moveTo(i * w / 6, 0); ctx.lineTo(i * w / 6, h); ctx.stroke();
      }
      // 金邊上下
      ctx.fillStyle = '#e8b93c';
      ctx.fillRect(0, 0, w, 12); ctx.fillRect(0, h - 12, w, 12);
      // 福字
      ctx.fillStyle = '#ffd766';
      ctx.font = 'bold ' + (w * 0.45) + 'px ' + FONT;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('福', w / 2, h / 2);
    });
  }

  // 車站鐘面
  function clock() {
    return make(128, 128, function (ctx, w, h) {
      ctx.fillStyle = '#f2ecdc';
      ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#5a4a38'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#333';
      for (var i = 0; i < 12; i++) {
        var a = i * Math.PI / 6;
        ctx.fillRect(w / 2 + Math.cos(a) * (w / 2 - 16) - 2, h / 2 + Math.sin(a) * (h / 2 - 16) - 2, 5, 5);
      }
      ctx.strokeStyle = '#222'; ctx.lineWidth = 5;
      // 時針 ~4:50（黃昏）
      ctx.beginPath(); ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + Math.cos(4.1) * 22, h / 2 + Math.sin(4.1) * 22); ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + Math.cos(2.4) * 34, h / 2 + Math.sin(2.4) * 34); ctx.stroke();
    });
  }

  // 霓虹招牌（夜市）
  function neon(text, color) {
    return make(384, 128, function (ctx, w, h) {
      ctx.fillStyle = '#0c0c12'; ctx.fillRect(0, 0, w, h);
      ctx.font = 'bold ' + (h * 0.5) + 'px ' + FONT;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = color; ctx.shadowBlur = 22;
      ctx.fillStyle = color;
      ctx.fillText(text, w / 2, h / 2);
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#fff';
      ctx.fillText(text, w / 2, h / 2);
    });
  }

  // 樹葉（alpha 貼圖給樹冠用）
  function leafBlob() {
    return make(128, 128, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < 60; i++) {
        var a = Math.random() * Math.PI * 2, r = Math.random() * w * 0.4;
        var x = w / 2 + Math.cos(a) * r, y = h / 2 + Math.sin(a) * r;
        var g = 90 + Math.random() * 60;
        ctx.fillStyle = 'rgba(' + (g * 0.55 | 0) + ',' + (g | 0) + ',' + (g * 0.4 | 0) + ',.9)';
        ctx.beginPath(); ctx.arc(x, y, 6 + Math.random() * 10, 0, Math.PI * 2); ctx.fill();
      }
    });
  }

  return {
    make: make,
    asphalt: asphalt, sidewalk: sidewalk, crosswalk: crosswalk, grass: grass, brick: brick,
    target: target, plate: plate, bottle: bottle, balloon: balloon,
    sign: sign, storefront: storefront, facade: facade, lantern: lantern,
    clock: clock, neon: neon, leafBlob: leafBlob,
  };
})();
