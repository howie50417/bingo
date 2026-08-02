/* world/range.js — 訓練目標：人形紙靶/鋼靶/玻璃瓶/氣球/移動靶/彈出靶 + Targets 命中結算 */
window.Range = (function () {
  'use strict';

  var idSeq = 0;

  function baseTarget(type, challenge) {
    return {
      id: ++idSeq, type: type, alive: true, down: false, downT: 0,
      challenge: challenge, meshes: [],
      update: function () {}, reset: function () {},
      onHit: function () { return { killed: false, score: 0 }; },
    };
  }

  function tag(mesh, t, zone) {
    mesh.userData.target = t;
    mesh.userData.zone = zone || null;
    t.meshes.push(mesh);
  }

  // ============ 人形紙靶 ============
  var paperTexShared = null;
  function paperTarget(x, z, faceYaw) {
    if (!paperTexShared) paperTexShared = Tex.target();
    var t = baseTarget('paper', false);
    var g = new THREE.Group();
    // 木架
    var legL = U.box(0.06, 1.1, 0.06, 0x6a4a2a); legL.position.set(-0.3, 0.55, 0);
    var legR = U.box(0.06, 1.1, 0.06, 0x6a4a2a); legR.position.set(0.3, 0.55, 0);
    var bar = U.box(0.85, 0.06, 0.06, 0x6a4a2a); bar.position.set(0, 1.05, 0);
    g.add(legL); g.add(legR); g.add(bar);
    // 靶板（身軀）
    var board = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 1.56),
      new THREE.MeshLambertMaterial({ map: paperTexShared, side: THREE.DoubleSide }));
    board.position.set(0, 1.32, 0);
    g.add(board);
    tag(board, t, 'body');
    // 頭部判定（對應貼圖頭部位置：板中心上方）
    var head = new THREE.Mesh(new THREE.CircleGeometry(0.13, 12),
      new THREE.MeshLambertMaterial({ color: 0x22242a, side: THREE.DoubleSide }));
    head.position.set(0, 1.32 + (0.5 - 0.16) * 1.56, 0.012); // 對齊貼圖頭部（h*0.16 從頂）
    g.add(head);
    tag(head, t, 'head');
    t.group = g;
    g.position.set(x, 0, z);
    g.rotation.y = faceYaw || 0;
    // 收集 group 內 mesh 到場景（tag 的 mesh 已在 group 內，把 group 掛進場景）
    t.meshes = [];
    g.traverse(function (m) { if (m.isMesh) t.meshes.push(m); });
    // 只有 board/head 有 userData.target（tag 時設的），重新標記
    board.userData.target = t; board.userData.zone = 'body';
    head.userData.target = t; head.userData.zone = 'head';
    G.scene.add(g);
    G.targets.push(t);
    U.addCollider(x, 0.6, z, 0.8, 1.2, 0.3);

    var wobble = 0;
    t.onHit = function (zone, dmg, point) {
      wobble = 1;
      FX.paperHit(point);
      AudioSys.play('paper', { dist: camera_dist(point) });
      return { killed: false, score: zone === 'head' ? 25 : 10 };
    };
    t.update = function (dt) {
      if (wobble > 0) {
        wobble = Math.max(0, wobble - dt * 2.2);
        g.rotation.x = -Math.sin(wobble * 14) * 0.12 * wobble;
      }
    };
    t.reset = function () { wobble = 0; g.rotation.x = 0; };
    return t;
  }

  function camera_dist(point) {
    return G.camera ? G.camera.position.distanceTo(point) : 0;
  }

  // ============ 鋼靶 ============
  var plateTexShared = null;
  function plateRack(x, z0, n, faceYaw) {
    if (!plateTexShared) plateTexShared = Tex.plate();
    // 架
    var frame = U.box(0.15, 1.0, n * 1.2 + 0.4, 0x3a3f44);
    frame.position.set(x, 0.5, z0 + (n - 1) * 0.6);
    G.scene.add(frame); G.worldMeshes.push(frame);
    U.addCollider(x, 0.5, z0 + (n - 1) * 0.6, 0.4, 1.0, n * 1.2 + 0.4);

    for (var i = 0; i < n; i++) {
      (function (i) {
        var t = baseTarget('plate', true);
        var pivot = new THREE.Group();
        pivot.position.set(x, 1.05, z0 + i * 1.2);
        pivot.rotation.y = faceYaw;
        var plate = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 18),
          [U.mat(0x585d63), new THREE.MeshLambertMaterial({ map: plateTexShared }), U.mat(0x585d63)]);
        plate.rotation.z = Math.PI / 2;      // 圓面朝 ±X
        plate.rotation.y = Math.PI / 2;
        plate.position.y = 0.24;
        pivot.add(plate);
        plate.userData.target = t; plate.userData.zone = null;
        t.meshes = [plate];
        t.group = pivot;
        G.scene.add(pivot);
        G.targets.push(t);

        var fallT = 0;
        t.onHit = function (zone, dmg, point) {
          if (t.down) return { killed: false, score: 0 };
          t.down = true; t.downT = 7;
          fallT = 0.35;
          AudioSys.play('ping', { dist: camera_dist(point) });
          return { killed: true, score: 15 };
        };
        t.update = function (dt) {
          if (fallT > 0) {
            fallT -= dt;
            pivot.rotation.x = -(1 - Math.max(0, fallT / 0.35)) * 1.45;
          }
          if (t.down && !G.challenge.active) {
            t.downT -= dt;
            if (t.downT <= 0) t.reset();
          }
        };
        t.reset = function () {
          t.down = false; fallT = 0;
          pivot.rotation.x = 0;
          plate.visible = true;
        };
      })(i);
    }
  }

  // ============ 玻璃瓶 ============
  function bottleTable(x, z, n, faceYaw) {
    // 木桌
    var table = U.box(0.9, 0.08, n * 0.5 + 0.3, 0x7a5a36);
    table.position.set(x, 0.95, z + (n - 1) * 0.25);
    G.scene.add(table); G.worldMeshes.push(table);
    var leg = U.box(0.7, 0.95, n * 0.5, 0x5a4028);
    leg.position.set(x, 0.475, z + (n - 1) * 0.25);
    G.scene.add(leg); G.worldMeshes.push(leg);
    U.addCollider(x, 0.5, z + (n - 1) * 0.25, 0.9, 1.0, n * 0.5 + 0.3);

    var bottleTex = Tex.bottle();
    var colors = [0x3e8b44, 0x8b5a2e, 0x5a8b9e, 0x3e8b44];
    for (var i = 0; i < n; i++) {
      (function (i) {
        var t = baseTarget('bottle', true);
        var g = new THREE.Group();
        var mat = new THREE.MeshLambertMaterial({ map: bottleTex, color: colors[i % colors.length] });
        var body = new THREE.Mesh(U.cylGeo(0.09, 0.09, 0.26, 10), mat);
        body.position.y = 0.13;
        var neck = new THREE.Mesh(U.cylGeo(0.03, 0.05, 0.12, 8), mat);
        neck.position.y = 0.32;
        g.add(body); g.add(neck);
        g.position.set(x, 1.0, z + i * 0.5);
        body.userData.target = t; neck.userData.target = t;
        t.meshes = [body, neck];
        t.group = g;
        G.scene.add(g);
        G.targets.push(t);
        var hex = colors[i % colors.length];
        t.onHit = function (zone, dmg, point) {
          if (t.down) return { killed: false, score: 0 };
          t.down = true; t.downT = 8;
          g.visible = false;
          FX.shatter(point, hex);
          AudioSys.play('glass', { dist: camera_dist(point) });
          return { killed: true, score: 20 };
        };
        t.update = function (dt) {
          if (t.down && !G.challenge.active) {
            t.downT -= dt;
            if (t.downT <= 0) t.reset();
          }
        };
        t.reset = function () { t.down = false; g.visible = true; };
      })(i);
    }
  }

  // ============ 氣球 ============
  function balloon(x, y, z, hex) {
    var t = baseTarget('balloon', true);
    var g = new THREE.Group();
    var mat = new THREE.MeshLambertMaterial({ map: Tex.balloon(hex) });
    var ball = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 12), mat);
    ball.scale.y = 1.15;
    g.add(ball);
    var knot = U.cyl(0.02, 0.05, 0.08, hex, { seg: 6 });
    knot.position.y = -0.4;
    g.add(knot);
    // 繩子到地面
    var rope = U.cyl(0.006, 0.006, y - 0.4, 0xd8d0c0, { seg: 4, castShadow: false });
    rope.position.y = -(y - 0.4) / 2 - 0.4;
    g.add(rope);
    g.position.set(x, y, z);
    ball.userData.target = t;
    t.meshes = [ball];
    t.group = g;
    t.baseY = y;
    G.scene.add(g);
    G.targets.push(t);
    var phase = Math.random() * 6.28;
    t.onHit = function (zone, dmg, point) {
      if (t.down) return { killed: false, score: 0 };
      t.down = true; t.downT = 10;
      g.visible = false;
      FX.popBalloon(point, hex);
      AudioSys.play('pop', { dist: camera_dist(point) });
      return { killed: true, score: 20 };
    };
    t.update = function (dt) {
      if (!t.down) {
        phase += dt;
        g.position.y = t.baseY + Math.sin(phase * 1.3) * 0.25;
        g.position.x += Math.sin(phase * 0.6) * 0.0008;
      } else if (!G.challenge.active) {
        t.downT -= dt;
        if (t.downT <= 0) t.reset();
      }
    };
    t.reset = function () { t.down = false; g.visible = true; };
    return t;
  }

  // ============ 移動靶 ============
  function mover(x, zA, zB, speed) {
    var t = baseTarget('mover', false);
    // 滑軌
    var railLen = Math.abs(zB - zA);
    var rail = U.box(0.3, 0.15, railLen + 1, 0x3a3f44);
    rail.position.set(x, 0.08, (zA + zB) / 2);
    G.scene.add(rail); G.worldMeshes.push(rail);
    U.addCollider(x, 0.08, (zA + zB) / 2, 0.3, 0.15, railLen + 1);

    var g = new THREE.Group();
    var car = U.box(0.35, 0.3, 0.5, 0xc8a028);
    car.position.y = 0.3;
    g.add(car);
    var poleM = U.box(0.08, 1.1, 0.08, 0x3a3f44);
    poleM.position.y = 0.95;
    g.add(poleM);
    if (!paperTexShared) paperTexShared = Tex.target();
    var board = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.4),
      new THREE.MeshLambertMaterial({ map: paperTexShared, side: THREE.DoubleSide }));
    board.position.y = 2.1;
    board.rotation.y = Math.PI / 2;
    g.add(board);
    var head = new THREE.Mesh(new THREE.CircleGeometry(0.12, 12),
      new THREE.MeshLambertMaterial({ color: 0x22242a, side: THREE.DoubleSide }));
    head.rotation.y = Math.PI / 2;
    head.position.set(0.01, 2.55, 0);
    g.add(head);
    board.userData.target = t; board.userData.zone = 'body';
    head.userData.target = t; head.userData.zone = 'head';
    t.meshes = [board, head];
    t.group = g;
    g.position.set(x, 0, zA);
    G.scene.add(g);
    G.targets.push(t);

    var dir = 1, pos = zA, pauseT = 0, hitCd = 0;
    t.onHit = function (zone, dmg, point) {
      if (hitCd > 0) return { killed: false, score: 0 };
      hitCd = 1;
      pauseT = 0.6;
      FX.paperHit(point);
      AudioSys.play('paper', { dist: camera_dist(point) });
      return { killed: false, score: zone === 'head' ? 45 : 30 };
    };
    t.update = function (dt) {
      if (hitCd > 0) hitCd -= dt;
      if (pauseT > 0) { pauseT -= dt; return; }
      pos += dir * speed * dt;
      if (pos > zB) { pos = zB; dir = -1; }
      if (pos < zA) { pos = zA; dir = 1; }
      g.position.z = pos;
    };
    t.reset = function () { pos = zA; dir = 1; pauseT = 0; hitCd = 0; g.position.z = pos; };
    return t;
  }

  // ============ 彈出靶 ============
  function popup(x, z, faceYaw) {
    var t = baseTarget('popup', true);
    // 地面槽
    var slot = U.box(0.7, 0.12, 0.3, 0x2c2f34);
    slot.position.set(x, 0.06, z);
    G.scene.add(slot); G.worldMeshes.push(slot);
    var pivot = new THREE.Group();
    pivot.position.set(x, 0.1, z);
    pivot.rotation.y = faceYaw;
    if (!paperTexShared) paperTexShared = Tex.target();
    var board = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 1.1),
      new THREE.MeshLambertMaterial({ map: paperTexShared, side: THREE.DoubleSide }));
    board.position.y = 0.55;
    pivot.add(board);
    var head = new THREE.Mesh(new THREE.CircleGeometry(0.11, 12),
      new THREE.MeshLambertMaterial({ color: 0x22242a, side: THREE.DoubleSide }));
    head.position.set(0, 0.92, 0.01);
    pivot.add(head);
    board.userData.target = t; board.userData.zone = 'body';
    head.userData.target = t; head.userData.zone = 'head';
    t.meshes = [board, head];
    t.group = pivot;
    G.scene.add(pivot);
    G.targets.push(t);

    var state = 'down';       // down | up | shot
    var timer = U.rand(1, 3); // 下次翻起
    pivot.rotation.x = -Math.PI / 2 + 0.05;
    t.alive = false;

    t.onHit = function (zone, dmg, point) {
      if (state !== 'up') return { killed: false, score: 0 };
      state = 'shot';
      t.down = true;
      t.alive = false;
      timer = G.challenge.active ? 9999 : U.rand(6, 9);
      FX.paperHit(point);
      AudioSys.play('paper', { dist: camera_dist(point) });
      return { killed: true, score: zone === 'head' ? 38 : 25 };
    };
    t.update = function (dt) {
      timer -= dt;
      var targetRot;
      if (state === 'down' || state === 'shot') {
        targetRot = -Math.PI / 2 + 0.05;
        if (timer <= 0 && state === 'down') {
          state = 'up';
          t.alive = true;
          timer = U.rand(1.6, 3);
          AudioSys.play('popup', { dist: camera_dist(pivot.position) });
        } else if (timer <= 0 && state === 'shot') {
          state = 'down'; t.down = false; timer = U.rand(1, 3);
        }
      } else {
        targetRot = 0;
        if (timer <= 0) { state = 'down'; t.alive = false; timer = U.rand(2, 4); }
      }
      pivot.rotation.x = U.lerp(pivot.rotation.x, targetRot, Math.min(1, dt * 8));
    };
    t.reset = function () {
      state = 'down'; t.down = false; t.alive = false;
      timer = U.rand(1, 3);
      pivot.rotation.x = -Math.PI / 2 + 0.05;
    };
    return t;
  }

  // ============ 建構全部 ============
  function build() {
    // —— 公園靶場（射擊線約 x=-36，靶面面向 +X）——
    // 紙靶：25m 排 6 個
    [30, 34, 38, 42, 46, 50].forEach(function (z) { paperTarget(-60, z, Math.PI / 2); });
    // 紙靶：40m 排 4 個
    [33, 39, 45, 51].forEach(function (z) { paperTarget(-74, z, Math.PI / 2); });
    // 紙靶：15m 近排 3 個
    [36, 40, 44].forEach(function (z) { paperTarget(-50, z, Math.PI / 2); });
    // 鋼靶架
    plateRack(-52, 55.5, 6, -Math.PI / 2);
    // 玻璃瓶桌兩張
    bottleTable(-48, 20, 5, Math.PI / 2);
    bottleTable(-56, 21, 4, Math.PI / 2);
    // 氣球
    var bcols = [0xe05050, 0x50a0e0, 0xe0c050, 0x9e60d0, 0x50d080];
    balloon(-46, 3.2, 30, bcols[0]); balloon(-52, 4.1, 36, bcols[1]);
    balloon(-58, 3.5, 44, bcols[2]); balloon(-66, 4.5, 40, bcols[3]);
    balloon(-70, 3.0, 52, bcols[4]); balloon(-62, 5.0, 56, bcols[0]);
    balloon(-44, 4.0, 48, bcols[1]); balloon(-76, 3.8, 34, bcols[2]);
    // 大道長距離靶（車站廣場前，給狙擊）
    paperTarget(56, 4, -Math.PI / 2);
    paperTarget(56, -4, -Math.PI / 2);
    paperTarget(64, 0, -Math.PI / 2);
    // 移動靶：公園 + 夜市巷
    mover(-65, 26, 42, 2.6);
    mover(41, 20, 56, 3.2);
    // 彈出靶：夜市巷 4 + 大道旁 2
    popup(38.6, 25, Math.PI / 2);
    popup(43.4, 33, -Math.PI / 2);
    popup(38.6, 41, Math.PI / 2);
    popup(43.4, 49, -Math.PI / 2);
    popup(-8, 7, Math.PI);
    popup(20, -7, 0);
  }

  function update(dt) {
    for (var i = 0; i < G.targets.length; i++) G.targets[i].update(dt);
  }

  function resetAll() {
    for (var i = 0; i < G.targets.length; i++) G.targets[i].reset();
  }

  function challengeTotal() {
    var n = 0;
    for (var i = 0; i < G.targets.length; i++) if (G.targets[i].challenge) n++;
    return n;
  }
  function challengeCleared() {
    var n = 0;
    for (var i = 0; i < G.targets.length; i++) {
      var t = G.targets[i];
      if (t.challenge && t.down) n++;
    }
    return n;
  }

  window.Range = { build: build, update: update, resetAll: resetAll, challengeTotal: challengeTotal, challengeCleared: challengeCleared };

  // ============ Targets 命中結算 ============
  window.Targets = {
    hit: function (mesh, point, weaponKey, dist) {
      var t = mesh.userData.target;
      if (!t) return null;
      var zone = mesh.userData.zone;
      var wd = WEAPON_DATA[weaponKey];
      var dmg = zone === 'head' && wd.headMult ? wd.damage * wd.headMult
        : (wd.melee ? (wd.damage) : wd.damage);
      // 距離衰減（刀不衰減）
      if (!wd.melee && dist > 30) {
        dmg *= U.clamp(1 - (dist - 30) * 0.00375, 0.4, 1);
      }
      dmg = Math.round(dmg);
      var r = t.onHit(zone, dmg, point);
      var isHead = zone === 'head';
      if (r.score > 0) {
        Game.addScore({
          points: r.score, head: isHead,
          type: t.type, name: targetName(t.type),
          killed: r.killed,
        });
      } else {
        HUD.hitmarker(isHead);
      }
      return { zone: zone, damage: dmg, killed: r.killed, score: r.score, type: t.type, name: targetName(t.type) };
    },
  };

  function targetName(type) {
    return {
      paper: '人形靶', plate: '鋼靶', bottle: '玻璃瓶',
      balloon: '氣球', mover: '移動靶', popup: '彈出靶',
    }[type] || '目標';
  }

  return window.Range;
})();
