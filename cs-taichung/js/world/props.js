/* world/props.js — 台灣街景道具：機車/電線桿/路燈/紅綠燈/燈籠串/小吃攤/公園樹木涼亭 */
window.Props = (function () {
  'use strict';

  var FONT = '"Microsoft JhengHei","PingFang TC",sans-serif';

  // ---------- 機車 ----------
  function scooter(color) {
    var g = new THREE.Group();
    var bodyMat = U.mat(color);
    // 車身
    var body = U.box(0.42, 0.34, 1.5, 0, { material: bodyMat });
    body.position.set(0, 0.55, 0);
    g.add(body);
    // 坐墊
    var seat = U.box(0.4, 0.12, 0.8, 0x222226);
    seat.position.set(0, 0.78, 0.25);
    g.add(seat);
    // 龍頭
    var head = U.box(0.36, 0.4, 0.24, 0, { material: bodyMat });
    head.position.set(0, 0.85, -0.62);
    head.rotation.x = 0.2;
    g.add(head);
    // 把手
    var bar = U.cyl(0.025, 0.025, 0.5, 0x333333, { seg: 6 });
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 1.06, -0.66);
    g.add(bar);
    // 後照鏡
    [-1, 1].forEach(function (s) {
      var stalk = U.cyl(0.012, 0.012, 0.22, 0x222222, { seg: 5 });
      stalk.position.set(s * 0.22, 1.18, -0.66);
      g.add(stalk);
      var mirror = U.box(0.12, 0.08, 0.02, 0x1a1a1e);
      mirror.position.set(s * 0.24, 1.3, -0.66);
      g.add(mirror);
    });
    // 輪胎
    [-0.62, 0.62].forEach(function (z) {
      var wheel = U.cyl(0.19, 0.19, 0.1, 0x1a1a1a, { seg: 12 });
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(0, 0.19, z);
      g.add(wheel);
    });
    // 車牌
    var plate = U.box(0.16, 0.1, 0.01, 0xf0f0e8);
    plate.position.set(0, 0.5, 0.76);
    g.add(plate);
    return g;
  }

  function scooterRow(x, z, n, rotY) {
    for (var i = 0; i < n; i++) {
      var s = scooter(U.pick([0xe8e8e8, 0x22242a, 0xc83a2a, 0x2a5a8a, 0x3a8a5a, 0xe8a03a]));
      var off = (i - (n - 1) / 2) * 0.85;
      s.position.set(x + Math.cos(rotY) * off, 0, z + Math.sin(rotY) * off);
      s.rotation.y = rotY + Math.PI / 2 + U.rand(-0.06, 0.06);
      G.scene.add(s);
      s.traverse(function (m) { if (m.isMesh) G.worldMeshes.push(m); });
      U.addCollider(s.position.x, 0.7, s.position.z, 0.5, 1.4, 1.5);
    }
  }

  // ---------- 電線桿 + 垂墜電線 ----------
  var poleTops = [];
  function pole(x, z) {
    var p = U.cyl(0.14, 0.17, 9, 0x8a857c, { seg: 8 });
    p.position.set(x, 4.5, z);
    U.registerWorld(p, { collide: true, pad: 0.1 });
    // 橫擔
    var arm = U.box(0.12, 0.12, 2.2, 0x6a655e);
    arm.position.set(x, 8.2, z);
    G.scene.add(arm); G.worldMeshes.push(arm);
    var arm2 = U.box(0.12, 0.12, 1.6, 0x6a655e);
    arm2.position.set(x, 7.4, z);
    G.scene.add(arm2); G.worldMeshes.push(arm2);
    // 小廣告
    var ad = U.box(0.5, 0.7, 0.02, 0, {
      material: new THREE.MeshLambertMaterial({
        map: Tex.sign(U.pick(['租', '售', '借錢', '開鎖']), {
          vertical: true, bg: '#f8e840', fg: '#c22', w: 64, h: 96,
        }),
      }),
    });
    ad.position.set(x + 0.15, 2.2, z);
    ad.rotation.y = Math.PI / 2;
    G.scene.add(ad); G.worldMeshes.push(ad);
    poleTops.push(new THREE.Vector3(x, 8.2, z));
  }

  function wireBetween(a, b) {
    var mid = a.clone().lerp(b, 0.5);
    mid.y -= a.distanceTo(b) * 0.045; // 垂墜
    var curve = new THREE.CatmullRomCurve3([a, mid, b]);
    var geo = new THREE.TubeGeometry(curve, 10, 0.02, 4);
    var m = new THREE.Mesh(geo, U.mat(0x1a1a1e, { castShadow: false }));
    m.castShadow = false;
    G.scene.add(m);
  }

  function polesAndWires() {
    // 大道北側
    var xs = [];
    for (var x = -80; x <= 64; x += 18) { pole(x, -13.2); xs.push(x); }
    for (var i = 0; i < poleTops.length - 1; i++) {
      wireBetween(poleTops[i], poleTops[i + 1]);
      wireBetween(poleTops[i].clone().setY(7.4), poleTops[i + 1].clone().setY(7.4));
    }
  }

  // ---------- 路燈 ----------
  function streetLamp(x, z, rotY) {
    var g = new THREE.Group();
    var poleM = U.cyl(0.08, 0.11, 6.5, 0x4a5a5e, { seg: 8 });
    poleM.position.y = 3.25;
    g.add(poleM);
    var arm = U.cyl(0.06, 0.06, 2.2, 0x4a5a5e, { seg: 6 });
    arm.rotation.z = Math.PI / 2;
    arm.position.set(1.0, 6.4, 0);
    g.add(arm);
    var lampTex = Tex.make(32, 32, function (ctx, w, h) {
      ctx.fillStyle = '#ffd9a0'; ctx.fillRect(0, 0, w, h);
    });
    var head = U.box(0.7, 0.16, 0.3, 0, {
      material: new THREE.MeshLambertMaterial({ color: 0x3a4a4e, emissive: 0xffc070, emissiveIntensity: 0.9 }),
    });
    head.position.set(2.0, 6.35, 0);
    g.add(head);
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    G.scene.add(g);
    g.traverse(function (m) { if (m.isMesh) G.worldMeshes.push(m); });
    U.addCollider(x, 3.25, z, 0.25, 6.5, 0.25);
  }

  // ---------- 紅綠燈 ----------
  function trafficLight(x, z, rotY) {
    var g = new THREE.Group();
    var poleM = U.cyl(0.09, 0.12, 5.2, 0x3a3f44, { seg: 8 });
    poleM.position.y = 2.6;
    g.add(poleM);
    var arm = U.box(3.6, 0.14, 0.14, 0x3a3f44);
    arm.position.set(1.7, 5.1, 0);
    g.add(arm);
    var boxM = U.box(0.5, 1.3, 0.3, 0x22262a);
    boxM.position.set(3.2, 4.4, 0);
    g.add(boxM);
    var lights = [0xff3a2a, 0xffc02a, 0x3ae05a];
    for (var i = 0; i < 3; i++) {
      var on = i === 2; // 綠燈亮
      var lamp = U.cyl(0.14, 0.14, 0.05, 0, {
        seg: 12,
        material: new THREE.MeshLambertMaterial({
          color: on ? lights[i] : 0x30281a,
          emissive: on ? lights[i] : 0x000000,
          emissiveIntensity: on ? 1.2 : 0,
        }),
      });
      lamp.rotation.x = Math.PI / 2;
      lamp.position.set(3.2, 4.85 - i * 0.42, 0.16);
      g.add(lamp);
    }
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    G.scene.add(g);
    g.traverse(function (m) { if (m.isMesh) G.worldMeshes.push(m); });
    U.addCollider(x, 2.6, z, 0.25, 5.2, 0.25);
  }

  // ---------- 路牌 ----------
  function roadSign(x, z, text, rotY) {
    var g = new THREE.Group();
    var poleM = U.cyl(0.06, 0.06, 3.4, 0x5a6068, { seg: 6 });
    poleM.position.y = 1.7;
    g.add(poleM);
    var t = Tex.sign(text, { bg: '#1a4a8a', fg: '#ffffff', w: 256, h: 72 });
    var board = new THREE.Mesh(U.boxGeo(2.2, 0.6, 0.06),
      new THREE.MeshLambertMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.2 }));
    board.position.y = 3.3;
    g.add(board);
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    G.scene.add(g);
    g.traverse(function (m) { if (m.isMesh) G.worldMeshes.push(m); });
    U.addCollider(x, 1.7, z, 0.15, 3.4, 0.15);
  }

  // ---------- 夜市燈籠串 ----------
  function lanternString(x1, z1, x2, z2, y, n) {
    var a = new THREE.Vector3(x1, y, z1), b = new THREE.Vector3(x2, y, z2);
    var mid = a.clone().lerp(b, 0.5); mid.y -= 0.5;
    var curve = new THREE.CatmullRomCurve3([a, mid, b]);
    var rope = new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.015, 4), U.mat(0x2a1a12));
    rope.castShadow = false;
    G.scene.add(rope);
    var lanternMat = new THREE.MeshLambertMaterial({
      map: Tex.lantern(), emissive: 0xff6a3a, emissiveIntensity: 0.55,
    });
    for (var i = 1; i <= n; i++) {
      var p = curve.getPoint(i / (n + 1));
      var l = new THREE.Mesh(U.cylGeo(0.22, 0.22, 0.4, 10), lanternMat);
      l.position.copy(p); l.position.y -= 0.28;
      l.castShadow = false;
      G.scene.add(l); G.worldMeshes.push(l);
      // 穗
      var tassel = U.cyl(0.02, 0.05, 0.14, 0xe8b93c, { seg: 5, castShadow: false });
      tassel.position.copy(p); tassel.position.y -= 0.55;
      G.scene.add(tassel);
    }
  }

  // ---------- 小吃攤 ----------
  function foodStall(x, z, rotY, name, accent) {
    var g = new THREE.Group();
    // 攤車台
    var counter = U.box(2.4, 0.95, 1.2, 0x8a6a4a);
    counter.position.y = 0.475;
    g.add(counter);
    // 台面
    var top = U.box(2.5, 0.06, 1.3, 0xd8d0c0);
    top.position.y = 0.98;
    g.add(top);
    // 食物色塊
    for (var i = 0; i < 4; i++) {
      var food = U.box(0.4, 0.14, 0.4, U.pick([0xe0a040, 0xc05030, 0x80a040, 0xe0d0a0]));
      food.position.set(-0.8 + i * 0.55, 1.08, 0);
      g.add(food);
    }
    // 立柱 + 遮陽棚
    [-1.1, 1.1].forEach(function (sx) {
      var p = U.cyl(0.04, 0.04, 2.3, 0x5a5a58, { seg: 6 });
      p.position.set(sx, 1.15, -0.5);
      g.add(p);
    });
    var awnT = Tex.make(128, 64, function (ctx, w, h) {
      for (var i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? accent : '#f0ece0';
        ctx.fillRect(i * w / 8, 0, w / 8, h);
      }
    });
    var awn = new THREE.Mesh(U.boxGeo(2.7, 0.06, 1.6),
      new THREE.MeshLambertMaterial({ map: awnT }));
    awn.position.set(0, 2.3, 0);
    awn.rotation.x = 0.12;
    g.add(awn);
    // 招牌
    var st = Tex.sign(name, { bg: '#2a2a30', fg: accent, w: 256, h: 64 });
    var signM = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.55),
      new THREE.MeshLambertMaterial({ map: st, emissive: 0xffffff, emissiveMap: st, emissiveIntensity: 0.6 }));
    signM.position.set(0, 1.85, 0.63);
    g.add(signM);
    // 燈泡
    var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6),
      new THREE.MeshLambertMaterial({ color: 0xfff0c0, emissive: 0xffd980, emissiveIntensity: 1.5 }));
    bulb.position.set(0, 2.1, 0.5);
    g.add(bulb);
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    G.scene.add(g);
    g.traverse(function (m) { if (m.isMesh) G.worldMeshes.push(m); });
    U.addCollider(x, 0.6, z, 2.5, 1.2, 1.3);
  }

  // ---------- 公園：樹 / 涼亭 / 長椅 / 花台 ----------
  function tree(x, z, scale) {
    scale = scale || 1;
    var g = new THREE.Group();
    var trunk = U.cyl(0.14 * scale, 0.2 * scale, 2.6 * scale, 0x5a4632, { seg: 7 });
    trunk.position.y = 1.3 * scale;
    g.add(trunk);
    var greens = [0x4a7a34, 0x558540, 0x3f6e2e];
    for (var i = 0; i < 3; i++) {
      var r = (1.5 - i * 0.32) * scale;
      var crown = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), U.mat(greens[i % 3]));
      crown.position.set(U.rand(-0.3, 0.3) * scale, (2.4 + i * 0.75) * scale, U.rand(-0.3, 0.3) * scale);
      crown.castShadow = true;
      g.add(crown);
    }
    g.position.set(x, 0, z);
    G.scene.add(g);
    g.traverse(function (m) { if (m.isMesh) G.worldMeshes.push(m); });
    U.addCollider(x, 1.3 * scale, z, 0.35 * scale, 2.6 * scale, 0.35 * scale);
  }

  function pavilion(x, z) {
    var g = new THREE.Group();
    // 六角平台
    var base = U.cyl(3.2, 3.4, 0.5, 0x9a958c, { seg: 6 });
    base.position.y = 0.25;
    g.add(base);
    // 六根紅柱
    for (var i = 0; i < 6; i++) {
      var a = i / 6 * Math.PI * 2;
      var px = Math.cos(a) * 2.5, pz = Math.sin(a) * 2.5;
      var col = U.cyl(0.14, 0.14, 2.8, 0xa8281c, { seg: 8 });
      col.position.set(px, 1.9, pz);
      g.add(col);
      U.addCollider(x + px, 1.9, z + pz, 0.3, 2.8, 0.3);
    }
    // 攢尖頂（兩層）
    var roof1 = U.cyl(0.3, 3.4, 1.5, 0x2a6a4a, { seg: 6 });
    roof1.position.y = 4.0;
    g.add(roof1);
    var roof2 = U.cyl(0.05, 1.6, 0.9, 0x2a6a4a, { seg: 6 });
    roof2.position.y = 5.1;
    g.add(roof2);
    var finial = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), U.mat(0xe8b93c));
    finial.position.y = 5.6;
    g.add(finial);
    // 座位環
    var seatRing = U.cyl(2.6, 2.6, 0.45, 0x7a6a5a, { seg: 6 });
    seatRing.position.y = 0.6;
    g.add(seatRing);
    g.position.set(x, 0, z);
    G.scene.add(g);
    g.traverse(function (m) { if (m.isMesh) G.worldMeshes.push(m); });
  }

  function bench(x, z, rotY) {
    var g = new THREE.Group();
    var seat = U.box(1.8, 0.08, 0.5, 0x8a6a4a);
    seat.position.y = 0.45;
    g.add(seat);
    var back = U.box(1.8, 0.45, 0.07, 0x8a6a4a);
    back.position.set(0, 0.75, -0.22);
    back.rotation.x = -0.15;
    g.add(back);
    [-0.75, 0.75].forEach(function (sx) {
      var leg = U.box(0.08, 0.45, 0.45, 0x3a3f44);
      leg.position.set(sx, 0.225, 0);
      g.add(leg);
    });
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    G.scene.add(g);
    g.traverse(function (m) { if (m.isMesh) G.worldMeshes.push(m); });
    U.addCollider(x, 0.45, z, 1.8, 0.9, 0.55);
  }

  function flowerBed(x, z) {
    var ring = U.cyl(2.2, 2.4, 0.55, 0x9a958c, { seg: 12 });
    ring.position.set(x, 0.275, z);
    U.registerWorld(ring, { collide: true });
    var soil = U.cyl(2.0, 2.0, 0.5, 0x4a3828, { seg: 12 });
    soil.position.set(x, 0.35, z);
    G.scene.add(soil); G.worldMeshes.push(soil);
    for (var i = 0; i < 9; i++) {
      var a = Math.random() * Math.PI * 2, r = Math.random() * 1.6;
      var bush = new THREE.Mesh(new THREE.SphereGeometry(U.rand(0.25, 0.45), 7, 5),
        U.mat(U.pick([0x4a7a34, 0x558540, 0x6a8a3a])));
      bush.position.set(x + Math.cos(a) * r, 0.7, z + Math.sin(a) * r);
      bush.castShadow = true;
      G.scene.add(bush); G.worldMeshes.push(bush);
    }
  }

  // ---------- 雜物 ----------
  function busStop(x, z) {
    var g = new THREE.Group();
    [-1.8, 1.8].forEach(function (sx) {
      var p = U.box(0.12, 2.6, 0.12, 0x4a5a5e);
      p.position.set(sx, 1.3, 0);
      g.add(p);
    });
    var roof = U.box(4.4, 0.1, 1.4, 0x3a6a8a);
    roof.position.y = 2.6;
    g.add(roof);
    var t = Tex.sign('台灣大道幹線公車站', { bg: '#1a4a8a', fg: '#fff', w: 384, h: 64 });
    var board = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.6),
      new THREE.MeshLambertMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.35 }));
    board.position.set(0, 2.2, 0);
    g.add(board);
    var seatB = U.box(3.4, 0.07, 0.4, 0x8a6a4a);
    seatB.position.set(0, 0.55, -0.3);
    g.add(seatB);
    g.position.set(x, 0, z);
    G.scene.add(g);
    g.traverse(function (m) { if (m.isMesh) G.worldMeshes.push(m); });
    U.addCollider(x - 1.8, 1.3, z, 0.15, 2.6, 0.15);
    U.addCollider(x + 1.8, 1.3, z, 0.15, 2.6, 0.15);
  }

  function mailBox(x, z) {
    var g = new THREE.Group();
    var body = U.box(0.55, 1.1, 0.45, 0xc0281c);
    body.position.y = 0.55;
    g.add(body);
    var cap = U.box(0.6, 0.08, 0.5, 0x901a12);
    cap.position.y = 1.14;
    g.add(cap);
    g.position.set(x, 0, z);
    G.scene.add(g);
    g.traverse(function (m) { if (m.isMesh) G.worldMeshes.push(m); });
    U.addCollider(x, 0.55, z, 0.55, 1.1, 0.45);
  }

  function trafficCone(x, z) {
    var c = U.cyl(0.03, 0.2, 0.55, 0xe85a1a, { seg: 8 });
    c.position.set(x, 0.275, z);
    G.scene.add(c); G.worldMeshes.push(c);
    var stripe = U.cyl(0.13, 0.16, 0.1, 0xf0f0e8, { seg: 8 });
    stripe.position.set(x, 0.32, z);
    G.scene.add(stripe); G.worldMeshes.push(stripe);
  }

  function trashCan(x, z) {
    var c = U.cyl(0.32, 0.28, 0.8, 0x3a6a3a, { seg: 10 });
    c.position.set(x, 0.4, z);
    U.registerWorld(c, { collide: true });
  }

  // ---------- 主建構 ----------
  function build() {
    // 機車排：商圈騎樓前、夜市巷口
    scooterRow(-40, -12.6, 9, 0);
    scooterRow(20, -12.6, 7, 0);
    scooterRow(30, 12.6, 6, 0);
    scooterRow(52, 12.6, 5, 0);

    // 電線桿 + 電線（大道北側）
    polesAndWires();

    // 路燈（大道兩側交錯）
    for (var x = -72; x <= 56; x += 24) streetLamp(x, -10.2, Math.PI);
    for (var x2 = -60; x2 <= 60; x2 += 24) streetLamp(x2, 10.2, 0);

    // 紅綠燈（大道 x 南北街口）
    trafficLight(-30.5, -10.5, Math.PI);
    trafficLight(-17.5, 10.5, 0);
    trafficLight(48, -10.5, Math.PI / 2);

    // 路牌
    roadSign(-46, -10.4, '台灣大道 Taiwan Blvd.', 0);
    roadSign(14, -10.4, '台灣大道 Taiwan Blvd.', 0);
    roadSign(38, 12.4, '逢甲路', Math.PI);

    // 夜市燈籠串（橫跨巷子）
    for (var z = 19; z <= 60; z += 5) {
      lanternString(36, z, 46, z, 4.6 + (z % 10) * 0.03, 5);
    }
    // 巷口再一串
    lanternString(36.5, 15.5, 45.5, 15.5, 5.4, 4);

    // 小吃攤（夜市巷兩側）
    foodStall(38.2, 22, Math.PI / 2, '鹽酥雞', '#ffb020');
    foodStall(43.8, 28, -Math.PI / 2, '臭豆腐', '#40ff90');
    foodStall(38.2, 36, Math.PI / 2, '木瓜牛奶', '#ffa040');
    foodStall(43.8, 44, -Math.PI / 2, '烤玉米', '#ffe040');
    foodStall(38.2, 52, Math.PI / 2, '大腸包小腸', '#ff5080');

    // 公園
    tree(-34, 16, 1.1); tree(-44, 13.5, 0.9); tree(-70, 15, 1.2);
    tree(-80, 20, 1.0); tree(-33, 64, 1.0); tree(-50, 66.5, 1.15);
    tree(-70, 66, 0.95); tree(-80.5, 58, 1.05);
    pavilion(-44, 58);
    bench(-36, 18, Math.PI); bench(-34, 30, Math.PI / 2);
    bench(-52, 66, 0); bench(-66, 13.2, Math.PI);
    flowerBed(-40, 24);
    trashCan(-33.5, 20); trashCan(-30, 46);

    // 大道雜物
    busStop(24, -11.2);
    mailBox(-8, -10.6);
    trafficCone(-2, 6); trafficCone(-1, 3.4); trafficCone(-3.2, 4.2);
    trashCan(30, -10.8); trashCan(-52, 10.8);

    // 車站廣場裝飾
    flowerBed(58, 8);
    flowerBed(58, -8);
    bench(62, 12, Math.PI);
  }

  return { build: build };
})();
