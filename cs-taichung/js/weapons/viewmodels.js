/* weapons/viewmodels.js — 第一人稱武器模型（低模拼裝）與持槍動畫 */
window.ViewModels = (function () {
  'use strict';

  var camera = null;
  var root = null;              // 掛在 camera 下的總節點
  var models = {};              // key -> {group, muzzle, eject}
  var current = 'rifle';

  // 動畫狀態
  var kickZ = 0, kickRot = 0;   // 後座位移/上抬
  var reloadT = 0, reloadDur = 0;
  var drawT = 0;
  var inspectT = 0;
  var boltT = 0;
  var swingT = 0, swingHeavy = false;
  var bobPhase = 0;
  var scopedHidden = false;
  var BASE_FOV_POS = { x: 0.24, y: -0.24, z: -0.45 };

  // ---------- 各槍模型 ----------
  function buildKnife() {
    var g = new THREE.Group();
    // 握把
    var grip = U.box(0.035, 0.11, 0.05, 0x1e2024);
    g.add(grip);
    // 護手
    var guard = U.box(0.05, 0.015, 0.07, 0x8a8f96);
    guard.position.set(0, 0.06, -0.005);
    g.add(guard);
    // 刀刃
    var blade = U.box(0.008, 0.16, 0.035, 0xc8ccd2);
    blade.position.set(0, 0.145, -0.01);
    g.add(blade);
    // 刀尖
    var tip = U.cyl(0.0005, 0.02, 0.05, 0xc8ccd2, { seg: 4 });
    tip.position.set(0, 0.25, -0.01);
    g.add(tip);
    var muzzle = new THREE.Object3D();
    muzzle.position.set(0, 0.2, -0.02);
    g.add(muzzle);
    g.rotation.set(-0.3, 0.15, 0.1);
    return { group: g, muzzle: muzzle, eject: muzzle };
  }

  function buildPistol() {
    var g = new THREE.Group();
    var dark = U.mat(0x24262c), slide = U.mat(0x3a3d44);
    // 滑套
    var s = U.box(0.045, 0.05, 0.24, 0, { material: slide });
    s.position.set(0, 0.03, -0.08);
    g.add(s);
    // 槍身/握把
    var frame = U.box(0.04, 0.05, 0.18, 0, { material: dark });
    frame.position.set(0, -0.02, -0.04);
    g.add(frame);
    var grip = U.box(0.038, 0.12, 0.055, 0, { material: dark });
    grip.position.set(0, -0.09, 0.03);
    grip.rotation.x = 0.18;
    g.add(grip);
    // 扳機護弓
    var tg = U.box(0.03, 0.04, 0.05, 0x1a1c20);
    tg.position.set(0, -0.055, -0.08);
    g.add(tg);
    // 準星照門
    var fs = U.box(0.008, 0.02, 0.01, 0x111);
    fs.position.set(0, 0.065, -0.19);
    g.add(fs);
    var rs = U.box(0.02, 0.018, 0.01, 0x111);
    rs.position.set(0, 0.064, 0.02);
    g.add(rs);
    var muzzle = new THREE.Object3D();
    muzzle.position.set(0, 0.03, -0.21);
    g.add(muzzle);
    var eject = new THREE.Object3D();
    eject.position.set(0.03, 0.04, -0.05);
    g.add(eject);
    return { group: g, muzzle: muzzle, eject: eject };
  }

  function buildRifle() {
    var g = new THREE.Group();
    var wood = U.mat(0x7a4a26), metal = U.mat(0x2a2c30);
    // 機匣
    var recv = U.box(0.055, 0.08, 0.42, 0, { material: metal });
    recv.position.set(0, 0, -0.1);
    g.add(recv);
    // 木護木
    var hg = U.box(0.06, 0.07, 0.26, 0, { material: wood });
    hg.position.set(0, -0.005, -0.42);
    g.add(hg);
    // 槍管
    var barrel = U.cyl(0.012, 0.012, 0.3, 0x1e2024, { seg: 8 });
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.01, -0.68);
    g.add(barrel);
    // 木槍托
    var stock = U.box(0.05, 0.1, 0.24, 0, { material: wood });
    stock.position.set(0, -0.02, 0.2);
    stock.rotation.x = -0.08;
    g.add(stock);
    // 彎彈匣
    var mag = U.box(0.04, 0.16, 0.09, 0x3a3d44);
    mag.position.set(0, -0.11, -0.06);
    mag.rotation.x = 0.5;
    g.add(mag);
    // 握把
    var grip = U.box(0.04, 0.1, 0.05, 0, { material: wood });
    grip.position.set(0, -0.09, 0.06);
    grip.rotation.x = 0.3;
    g.add(grip);
    // 準星
    var fs = U.box(0.006, 0.035, 0.012, 0x111);
    fs.position.set(0, 0.06, -0.62);
    g.add(fs);
    var rs = U.box(0.03, 0.02, 0.015, 0x111);
    rs.position.set(0, 0.055, 0.08);
    g.add(rs);
    var muzzle = new THREE.Object3D();
    muzzle.position.set(0, 0.01, -0.84);
    g.add(muzzle);
    var eject = new THREE.Object3D();
    eject.position.set(0.035, 0.02, -0.08);
    g.add(eject);
    return { group: g, muzzle: muzzle, eject: eject };
  }

  function buildSniper() {
    var g = new THREE.Group();
    var green = U.mat(0x3a4a38), metal = U.mat(0x24262c);
    // 槍身
    var body = U.box(0.055, 0.09, 0.5, 0, { material: green });
    body.position.set(0, -0.01, -0.15);
    g.add(body);
    // 長槍管
    var barrel = U.cyl(0.014, 0.014, 0.55, 0x1a1c20, { seg: 8 });
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, -0.62);
    g.add(barrel);
    // 槍口制退器
    var mb = U.cyl(0.025, 0.025, 0.08, 0x111, { seg: 8 });
    mb.rotation.x = Math.PI / 2;
    mb.position.set(0, 0.02, -0.88);
    g.add(mb);
    // 瞄準鏡
    var scope = U.cyl(0.028, 0.028, 0.22, 0x181a1e, { seg: 10 });
    scope.rotation.x = Math.PI / 2;
    scope.position.set(0, 0.085, -0.15);
    g.add(scope);
    var lens = new THREE.Mesh(new THREE.CircleGeometry(0.024, 12),
      new THREE.MeshLambertMaterial({ color: 0x3a5a8a, emissive: 0x1a3a6a, emissiveIntensity: 0.8 }));
    lens.position.set(0, 0.085, -0.265);
    lens.rotation.y = Math.PI;
    g.add(lens);
    // 鏡架
    var mount = U.box(0.02, 0.04, 0.1, 0x111);
    mount.position.set(0, 0.05, -0.15);
    g.add(mount);
    // 槍托
    var stock = U.box(0.05, 0.11, 0.28, 0, { material: green });
    stock.position.set(0, -0.03, 0.22);
    g.add(stock);
    // 彈匣 + 握把
    var mag = U.box(0.04, 0.09, 0.08, 0, { material: metal });
    mag.position.set(0, -0.1, -0.05);
    g.add(mag);
    var grip = U.box(0.04, 0.1, 0.05, 0, { material: green });
    grip.position.set(0, -0.1, 0.08);
    grip.rotation.x = 0.3;
    g.add(grip);
    // 槍機柄
    var bolt = U.cyl(0.01, 0.01, 0.06, 0x888, { seg: 6 });
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(0.05, 0.02, 0.02);
    g.add(bolt);
    var muzzle = new THREE.Object3D();
    muzzle.position.set(0, 0.02, -0.93);
    g.add(muzzle);
    var eject = new THREE.Object3D();
    eject.position.set(0.04, 0.02, -0.02);
    g.add(eject);
    return { group: g, muzzle: muzzle, eject: eject };
  }

  function buildAll(cam) {
    camera = cam;
    root = new THREE.Group();
    camera.add(root);
    models.knife = buildKnife();
    models.pistol = buildPistol();
    models.rifle = buildRifle();
    models.sniper = buildSniper();
    for (var k in models) {
      models[k].group.visible = false;
      root.add(models[k].group);
    }
    show(current);
  }

  function show(key) {
    current = key;
    for (var k in models) models[k].group.visible = (k === key);
    drawT = 0.32;
  }

  var api = {};
  api.buildAll = buildAll;

  api.show = show;
  api.kick = function (amount) {
    kickZ += amount * 1.6;
    kickRot += amount;
  };
  api.reload = function (dur) { reloadT = reloadDur = dur; };
  api.bolt = function () { boltT = 0.45; };
  api.swing = function (heavy) { swingT = heavy ? 0.5 : 0.32; swingHeavy = heavy; };
  api.inspect = function () { inspectT = 2.0; };
  api.scope = function (on) {
    scopedHidden = on;
    root.visible = !on;
  };
  api.muzzleWorld = function (v) {
    camera.updateMatrixWorld(true);
    return models[current].muzzle.getWorldPosition(v);
  };
  api.ejectWorld = function (v) {
    camera.updateMatrixWorld(true);
    return models[current].eject.getWorldPosition(v);
  };

  var tmpV = new THREE.Vector3();

  api.update = function (dt, s) {
    if (!root || scopedHidden) return;
    var m = models[current];
    var g = m.group;

    // 彈簧回復
    kickZ = U.lerp(kickZ, 0, Math.min(1, dt * 9));
    kickRot = U.lerp(kickRot, 0, Math.min(1, dt * 8));

    // 走路搖擺
    var bobX = 0, bobY = 0;
    if (s.moving && s.grounded) {
      bobPhase += dt * (s.sprinting ? 11 : 7.5);
      var amp = s.sprinting ? 0.016 : 0.008;
      bobX = Math.sin(bobPhase) * amp;
      bobY = Math.abs(Math.cos(bobPhase)) * amp * 0.8;
    } else {
      bobPhase = 0;
      bobY = Math.sin(performance.now() * 0.0012) * 0.0022; // 呼吸
    }

    var px = BASE_FOV_POS.x + bobX;
    var py = BASE_FOV_POS.y + bobY;
    var pz = BASE_FOV_POS.z + kickZ;
    var rx = kickRot, ry = 0, rz = 0;

    // 衝刺下沉
    if (s.sprinting && s.moving) {
      py -= 0.05; rx -= 0.28; ry += 0.18;
    }

    // 切槍升起
    if (drawT > 0) {
      drawT -= dt;
      var dtp = Math.max(0, drawT / 0.32);
      py -= dtp * 0.35;
      rx -= dtp * 0.7;
    }

    // 換彈下沉旋轉
    if (reloadT > 0) {
      reloadT -= dt;
      var rp = 1 - Math.abs((reloadT / reloadDur) * 2 - 1); // 0→1→0
      py -= rp * 0.16;
      rx -= rp * 0.9;
      rz += rp * 0.35;
    }

    // 拉槍機
    if (boltT > 0) {
      boltT -= dt;
      var bp = 1 - Math.abs((boltT / 0.45) * 2 - 1);
      pz += bp * 0.05;
      rz += bp * 0.12;
    }

    // 檢視（轉向鏡頭欣賞）
    if (inspectT > 0) {
      inspectT -= dt;
      var ip = 1 - inspectT / 2.0;
      px -= Math.sin(ip * Math.PI) * 0.12;
      ry += Math.sin(ip * Math.PI * 2) * 0.9;
      rx += Math.sin(ip * Math.PI) * 0.25;
    }

    // 揮刀
    if (swingT > 0) {
      var dur = swingHeavy ? 0.5 : 0.32;
      swingT -= dt;
      var sp = 1 - swingT / dur; // 0→1
      var arc = Math.sin(sp * Math.PI);
      px -= arc * (swingHeavy ? 0.3 : 0.22);
      py -= arc * 0.08;
      ry += arc * (swingHeavy ? 1.5 : 1.0);
      rx += arc * 0.4;
      rz -= arc * 0.3;
    }

    g.position.set(px, py, pz);
    g.rotation.set(g.rotation.x * 0 + rx + (current === 'knife' ? -0.3 : 0),
      ry + (current === 'knife' ? 0.15 : 0),
      rz + (current === 'knife' ? 0.1 : 0));
  };

  return api;
})();
