/* world/effects.js — 射擊特效：槍口火光/曳光/彈孔/拋殼/粒子/傷害數字（全部池化） */
window.FX = (function () {
  'use strict';

  var scene = null;

  // ---- 池 ----
  var tracers = [];      // additive 細長面片
  var flashes = [];      // 槍口火光面片
  var holes = [];        // 彈孔 decal
  var holeIdx = 0;
  var shells = [];       // 拋殼
  var particles = [];    // 通用粒子（小方塊）
  var dmgSprites = [];   // 傷害數字 sprite
  var flashLight = null; // 全域共用槍口光源
  var flashLightT = 0;

  var MAX_TRACER = 32, MAX_FLASH = 8, MAX_HOLE = 96, MAX_SHELL = 24,
      MAX_PART = 160, MAX_DMG = 24;

  var dmgCanvasPool = [];

  function makeTracer() {
    var g = new THREE.PlaneGeometry(1, 1);
    var m = new THREE.MeshBasicMaterial({
      color: 0xffe9a0, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    var mesh = new THREE.Mesh(g, m);
    mesh.visible = false; mesh.frustumCulled = false;
    scene.add(mesh);
    return { mesh: mesh, life: 0, max: 0.07 };
  }

  function makeFlash() {
    // 星芒：兩片交叉面片
    var tex = Tex.make(64, 64, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      var g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(255,240,180,1)');
      g.addColorStop(0.35, 'rgba(255,180,60,.85)');
      g.addColorStop(1, 'rgba(255,120,20,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // 星芒線
      ctx.strokeStyle = 'rgba(255,230,160,.9)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(w / 2, 2); ctx.lineTo(w / 2, h - 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(2, h / 2); ctx.lineTo(w - 2, h / 2); ctx.stroke();
    });
    var m = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m);
    mesh.visible = false; mesh.frustumCulled = false;
    scene.add(mesh);
    return { mesh: mesh, life: 0, max: 0.05 };
  }

  var holeTex = null;
  function makeHole() {
    var m = new THREE.MeshBasicMaterial({
      map: holeTex, transparent: true, opacity: 0.92,
      depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2,
    });
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.09), m);
    mesh.visible = false;
    scene.add(mesh);
    return mesh;
  }

  function makeShell() {
    var mesh = new THREE.Mesh(
      U.cylGeo(0.008, 0.008, 0.03, 6),
      new THREE.MeshLambertMaterial({ color: 0xc8a038, emissive: 0x554411, emissiveIntensity: 0.4 })
    );
    mesh.visible = false;
    scene.add(mesh);
    return { mesh: mesh, vel: new THREE.Vector3(), rot: new THREE.Vector3(), life: 0 };
  }

  function makeParticle() {
    var mesh = new THREE.Mesh(
      U.boxGeo(0.03, 0.03, 0.03),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })
    );
    mesh.visible = false;
    scene.add(mesh);
    return { mesh: mesh, vel: new THREE.Vector3(), rot: new THREE.Vector3(), life: 0, max: 1, grav: 9 };
  }

  function makeDmgSprite() {
    var cv = document.createElement('canvas');
    cv.width = 128; cv.height = 64;
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    var m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    var sp = new THREE.Sprite(m);
    sp.scale.set(0.55, 0.28, 1);
    sp.visible = false;
    scene.add(sp);
    dmgCanvasPool.push(cv);
    return { sprite: sp, cv: cv, tex: tex, life: 0, max: 0.8 };
  }

  function initPool(arr, n, maker) { for (var i = 0; i < n; i++) arr.push(maker()); }

  function init(sc) {
    scene = sc;
    holeTex = Tex.make(64, 64, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(8,8,8,.95)';
      ctx.beginPath();
      var cx = w / 2, cy = h / 2;
      ctx.moveTo(cx + 22, cy);
      for (var i = 1; i <= 12; i++) {
        var a = i / 12 * Math.PI * 2;
        var r = 14 + Math.random() * 12;
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(40,36,32,.6)';
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
    });
    initPool(tracers, MAX_TRACER, makeTracer);
    initPool(flashes, MAX_FLASH, makeFlash);
    initPool(holes, MAX_HOLE, makeHole);
    initPool(shells, MAX_SHELL, makeShell);
    initPool(particles, MAX_PART, makeParticle);
    initPool(dmgSprites, MAX_DMG, makeDmgSprite);
    flashLight = new THREE.PointLight(0xffc060, 0, 14, 2);
    scene.add(flashLight);
  }

  function take(arr) {
    for (var i = 0; i < arr.length; i++) {
      var it = arr[i];
      if (it.life <= 0) return it;
    }
    return arr[0]; // 全滿時回收最舊
  }

  var api = {};

  api.muzzleFlash = function (pos, dir) {
    var f = take(flashes);
    f.life = f.max;
    f.mesh.visible = true;
    f.mesh.position.copy(pos).addScaledVector(dir, 0.06);
    f.mesh.scale.setScalar(U.rand(0.22, 0.34));
    f.mesh.material.opacity = 1;
    f.mesh.material.rotation = Math.random() * Math.PI;
    // 面向方向
    f.mesh.lookAt(pos.clone().add(dir));
    flashLight.position.copy(pos).addScaledVector(dir, 0.25);
    flashLight.intensity = 2.4;
    flashLightT = 0.05;
  };

  api.tracer = function (from, to) {
    var t = take(tracers);
    t.life = t.max;
    var m = t.mesh;
    m.visible = true;
    var len = from.distanceTo(to);
    if (len < 0.5) { m.visible = false; t.life = 0; return; }
    m.position.copy(from).lerp(to, 0.5);
    m.scale.set(len, 0.02, 1);
    m.material.opacity = 0.85;
    // 讓平面 X 軸對準 from→to
    m.lookAt(to);
    m.rotateY(Math.PI / 2);
  };

  api.impact = function (point, normal) {
    burst(point, 0xd8c8a8, 4, 1.6, normal, 0.5, 4);
    burst(point, 0xfff0b0, 3, 3.0, normal, 0.25, 5);
  };

  api.bulletHole = function (point, normal) {
    var mesh = holes[holeIdx];
    holeIdx = (holeIdx + 1) % holes.length;
    mesh.visible = true;
    mesh.position.copy(point).addScaledVector(normal, 0.012);
    mesh.lookAt(point.clone().add(normal));
    mesh.rotation.z = Math.random() * Math.PI * 2;
  };

  api.shell = function (pos, rightDir) {
    var s = take(shells);
    s.life = 1.4;
    s.mesh.visible = true;
    s.mesh.position.copy(pos);
    s.vel.copy(rightDir).multiplyScalar(U.rand(1.2, 2.0));
    s.vel.y = U.rand(1.8, 2.6);
    s.rot.set(U.rand(-8, 8), U.rand(-8, 8), U.rand(-8, 8));
  };

  function burst(point, color, n, speed, normal, life, grav) {
    for (var i = 0; i < n; i++) {
      var p = take(particles);
      p.life = p.max = life * U.rand(0.7, 1.3);
      p.grav = grav;
      p.mesh.visible = true;
      p.mesh.position.copy(point);
      p.mesh.material.color.setHex(color);
      p.mesh.material.opacity = 1;
      p.mesh.scale.setScalar(U.rand(0.6, 1.6));
      p.vel.set(U.rand(-1, 1), U.rand(-0.4, 1), U.rand(-1, 1)).normalize().multiplyScalar(speed * U.rand(0.4, 1));
      if (normal) p.vel.addScaledVector(normal, speed * 0.5);
      p.rot.set(U.rand(-6, 6), U.rand(-6, 6), U.rand(-6, 6));
    }
  }

  api.shatter = function (point, hexColor) {
    burst(point, hexColor || 0x3e8b44, 12, 2.6, null, 0.8, 9);
    burst(point, 0xd8f0e0, 5, 3.4, null, 0.5, 8);
  };

  api.popBalloon = function (point, hexColor) {
    burst(point, hexColor || 0xe05050, 14, 3.2, null, 0.55, 3);
  };

  api.paperHit = function (point) {
    burst(point, 0xe8e2d4, 6, 1.8, null, 0.5, 5);
  };

  api.damageNumber = function (point, amount, isHead) {
    var d = take(dmgSprites);
    d.life = d.max;
    var ctx = d.cv.getContext('2d');
    ctx.clearRect(0, 0, 128, 64);
    ctx.font = 'bold ' + (isHead ? 44 : 36) + 'px "Segoe UI",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.lineWidth = 6;
    ctx.strokeText(String(amount), 64, 32);
    ctx.fillStyle = isHead ? '#ff5030' : '#ffe9a0';
    ctx.fillText(String(amount), 64, 32);
    d.tex.needsUpdate = true;
    d.sprite.visible = true;
    d.sprite.position.copy(point);
    d.sprite.position.x += U.rand(-0.1, 0.1);
    d.sprite.position.y += U.rand(0, 0.12);
    d.sprite.material.opacity = 1;
    var s = isHead ? 0.75 : 0.55;
    d.sprite.scale.set(s, s / 2, 1);
  };

  api.update = function (dt, camera) {
    var i, it;
    for (i = 0; i < tracers.length; i++) {
      it = tracers[i];
      if (it.life > 0) {
        it.life -= dt;
        it.mesh.material.opacity = Math.max(0, it.life / it.max) * 0.85;
        if (it.life <= 0) it.mesh.visible = false;
      }
    }
    for (i = 0; i < flashes.length; i++) {
      it = flashes[i];
      if (it.life > 0) {
        it.life -= dt;
        it.mesh.material.opacity = Math.max(0, it.life / it.max);
        if (it.life <= 0) it.mesh.visible = false;
      }
    }
    if (flashLightT > 0) {
      flashLightT -= dt;
      flashLight.intensity = Math.max(0, flashLightT / 0.05) * 2.4;
    }
    for (i = 0; i < shells.length; i++) {
      it = shells[i];
      if (it.life > 0) {
        it.life -= dt;
        it.vel.y -= 12 * dt;
        it.mesh.position.addScaledVector(it.vel, dt);
        if (it.mesh.position.y < 0.015) { it.mesh.position.y = 0.015; it.vel.multiplyScalar(0.3); it.vel.y = Math.abs(it.vel.y) * 0.3; }
        it.mesh.rotation.x += it.rot.x * dt;
        it.mesh.rotation.y += it.rot.y * dt;
        it.mesh.rotation.z += it.rot.z * dt;
        if (it.life <= 0) it.mesh.visible = false;
      }
    }
    for (i = 0; i < particles.length; i++) {
      it = particles[i];
      if (it.life > 0) {
        it.life -= dt;
        it.vel.y -= it.grav * dt;
        it.mesh.position.addScaledVector(it.vel, dt);
        if (it.mesh.position.y < 0.02) { it.mesh.position.y = 0.02; it.vel.y *= -0.4; it.vel.x *= 0.6; it.vel.z *= 0.6; }
        it.mesh.rotation.x += it.rot.x * dt;
        it.mesh.rotation.z += it.rot.z * dt;
        it.mesh.material.opacity = Math.min(1, it.life / it.max * 2);
        if (it.life <= 0) it.mesh.visible = false;
      }
    }
    for (i = 0; i < dmgSprites.length; i++) {
      it = dmgSprites[i];
      if (it.life > 0) {
        it.life -= dt;
        it.sprite.position.y += dt * 0.9;
        it.sprite.material.opacity = Math.min(1, it.life / it.max * 2.5);
        if (it.life <= 0) it.sprite.visible = false;
      }
    }
  };

  api.init = init;
  return api;
})();
