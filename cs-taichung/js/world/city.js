/* world/city.js — 台中街景主建構：道路/建築/車站/公園地景/天空/燈光/雷達底圖 */
window.City = (function () {
  'use strict';

  var FONT = '"Microsoft JhengHei","PingFang TC",sans-serif';

  // 共用貼圖實例
  var T = {};
  // 共用材質
  var M = {};

  function buildMaterials() {
    T.asphalt = Tex.asphalt();
    T.sidewalk = Tex.sidewalk();
    T.crosswalk = Tex.crosswalk();
    T.grass = Tex.grass();
    T.brick = Tex.brick();
    T.lantern = Tex.lantern();

    M.road = new THREE.MeshLambertMaterial({ map: T.asphalt });
    M.walk = new THREE.MeshLambertMaterial({ map: T.sidewalk });
    M.grass = new THREE.MeshLambertMaterial({ map: T.grass });
    M.brick = new THREE.MeshLambertMaterial({ map: T.brick });
    M.concrete = U.mat(0x9a958c);
    M.dark = U.mat(0x2c2f34);
    M.white = U.mat(0xe8e4da);
    M.roof = U.mat(0x4a4440);
    M.pillar = U.mat(0x8a857c);
    M.trunk = U.mat(0x5a4632);
    M.steel = U.mat(0x6a7076);
  }

  // ---------- 道路 ----------
  function avenueTex() {
    // 一段 20m 的台灣大道：中央雙黃線 + 車道白線 + 柏油
    var t = Tex.make(512, 256, function (ctx, w, h) {
      ctx.fillStyle = '#3a3d42'; ctx.fillRect(0, 0, w, h);
      for (var i = 0; i < 1400; i++) {
        ctx.fillStyle = ['#33363b', '#41454b', '#2e3136'][i % 3];
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
      var cy = h / 2;
      // 中央雙黃線
      ctx.fillStyle = '#c8a028';
      ctx.fillRect(0, cy - 7, w, 4); ctx.fillRect(0, cy + 3, w, 4);
      // 車道虛線
      ctx.fillStyle = 'rgba(225,225,220,.85)';
      for (var x = 0; x < w; x += 64) {
        ctx.fillRect(x, cy - h * 0.26, 34, 4);
        ctx.fillRect(x, cy + h * 0.26, 34, 4);
      }
      // 路緣白線
      ctx.fillStyle = 'rgba(225,225,220,.9)';
      ctx.fillRect(0, 6, w, 4); ctx.fillRect(0, h - 10, w, 4);
    });
    t.wrapS = THREE.RepeatWrapping;
    return t;
  }

  function streetTex() {
    var t = Tex.make(256, 256, function (ctx, w, h) {
      ctx.fillStyle = '#3a3d42'; ctx.fillRect(0, 0, w, h);
      for (var i = 0; i < 700; i++) {
        ctx.fillStyle = ['#33363b', '#41454b', '#2e3136'][i % 3];
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
      ctx.fillStyle = '#c8a028';
      ctx.fillRect(w / 2 - 2, 0, 4, h);
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  function roads() {
    // 台灣大道（東西向 z -9..9，x -88..70）
    var av = new THREE.Mesh(new THREE.PlaneGeometry(158, 18), new THREE.MeshLambertMaterial({ map: avenueTex() }));
    av.material.map.repeat.set(8, 1);
    av.rotation.x = -Math.PI / 2;
    av.position.set(-9, 0.01, 0);
    av.receiveShadow = true;
    G.scene.add(av); G.worldMeshes.push(av);

    // 南北向街道（x -28..-20，z -52..70）
    var ns = new THREE.Mesh(new THREE.PlaneGeometry(8, 122), new THREE.MeshLambertMaterial({ map: streetTex() }));
    ns.material.map.repeat.set(1, 12);
    ns.rotation.x = -Math.PI / 2;
    ns.position.set(-24, 0.01, 9);
    ns.receiveShadow = true;
    G.scene.add(ns); G.worldMeshes.push(ns);

    // 車站前廣場
    var plaza = new THREE.Mesh(new THREE.PlaneGeometry(18, 30), M.walk.clone());
    plaza.material.map = T.sidewalk;
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(61, 0.012, 0);
    plaza.receiveShadow = true;
    G.scene.add(plaza); G.worldMeshes.push(plaza);

    // 人行道：大道兩側
    function walkStrip(cx, cz, w, d) {
      var tex = T.sidewalk.clone();
      tex.needsUpdate = true;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(Math.max(1, w / 3), Math.max(1, d / 3));
      var m = new THREE.Mesh(U.boxGeo(w, 0.12, d), new THREE.MeshLambertMaterial({ map: tex }));
      m.position.set(cx, 0.06, cz);
      m.receiveShadow = true;
      G.scene.add(m); G.worldMeshes.push(m);
      return m;
    }
    walkStrip(-9, -11.5, 158, 5);
    walkStrip(-9, 11.5, 158, 5);
    walkStrip(-24, -33, 12, 44);   // 北街兩側延伸
    walkStrip(-24, 42, 12, 56);

    // 斑馬線（大道與南北街交叉口、夜市巷口、車站前）
    function zebra(cx, cz, w, d, rotY) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: T.crosswalk, transparent: true }));
      m.rotation.x = -Math.PI / 2;
      m.rotation.z = rotY || 0;
      m.position.set(cx, 0.02, cz);
      m.receiveShadow = true;
      G.scene.add(m); G.worldMeshes.push(m);
    }
    zebra(-24, 0, 8, 16, 0);
    zebra(36, 10.5, 10, 3.4, Math.PI / 2);
    zebra(52, 0, 6, 16, 0);

    // 中央分隔島（大道，留路口缺口）
    function median(cx, cz, len) {
      var m = U.box(len, 0.35, 1.6, 0x7a756c);
      m.position.set(cx, 0.175, cz);
      U.registerWorld(m, { collide: true });
      // 頂上草皮
      var g = new THREE.Mesh(U.boxGeo(len - 0.2, 0.08, 1.3), M.grass);
      g.position.set(cx, 0.39, cz);
      G.scene.add(g); G.worldMeshes.push(g);
    }
    median(-56, 0, 60);
    median(6, 0, 48);
  }

  // ---------- 建築 ----------
  var facadeCache = {};
  function facadeTex(color, floors) {
    var key = color + '|' + floors;
    if (!facadeCache[key]) facadeCache[key] = Tex.facade({ color: color, floors: floors });
    return facadeCache[key];
  }
  var storeCache = {};
  function storeTex(name, bg, accent) {
    var key = name;
    if (!storeCache[key]) storeCache[key] = Tex.storefront(name, { bg: bg, accent: accent });
    return storeCache[key];
  }

  /**
   * 騎樓店舖建築
   * o: {x, z(正面臨街的座標), w(面寬), d(進深), floors, color, facing(1=面+Z, -1=面-Z), shop{name,bg,accent}, arcade}
   */
  function shopBuilding(o) {
    var g = new THREE.Group();
    var H = 3.2 + o.floors * 3; // 一樓 3.2m + 樓層
    var d = o.d;
    // 主體（含貼圖立面）
    var ft = facadeTex(o.color, o.floors);
    var bodyMat = new THREE.MeshLambertMaterial({ map: ft });
    var body = new THREE.Mesh(U.boxGeo(o.w, H, d), bodyMat);
    body.position.set(0, H / 2, -o.facing * d / 2);
    body.castShadow = true; body.receiveShadow = true;
    g.add(body);
    // 屋頂女兒牆
    var parapet = U.box(o.w + 0.3, 0.8, d + 0.3, 0x6a655e);
    parapet.position.set(0, H + 0.3, -o.facing * d / 2);
    g.add(parapet);
    // 屋頂水塔
    if (Math.random() < 0.7) {
      var tank = U.cyl(0.9, 0.9, 1.6, 0xb8bcc0, { seg: 10 });
      tank.position.set(U.rand(-o.w / 4, o.w / 4), H + 1.1, -o.facing * (d / 2));
      g.add(tank);
    }
    // 一樓店面（內縮 3m 騎樓）
    var setback = o.arcade ? 3 : 0.3;
    var sf = new THREE.Mesh(
      new THREE.PlaneGeometry(o.w - 0.4, 3.1),
      new THREE.MeshLambertMaterial({ map: storeTex(o.shop.name, o.shop.bg, o.shop.accent) })
    );
    sf.position.set(0, 1.55, -o.facing * setback + o.facing * 0.01);
    if (o.facing < 0) sf.rotation.y = Math.PI;
    g.add(sf);
    // 店面背板（貼圖後面補實體）
    var sfWall = U.box(o.w, 3.2, 0.25, 0x8a857c);
    sfWall.position.set(0, 1.6, -o.facing * (setback + 0.12));
    g.add(sfWall);
    // 騎樓柱
    if (o.arcade) {
      var n = Math.max(2, Math.round(o.w / 3.5));
      for (var i = 0; i < n; i++) {
        var px = -o.w / 2 + (i + 0.5) * (o.w / n);
        var col = U.box(0.4, 3.2, 0.4, 0x9a958c);
        col.position.set(px, 1.6, -o.facing * 0.2);
        g.add(col);
        // 柱碰撞（世界座標）
        U.addCollider(o.x + px, 1.6, o.z - o.facing * 0.2, 0.4, 3.2, 0.4);
      }
    }
    // 直式招牌（伸出立面）
    if (o.vsign && Math.random() < 0.85) {
      var st = Tex.sign(o.vsign, {
        vertical: true,
        bg: U.pick(['#f5f0e4', '#ffe9b0', '#e8f0f8', '#fff']),
        fg: U.pick(['#c22', '#1a3a6a', '#222', '#0a6a3a']),
      });
      var sw = 0.9, sh = 3.6;
      var signMesh = new THREE.Mesh(
        U.boxGeo(sw, sh, 0.14),
        new THREE.MeshLambertMaterial({ map: st, emissive: 0xffffff, emissiveMap: st, emissiveIntensity: 0.28 })
      );
      var sx = U.rand(-o.w / 3, o.w / 3);
      signMesh.position.set(sx, 4.6, o.facing * (sw / 2 + 0.1));
      g.add(signMesh);
    }
    g.position.set(o.x, 0, o.z);
    G.scene.add(g);
    g.traverse(function (m) { if (m.isMesh) G.worldMeshes.push(m); });
    // 碰撞：主體（3.2m 以上，騎樓可走入）+ 店面牆
    U.addCollider(o.x, 3.2 + (H - 3.2) / 2, o.z - o.facing * d / 2, o.w, H - 3.2, d);
    U.addCollider(o.x, 1.6, o.z - o.facing * (setback + 0.12), o.w, 3.2, 0.25);
    if (!o.arcade) U.addCollider(o.x, 1.6, o.z - o.facing * d / 2, o.w, 3.2, d);
    return g;
  }

  /** 簡單背景建築（天際線/邊界） */
  function blockBuilding(x, z, w, h, d, color) {
    var ft = facadeTex(color || U.pick([0xb0a08a, 0x9a9a92, 0xa89080, 0x8a95a0]), Math.max(2, Math.round(h / 3)));
    var m = new THREE.Mesh(U.boxGeo(w, h, d), new THREE.MeshLambertMaterial({ map: ft }));
    m.position.set(x, h / 2, z);
    m.castShadow = true; m.receiveShadow = true;
    U.registerWorld(m, { collide: true });
    return m;
  }

  // ---------- 北側商圈 ----------
  function northShops() {
    var shops = [
      { name: '7-ELEVEn', bg: '#f5f5f0', accent: '#e8600a', vsign: '便利商店' },
      { name: '50嵐', bg: '#f8c020', accent: '#1a4a8a', vsign: '50嵐' },
      { name: '老牌排骨便當', bg: '#8a1a1a', accent: '#ffd766', vsign: '便當' },
      { name: '大安藥局', bg: '#0a5a3a', accent: '#ffffff', vsign: '藥局' },
      { name: '急速網咖', bg: '#1a1a4a', accent: '#40c8ff', vsign: '網咖' },
      { name: '台灣大哥大', bg: '#e85a0a', accent: '#ffffff', vsign: '手機' },
      { name: '雞排大王', bg: '#c82a1a', accent: '#ffe9b0', vsign: '雞排' },
      { name: '清心福全', bg: '#0a4a7a', accent: '#ffd766', vsign: '清心' },
      { name: '美華藥妝', bg: '#c8386a', accent: '#ffffff', vsign: '藥妝' },
      { name: '中興租書', bg: '#4a4a48', accent: '#ffd766', vsign: '租書' },
    ];
    var colors = [0xc9b8a0, 0xd8a888, 0xa8b8c8, 0xb8c8a8, 0xc8a8b8, 0xd0c090];
    var x = -66;
    for (var i = 0; i < shops.length; i++) {
      var w = U.rand(11, 14);
      shopBuilding({
        x: x + w / 2, z: -14, w: w, d: 13,
        floors: U.randInt(2, 5), color: colors[i % colors.length],
        facing: 1, shop: shops[i], arcade: true, vsign: shops[i].vsign,
      });
      x += w + 0.4;
      if (x > 62) break;
    }
    // 後排建築（北邊界天際線）
    for (var bx = -84; bx < 88; bx += U.rand(16, 22)) {
      var bw = U.rand(13, 18);
      blockBuilding(bx + bw / 2, -U.rand(56, 66), bw, U.rand(14, 30), 12);
    }
    // 北巷內側（z -40..-52 一排，面向巷弄）
    for (var ax = -70; ax < 60; ax += U.rand(15, 20)) {
      var aw = U.rand(12, 16);
      blockBuilding(ax + aw / 2, -46, aw, U.rand(9, 16), 11);
    }
  }

  // ---------- 南側店舖（大道南邊） ----------
  function southShops() {
    var shops = [
      { name: '早安台北早餐', bg: '#e87a1a', accent: '#ffffff', vsign: '早餐' },
      { name: '85度C咖啡', bg: '#3a2a1a', accent: '#ffd766', vsign: '咖啡' },
      { name: '台中銀行', bg: '#1a3a5a', accent: '#e8e8e8', vsign: '銀行' },
      { name: '日藥本舖', bg: '#c82a5a', accent: '#ffffff', vsign: '藥妝' },
    ];
    var x = -16;
    for (var i = 0; i < shops.length; i++) {
      var w = 13;
      shopBuilding({
        x: x + w / 2, z: 14, w: w, d: 14,
        floors: U.randInt(3, 5), color: U.pick([0xc9b8a0, 0xb8c8d8, 0xd8c8a8]),
        facing: -1, shop: shops[i], arcade: true, vsign: shops[i].vsign,
      });
      x += w + 0.6;
    }
  }

  // ---------- 逢甲夜市巷 ----------
  function nightMarket() {
    // 巷：x 36..46，z 14..64；兩側低層建築
    var colors = [0xb89880, 0x9aa8b0, 0xc0a890, 0x8898a0];
    // 西側建築（面東）
    for (var z = 16; z < 62; z += U.rand(11, 14)) {
      var d = U.rand(10, 12);
      var h = U.rand(7, 12);
      var b = new THREE.Mesh(
        U.boxGeo(16, h, d),
        new THREE.MeshLambertMaterial({ map: facadeTex(U.pick(colors), 2) })
      );
      b.position.set(27, h / 2, z + d / 2);
      b.castShadow = true; b.receiveShadow = true;
      U.registerWorld(b, { collide: true });
    }
    // 東側建築（面西）
    for (var z2 = 16; z2 < 62; z2 += U.rand(11, 14)) {
      var d2 = U.rand(10, 12);
      var h2 = U.rand(7, 12);
      var b2 = new THREE.Mesh(
        U.boxGeo(16, h2, d2),
        new THREE.MeshLambertMaterial({ map: facadeTex(U.pick(colors), 2) })
      );
      b2.position.set(57, h2 / 2, z2 + d2 / 2);
      b2.castShadow = true; b2.receiveShadow = true;
      U.registerWorld(b2, { collide: true });
    }
    // 巷內地面（夜市地磚）
    var lane = new THREE.Mesh(new THREE.PlaneGeometry(10, 50), M.walk);
    lane.rotation.x = -Math.PI / 2;
    lane.position.set(41, 0.015, 39);
    lane.receiveShadow = true;
    G.scene.add(lane); G.worldMeshes.push(lane);

    // 入口拱門（z=14 面北）
    var p1 = U.box(0.8, 6.5, 0.8, 0xb8281c); p1.position.set(36.5, 3.25, 14.6);
    var p2 = U.box(0.8, 6.5, 0.8, 0xb8281c); p2.position.set(45.5, 3.25, 14.6);
    U.registerWorld(p1, { collide: true });
    U.registerWorld(p2, { collide: true });
    var beamTex = Tex.sign('逢甲夜市', { bg: '#b8281c', fg: '#ffd766', w: 512, h: 128 });
    var beam = new THREE.Mesh(U.boxGeo(10.2, 1.7, 0.5),
      new THREE.MeshLambertMaterial({ map: beamTex, emissive: 0xffffff, emissiveMap: beamTex, emissiveIntensity: 0.5 }));
    beam.position.set(41, 6.2, 14.6);
    G.scene.add(beam); G.worldMeshes.push(beam);

    // 霓虹招牌（兩側建築面）
    var neons = [
      { t: '鹽酥雞', c: '#ffb020' }, { t: '臭豆腐', c: '#40ff90' },
      { t: '大腸包小腸', c: '#ff5080' }, { t: '木瓜牛奶', c: '#ffa040' },
      { t: '烤玉米', c: '#ffe040' }, { t: '逢甲雞排', c: '#ff4040' },
    ];
    for (var i = 0; i < neons.length; i++) {
      var nt = Tex.neon(neons[i].t, neons[i].c);
      var nm = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.4),
        new THREE.MeshLambertMaterial({ map: nt, emissive: 0xffffff, emissiveMap: nt, emissiveIntensity: 0.9, transparent: true }));
      var west = i % 2 === 0;
      nm.position.set(west ? 35.2 : 46.8, U.rand(3.5, 6), 20 + i * 7.5);
      nm.rotation.y = west ? Math.PI / 2 : -Math.PI / 2;
      G.scene.add(nm); G.worldMeshes.push(nm);
    }
  }

  // ---------- 公園靶場地景 ----------
  function park() {
    // 草皮
    var grass = new THREE.Mesh(new THREE.PlaneGeometry(56, 60), M.grass);
    T.grass.repeat.set(8, 8);
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(-56, 0.008, 40);
    grass.receiveShadow = true;
    G.scene.add(grass); G.worldMeshes.push(grass);

    // 環園步道
    var path = new THREE.Mesh(new THREE.PlaneGeometry(56, 4), M.walk);
    path.rotation.x = -Math.PI / 2;
    path.position.set(-56, 0.014, 14);
    G.scene.add(path); G.worldMeshes.push(path);
    var path2 = new THREE.Mesh(new THREE.PlaneGeometry(4, 52), M.walk);
    path2.rotation.x = -Math.PI / 2;
    path2.position.set(-32, 0.014, 40);
    G.scene.add(path2); G.worldMeshes.push(path2);

    // 靶場鋪面（西半部水泥地，給靶道）
    var pad = new THREE.Mesh(new THREE.PlaneGeometry(46, 34), M.concrete);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(-59, 0.012, 42);
    pad.receiveShadow = true;
    G.scene.add(pad); G.worldMeshes.push(pad);

    // 圍牆（靶場安全區）：東牆留入口
    function wall(cx, cz, w, d) {
      var m = U.box(w, 1.1, d, 0x9a958c);
      m.position.set(cx, 0.55, cz);
      U.registerWorld(m, { collide: true });
      var cap = U.box(w + 0.1, 0.12, d + 0.1, 0x6a655e);
      cap.position.set(cx, 1.16, cz);
      G.scene.add(cap); G.worldMeshes.push(cap);
    }
    wall(-56, 11, 56, 0.4);            // 北牆
    wall(-56, 69, 56, 0.4);            // 南牆
    wall(-83.8, 40, 0.4, 58);          // 西牆
    wall(-28.2, 22, 0.4, 22);          // 東牆北段
    wall(-28.2, 60, 0.4, 18);          // 東牆南段（z 34..50 開口）

    // 擋彈壁（靶場最西端，高 4m 土堤+牆）
    var berm = U.box(1.5, 4, 40, 0x7a6a50);
    berm.position.set(-82, 2, 42);
    U.registerWorld(berm, { collide: true });
  }

  // ---------- 台中車站 ----------
  function station() {
    var g = new THREE.Group();
    // 主體紅磚
    var body = new THREE.Mesh(U.boxGeo(12, 13, 26), M.brick);
    body.position.set(0, 6.5, 0);
    body.castShadow = true; body.receiveShadow = true;
    g.add(body);
    // 白色飾帶
    [3.2, 6.4, 9.6].forEach(function (y) {
      var band = U.box(12.2, 0.5, 26.2, 0xf0ead8, { castShadow: false });
      band.position.set(0, y, 0);
      g.add(band);
    });
    // 中央山牆 + 鐘
    var gable = U.box(3.5, 4.5, 6, 0xf0ead8);
    gable.position.set(-5.2, 14.5, 0);
    g.add(gable);
    var clockM = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.3, 24),
      [U.mat(0xf0ead8), new THREE.MeshLambertMaterial({ map: Tex.clock() }), U.mat(0xf0ead8)]);
    clockM.rotation.z = Math.PI / 2;
    clockM.rotation.y = Math.PI / 2;
    clockM.position.set(-7.1, 14.5, 0);
    g.add(clockM);
    // 站名
    var nameT = Tex.sign('台中車站', { bg: '#f0ead8', fg: '#7a2018', w: 512, h: 110 });
    var nameM = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.9),
      new THREE.MeshLambertMaterial({ map: nameT }));
    nameM.position.set(-6.05, 11.2, 0);
    nameM.rotation.y = -Math.PI / 2;
    g.add(nameM);
    // 入口拱廊
    for (var i = -1; i <= 1; i++) {
      var arch = U.box(0.7, 4.5, 3.4, 0xf0ead8);
      arch.position.set(-6.2, 2.25, i * 8);
      g.add(arch);
    }
    // 屋頂
    var roof = U.box(12.8, 0.7, 26.8, 0x4a5a4a);
    roof.position.set(0, 13.3, 0);
    g.add(roof);
    // 兩翼
    [-1, 1].forEach(function (s) {
      var wing = new THREE.Mesh(U.boxGeo(9, 8, 14), M.brick);
      wing.position.set(1, 4, s * 20);
      wing.castShadow = true;
      g.add(wing);
      var wroof = U.box(9.6, 0.6, 14.6, 0x4a5a4a);
      wroof.position.set(1, 8.3, s * 20);
      g.add(wroof);
    });
    g.position.set(78, 0, 0);
    G.scene.add(g);
    g.traverse(function (m) { if (m.isMesh) G.worldMeshes.push(m); });
    // 碰撞（整體一個大盒 + 拱廊間可走近）
    U.addCollider(78, 7, 0, 12, 14, 26);
    U.addCollider(79, 4, 20, 9, 8, 14);
    U.addCollider(79, 4, -20, 9, 8, 14);
  }

  // ---------- 邊界 ----------
  function perimeter() {
    // 南邊界建築群
    for (var x = -84; x < 88; x += U.rand(16, 22)) {
      var w = U.rand(14, 18);
      blockBuilding(x + w / 2, U.rand(70, 80), w, U.rand(12, 26), 12);
    }
    // 西邊界
    for (var z = -52; z < 8; z += U.rand(16, 22)) {
      var w2 = U.rand(14, 18);
      blockBuilding(-84, z + w2 / 2, 10, U.rand(12, 24), w2);
    }
    // 東北角
    for (var z2 = -52; z2 < -10; z2 += U.rand(16, 22)) {
      var w3 = U.rand(14, 18);
      blockBuilding(82, z2 + w3 / 2, 10, U.rand(12, 22), w3);
    }
    // 東南角
    for (var z3 = 12; z3 < 66; z3 += U.rand(16, 22)) {
      var w4 = U.rand(14, 18);
      blockBuilding(82, z3 + w4 / 2, 10, U.rand(12, 22), w4);
    }
  }

  // ---------- 天空 / 遠山 / 光 ----------
  function sky() {
    // 漸層穹頂
    var skyTex = Tex.make(64, 256, function (ctx, w, h) {
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#1a2a4e');
      g.addColorStop(0.42, '#4a5a8e');
      g.addColorStop(0.68, '#c87a4e');
      g.addColorStop(0.85, '#f0a858');
      g.addColorStop(1, '#ffd898');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
    var dome = new THREE.Mesh(
      new THREE.SphereGeometry(380, 24, 16),
      new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })
    );
    G.scene.add(dome);

    // 遠山剪影（圓筒環繞）
    var mTex = Tex.make(1024, 128, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#3a3a58';
      ctx.beginPath();
      ctx.moveTo(0, h);
      var y = h * 0.5;
      for (var x = 0; x <= w; x += 24) {
        y += (Math.random() - 0.5) * 26;
        y = U.clamp(y, h * 0.25, h * 0.8);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
      // 遠層
      ctx.fillStyle = 'rgba(90,80,120,.6)';
      ctx.beginPath(); ctx.moveTo(0, h);
      y = h * 0.65;
      for (var x2 = 0; x2 <= w; x2 += 32) {
        y += (Math.random() - 0.5) * 18;
        y = U.clamp(y, h * 0.45, h * 0.85);
        ctx.lineTo(x2, y);
      }
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    });
    mTex.wrapS = THREE.RepeatWrapping; mTex.repeat.set(3, 1);
    var mountains = new THREE.Mesh(
      new THREE.CylinderGeometry(300, 300, 110, 32, 1, true),
      new THREE.MeshBasicMaterial({ map: mTex, side: THREE.BackSide, transparent: true, fog: false })
    );
    mountains.position.y = 30;
    G.scene.add(mountains);

    // 雲
    var cloudTex = Tex.make(128, 64, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < 18; i++) {
        var g = ctx.createRadialGradient(
          w * 0.2 + Math.random() * w * 0.6, h * 0.3 + Math.random() * h * 0.4, 2,
          w * 0.5, h * 0.5, w * 0.4);
        g.addColorStop(0, 'rgba(255,230,210,.5)');
        g.addColorStop(1, 'rgba(255,230,210,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    });
    for (var c = 0; c < 6; c++) {
      var cm = new THREE.Mesh(new THREE.PlaneGeometry(U.rand(60, 110), U.rand(16, 26)),
        new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false, opacity: 0.8 }));
      var a = Math.random() * Math.PI * 2;
      cm.position.set(Math.cos(a) * U.rand(150, 280), U.rand(70, 120), Math.sin(a) * U.rand(150, 280));
      cm.lookAt(0, cm.position.y, 0);
      G.scene.add(cm);
    }

    // 霧與燈光
    G.scene.fog = new THREE.Fog(0xe8b988, 90, 340);
    var hemi = new THREE.HemisphereLight(0x8090c0, 0x8a6a4a, 0.55);
    G.scene.add(hemi);
    var sun = new THREE.DirectionalLight(0xffd9a0, 1.15);
    sun.position.set(-110, 75, -70);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -115; sun.shadow.camera.right = 115;
    sun.shadow.camera.top = 115; sun.shadow.camera.bottom = -115;
    sun.shadow.camera.near = 20; sun.shadow.camera.far = 320;
    sun.shadow.bias = -0.0008;
    G.scene.add(sun);
    G.scene.add(sun.target);
    G.sunLight = sun;
    // 暖色環境補光
    var amb = new THREE.AmbientLight(0xffd0a0, 0.22);
    G.scene.add(amb);
  }

  // ---------- 地面基底 ----------
  function ground() {
    var g = new THREE.Mesh(new THREE.PlaneGeometry(700, 700),
      new THREE.MeshLambertMaterial({ color: 0x6a6a60 }));
    g.rotation.x = -Math.PI / 2;
    g.position.y = -0.02;
    g.receiveShadow = true;
    G.scene.add(g); G.worldMeshes.push(g);
  }

  // ---------- 雷達底圖 ----------
  function radar() {
    var cv = document.createElement('canvas');
    cv.width = 512; cv.height = 512;
    var ctx = cv.getContext('2d');
    var s = 512 / 192; // px/m
    function rect(x1, z1, x2, z2, color) {
      ctx.fillStyle = color;
      ctx.fillRect(256 + x1 * s, 256 + z1 * s, (x2 - x1) * s, (z2 - z1) * s);
    }
    ctx.fillStyle = '#10161e'; ctx.fillRect(0, 0, 512, 512);
    rect(-84, 10, -28, 70, '#1d3320');          // 公園
    rect(-88, -9, 70, 9, '#3a4250');            // 大道
    rect(-28, -52, -20, 70, '#3a4250');         // 南北街
    rect(36, 14, 46, 64, '#4a3a50');            // 夜市巷
    rect(-70, -28, 66, -14, '#5a6472');         // 北商圈建築帶
    rect(18, 14, 36, 64, '#5a6472');
    rect(46, 14, 66, 64, '#5a6472');
    rect(-16, 14, 40, 28, '#5a6472');           // 南店面（概略）
    rect(72, -27, 86, 27, '#6a4a3a');           // 車站
    rect(-59, 25, -36, 59, '#3a4a3a');          // 靶場鋪面
    G.radar = { canvas: cv, scale: s, cx: 0, cz: 0 };
  }

  function build() {
    buildMaterials();
    ground();
    roads();
    northShops();
    southShops();
    nightMarket();
    park();
    station();
    perimeter();
    sky();
    radar();
  }

  return { build: build };
})();
