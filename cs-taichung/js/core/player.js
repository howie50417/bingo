/* core/player.js — 玩家移動控制器：WASD/衝刺/蹲/跳/重力/AABB 碰撞 */
window.Player = (function () {
  'use strict';

  var camera = null;
  var vel = null;          // 垂直速度只用 y；水平直接依輸入
  var eyeH = CFG.EYE_STAND;
  var stepAcc = 0;         // 腳步聲距離累積

  var api = {
    pos: null,             // 腳底位置 Vector3
    yaw: 0, pitch: 0,
    crouching: false, grounded: true, sprinting: false, moving: false,
    speed: 0,
  };

  api.init = function (cam) {
    camera = cam;
    api.pos = new THREE.Vector3(-12, 0, 34);
    api.yaw = Math.PI * 0.5;   // 面向 -X（公園靶場方向）
    api.pitch = 0;
    vel = new THREE.Vector3();
    camera.rotation.order = 'YXZ';
    syncCamera();
  };

  function syncCamera() {
    camera.position.set(api.pos.x, api.pos.y + eyeH, api.pos.z);
    camera.rotation.set(api.pitch, api.yaw, 0);
  }

  api.applyRecoil = function (pitchKick, yawKick) {
    api.pitch = U.clamp(api.pitch + pitchKick, -1.53, 1.53);
    api.yaw += yawKick;
  };

  // 圓柱 vs AABB 清單的推出
  function resolveCollisions(p, r, height) {
    for (var i = 0; i < G.colliders.length; i++) {
      var b = G.colliders[i];
      // 垂直重疊檢查（玩家 y ~ y+height）
      if (p.y + height < b.min.y + 0.02 || p.y + 0.5 > b.max.y) continue;
      var cx = U.clamp(p.x, b.min.x, b.max.x);
      var cz = U.clamp(p.z, b.min.z, b.max.z);
      var dx = p.x - cx, dz = p.z - cz;
      var d2 = dx * dx + dz * dz;
      if (d2 < r * r) {
        if (d2 > 1e-8) {
          var d = Math.sqrt(d2);
          p.x = cx + (dx / d) * r;
          p.z = cz + (dz / d) * r;
        } else {
          // 圓心在盒內：往最近面推出
          var px = Math.min(p.x - b.min.x + r, b.max.x - p.x + r);
          var pz = Math.min(p.z - b.min.z + r, b.max.z - p.z + r);
          if (px < pz) {
            p.x = (p.x - b.min.x < b.max.x - p.x) ? b.min.x - r : b.max.x + r;
          } else {
            p.z = (p.z - b.min.z < b.max.z - p.z) ? b.min.z - r : b.max.z + r;
          }
        }
      }
    }
  }

  api.update = function (dt) {
    // 視角
    var sens = 0.0022 * G.settings.sens;
    var inv = G.settings.invertY ? -1 : 1;
    api.yaw -= Input.dx * sens;
    api.pitch = U.clamp(api.pitch - Input.dy * sens * inv, -1.53, 1.53);

    // 蹲
    api.crouching = Input.key('ControlLeft') || Input.key('KeyC');
    var targetEye = api.crouching ? CFG.EYE_CROUCH : CFG.EYE_STAND;
    eyeH = U.lerp(eyeH, targetEye, Math.min(1, dt * 10));

    // 移動輸入
    var fx = 0, fz = 0;
    if (Input.key('KeyW')) fz -= 1;
    if (Input.key('KeyS')) fz += 1;
    if (Input.key('KeyA')) fx -= 1;
    if (Input.key('KeyD')) fx += 1;
    var has = fx !== 0 || fz !== 0;
    api.sprinting = Input.key('ShiftLeft') && fz < 0 && !api.crouching;
    var spd = api.crouching ? CFG.CROUCH_SPEED : (api.sprinting ? CFG.SPRINT : CFG.WALK);

    var mvx = 0, mvz = 0;
    if (has) {
      var len = Math.sqrt(fx * fx + fz * fz);
      fx /= len; fz /= len;
      var sin = Math.sin(api.yaw), cos = Math.cos(api.yaw);
      // 將本地 WASD 方向依相機 yaw 旋轉到世界座標。
      // Three.js 的相機朝本地 -Z；yaw 為正時，前方會轉向 -X。
      mvx = (fx * cos + fz * sin) * spd;
      mvz = (fz * cos - fx * sin) * spd;
    }
    api.speed = has ? spd : 0;
    api.moving = has;

    var p = api.pos;
    p.x += mvx * dt;
    p.z += mvz * dt;

    // 重力 + 跳
    if (api.grounded && Input.pressed('Space')) {
      vel.y = CFG.JUMP;
      api.grounded = false;
    }
    if (!api.grounded) {
      vel.y -= CFG.GRAVITY * dt;
      p.y += vel.y * dt;
      if (p.y <= 0) { p.y = 0; vel.y = 0; api.grounded = true; }
    }

    resolveCollisions(p, CFG.PLAYER_RADIUS, eyeH);

    // 邊界
    p.x = U.clamp(p.x, CFG.BOUNDS.minX, CFG.BOUNDS.maxX);
    p.z = U.clamp(p.z, CFG.BOUNDS.minZ, CFG.BOUNDS.maxZ);

    // 腳步聲
    if (api.grounded && has) {
      stepAcc += spd * dt;
      var stride = api.sprinting ? 3.1 : 2.4;
      if (stepAcc >= stride) {
        stepAcc = 0;
        AudioSys.play('footstep');
      }
    } else {
      stepAcc = 0;
    }

    syncCamera();
  };

  return api;
})();
