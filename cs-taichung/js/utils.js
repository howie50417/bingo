/* utils.js — 共用工具：隨機、數學、材質快取、碰撞註冊 */
window.U = (function () {
  'use strict';

  function rand(a, b) { return a + Math.random() * (b - a); }
  function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // 材質快取：同顏色+參數共用一個 LambertMaterial，降低程式數
  var matCache = new Map();
  function mat(color, opts) {
    opts = opts || {};
    var key = color + '|' + (opts.emissive || 0) + '|' + (opts.emissiveIntensity || 0) +
      '|' + (opts.transparent ? 1 : 0) + '|' + (opts.opacity == null ? 1 : opts.opacity) +
      '|' + (opts.map ? opts.map.uuid : '') + '|' + (opts.flat ? 1 : 0);
    if (matCache.has(key)) return matCache.get(key);
    var m = new THREE.MeshLambertMaterial({
      color: color,
      map: opts.map || null,
      transparent: !!opts.transparent,
      opacity: opts.opacity == null ? 1 : opts.opacity,
    });
    if (opts.emissive) {
      m.emissive = new THREE.Color(opts.emissive);
      m.emissiveIntensity = opts.emissiveIntensity == null ? 1 : opts.emissiveIntensity;
    }
    matCache.set(key, m);
    return m;
  }

  // 幾何快取：同尺寸 Box 共用
  var geoCache = new Map();
  function boxGeo(w, h, d) {
    var key = 'b' + w + ',' + h + ',' + d;
    if (!geoCache.has(key)) geoCache.set(key, new THREE.BoxGeometry(w, h, d));
    return geoCache.get(key);
  }
  function cylGeo(rt, rb, h, seg) {
    var key = 'c' + rt + ',' + rb + ',' + h + ',' + seg;
    if (!geoCache.has(key)) geoCache.set(key, new THREE.CylinderGeometry(rt, rb, h, seg || 10));
    return geoCache.get(key);
  }

  // 快速建 Box Mesh
  function box(w, h, d, color, opts) {
    opts = opts || {};
    var mesh = new THREE.Mesh(boxGeo(w, h, d), opts.material || mat(color, opts));
    mesh.castShadow = opts.castShadow !== false;
    mesh.receiveShadow = opts.receiveShadow !== false;
    return mesh;
  }
  function cyl(rt, rb, h, color, opts) {
    opts = opts || {};
    var mesh = new THREE.Mesh(cylGeo(rt, rb, h, opts.seg), opts.material || mat(color, opts));
    mesh.castShadow = opts.castShadow !== false;
    mesh.receiveShadow = opts.receiveShadow !== false;
    return mesh;
  }

  // 由世界座標中心+尺寸建 AABB 並推入 G.colliders
  function addCollider(cx, cy, cz, w, h, d) {
    var b = new THREE.Box3(
      new THREE.Vector3(cx - w / 2, cy - h / 2, cz - d / 2),
      new THREE.Vector3(cx + w / 2, cy + h / 2, cz + d / 2)
    );
    G.colliders.push(b);
    return b;
  }

  // 由 mesh 的位置與幾何參數推 AABB（僅適用無旋轉或 yaw 旋轉不大的盒狀物）
  function colliderFromMesh(mesh, pad) {
    pad = pad || 0;
    mesh.updateWorldMatrix(true, false);
    var b = new THREE.Box3().setFromObject(mesh);
    b.min.subScalar(pad); b.max.addScalar(pad);
    G.colliders.push(b);
    return b;
  }

  // 註冊世界物件：加進場景、子彈可打、可選碰撞
  function registerWorld(mesh, opts) {
    opts = opts || {};
    G.scene.add(mesh);
    if (opts.shootable !== false) {
      mesh.traverse(function (o) { if (o.isMesh) G.worldMeshes.push(o); });
      if (mesh.isMesh && G.worldMeshes.indexOf(mesh) === -1) G.worldMeshes.push(mesh);
    }
    if (opts.collide) colliderFromMesh(mesh, opts.pad || 0);
    return mesh;
  }

  return {
    rand: rand, randInt: randInt, pick: pick, clamp: clamp, lerp: lerp,
    mat: mat, box: box, cyl: cyl, boxGeo: boxGeo, cylGeo: cylGeo,
    addCollider: addCollider, colliderFromMesh: colliderFromMesh,
    registerWorld: registerWorld,
  };
})();
