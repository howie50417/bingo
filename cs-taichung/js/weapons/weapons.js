/* weapons/weapons.js — 射擊邏輯：切槍/後座力/散佈/換彈/開鏡/揮刀（CS 手感） */
window.Weapons = (function () {
  'use strict';

  var camera = null, scene = null;
  var ray = null;

  var current = 'rifle';
  var ammo = { knife: { mag: 1, res: 0 }, pistol: { mag: 20, res: 120 }, rifle: { mag: 30, res: 90 }, sniper: { mag: 10, res: 30 } };

  var fireCd = 0;          // 射擊冷卻
  var bloom = 0;           // 連發散佈累積
  var reloading = false, reloadT = 0;
  var switching = false, switchT = 0, pendingSwitch = null;
  var bolting = false, boltT = 0, needBolt = false;
  var inspecting = false, inspectT = 0;
  var scoped = false, zoomLevel = 0;   // 0=關 1/2=兩段
  var fovTarget = 75;
  var BASE_FOV = 75;
  var recoilShots = 0;     // 連發計數（後座模式用）

  var api = {};
  Object.defineProperty(api, 'current', { get: function () { return current; } });
  Object.defineProperty(api, 'data', { get: function () { return WEAPON_DATA[current]; } });
  Object.defineProperty(api, 'mag', { get: function () { return ammo[current].mag; } });
  Object.defineProperty(api, 'reserveAmmo', { get: function () { return ammo[current].res; } });
  Object.defineProperty(api, 'reloading', { get: function () { return reloading; } });
  Object.defineProperty(api, 'switching', { get: function () { return switching; } });
  Object.defineProperty(api, 'scoped', { get: function () { return scoped; } });
  Object.defineProperty(api, 'zoomLevel', { get: function () { return zoomLevel; } });
  Object.defineProperty(api, 'spread', { get: computeSpread });

  api.init = function (cam, sc) {
    camera = cam; scene = sc;
    ray = new THREE.Raycaster();
    ray.far = 400;
    ViewModels.show(current);
  };

  function computeSpread() {
    var d = WEAPON_DATA[current];
    if (d.melee) return 0;
    var s = d.spreadBase + bloom;
    var speedRatio = U.clamp(Player.speed / CFG.SPRINT, 0, 1);
    s += d.spreadMove * speedRatio;
    if (!Player.grounded) s *= 1.5;
    if (Player.crouching) s *= 0.7;
    if (current === 'sniper' && !scoped) s *= 8;
    if (current === 'sniper' && scoped && speedRatio > 0.05) s += 0.01;
    return s;
  }

  // ---------- 切槍 ----------
  function switchTo(key) {
    if (key === current || switching) return;
    switching = true;
    switchT = 0.28;
    pendingSwitch = key;
    cancelReload();
    unscope();
    AudioSys.play('click');
  }

  function cycle(dir) {
    var i = WEAPON_ORDER.indexOf(current);
    i = (i + dir + WEAPON_ORDER.length) % WEAPON_ORDER.length;
    switchTo(WEAPON_ORDER[i]);
  }

  // ---------- 開鏡 ----------
  function unscope() {
    if (scoped) {
      scoped = false; zoomLevel = 0;
      fovTarget = BASE_FOV;
      ViewModels.scope(false);
      HUD.setScope(false, 0);
    }
  }

  function cycleScope() {
    if (current !== 'sniper') return;
    if (reloading || switching) return;
    zoomLevel = (zoomLevel + 1) % 3;
    scoped = zoomLevel > 0;
    if (scoped) {
      fovTarget = BASE_FOV / WEAPON_DATA.sniper.zoom[zoomLevel - 1];
    } else {
      fovTarget = BASE_FOV;
    }
    ViewModels.scope(scoped);
    HUD.setScope(scoped, zoomLevel);
    AudioSys.play('click');
  }

  // ---------- 換彈 ----------
  function cancelReload() { reloading = false; reloadT = 0; }

  function startReload() {
    var d = WEAPON_DATA[current];
    if (d.melee || reloading || switching) return;
    var a = ammo[current];
    if (a.mag >= d.mag || a.res <= 0) return;
    reloading = true;
    reloadT = d.reload;
    unscope();
    ViewModels.reload(d.reload);
    AudioSys.play('reload_start');
  }

  function finishReload() {
    var d = WEAPON_DATA[current];
    var a = ammo[current];
    var need = d.mag - a.mag;
    var take = Math.min(need, a.res);
    a.mag += take;
    a.res -= take;
    AudioSys.play('reload_end');
  }

  // ---------- 射擊 ----------
  function shootables() {
    var list = G.worldMeshes.slice();
    for (var i = 0; i < G.targets.length; i++) {
      var t = G.targets[i];
      if (!t.alive) continue;
      for (var j = 0; j < t.meshes.length; j++) list.push(t.meshes[j]);
    }
    return list;
  }

  var _dir = new THREE.Vector3();
  var _origin = new THREE.Vector3();
  var _right = new THREE.Vector3();
  var _muzzle = new THREE.Vector3();
  var _eject = new THREE.Vector3();
  var _hitP = new THREE.Vector3();

  function fire(heavy) {
    var d = WEAPON_DATA[current];

    // 刀
    if (d.melee) {
      fireCd = heavy ? d.heavyRate : d.rate;
      ViewModels.swing(heavy);
      AudioSys.play('knife');
      camera.getWorldDirection(_dir);
      _origin.copy(camera.position);
      ray.set(_origin, _dir);
      ray.far = d.range;
      var hits = ray.intersectObjects(shootables(), false);
      if (hits.length > 0) {
        var h = hits[0];
        if (h.object.userData.target) {
          Targets.hit(h.object, h.point, current, h.distance);
        } else {
          FX.impact(h.point, h.face ? h.face.normal : _dir.clone().negate());
        }
      }
      ray.far = 400;
      return;
    }

    var a = ammo[current];
    if (a.mag <= 0) {
      AudioSys.play('dryfire');
      fireCd = 0.3;
      startReload();
      return;
    }
    a.mag--;
    G.stats.shots++;
    fireCd = 60 / d.rpm;
    bloom = Math.min(bloom + d.bloom, d.bloom * 8);
    recoilShots++;

    // 射線（含散佈）
    var spread = computeSpread();
    camera.getWorldDirection(_dir);
    _dir.x += U.rand(-spread, spread);
    _dir.y += U.rand(-spread, spread);
    _dir.z += U.rand(-spread, spread);
    _dir.normalize();
    ray.set(camera.position, _dir);

    var hits2 = ray.intersectObjects(shootables(), false);
    var endPoint;
    if (hits2.length > 0) {
      var h2 = hits2[0];
      endPoint = h2.point;
      if (h2.object.userData.target) {
        Targets.hit(h2.object, h2.point, current, h2.distance);
      } else {
        var n = h2.face ? h2.face.normal.clone() : new THREE.Vector3(0, 1, 0);
        // 法線轉世界方向（近似：直接取面法線即可，因多為軸對齊面）
        FX.bulletHole(h2.point, n);
        FX.impact(h2.point, n);
      }
    } else {
      endPoint = _hitP.copy(camera.position).addScaledVector(_dir, 200);
    }

    // 特效
    ViewModels.muzzleWorld(_muzzle);
    FX.muzzleFlash(_muzzle, _dir);
    FX.tracer(_muzzle, endPoint);
    ViewModels.ejectWorld(_eject);
    camera.getWorldDirection(_right);
    _right.cross(camera.up).normalize(); // 相機右方
    FX.shell(_eject, _right);

    // 聲音與後座
    AudioSys.play('shot_' + current);
    var kickPitch = d.recoil;
    var kickYaw = 0;
    if (d.auto && recoilShots > 3) {
      kickPitch = d.recoil * 0.7;
      kickYaw = U.rand(-d.recoil * 0.55, d.recoil * 0.55);
    } else {
      kickYaw = U.rand(-d.recoil * 0.2, d.recoil * 0.2);
    }
    if (scoped) { kickPitch *= 0.6; kickYaw *= 0.6; }
    Player.applyRecoil(kickPitch, kickYaw);
    ViewModels.kick(d.recoil * 2.2);

    // AWP 拉槍機
    if (current === 'sniper') {
      needBolt = true;
    }
  }

  // ---------- update ----------
  api.update = function (dt) {
    if (G.state !== 'playing') return;
    var d = WEAPON_DATA[current];

    // 冷卻與衰減
    if (fireCd > 0) fireCd -= dt;
    bloom = Math.max(0, bloom - dt * 4 * (d.bloom || 0.005));
    if (fireCd <= 0 && !Input.mouse(0)) recoilShots = 0;

    // FOV 平滑
    if (Math.abs(camera.fov - fovTarget) > 0.1) {
      camera.fov = U.lerp(camera.fov, fovTarget, Math.min(1, dt * 10));
      camera.updateProjectionMatrix();
    }

    // 切槍輸入
    if (Input.pressed('Digit1')) switchTo('knife');
    if (Input.pressed('Digit2')) switchTo('pistol');
    if (Input.pressed('Digit3')) switchTo('rifle');
    if (Input.pressed('Digit4')) switchTo('sniper');
    if (Input.pressed('KeyQ')) cycle(1);
    if (Input.wheel !== 0) cycle(Input.wheel);

    // 切槍進程
    if (switching) {
      switchT -= dt;
      if (switchT <= 0 && pendingSwitch) {
        current = pendingSwitch;
        pendingSwitch = null;
        ViewModels.show(current);
        // 換武器等 0.27s 後可射（show 動畫 0.32s）
        switchT = -0.27;
      } else if (switchT <= -0.27 && !pendingSwitch) {
        switching = false;
      }
    }

    // 換彈進程
    if (reloading) {
      reloadT -= dt;
      if (reloadT <= 0) {
        reloading = false;
        finishReload();
      }
    }

    // 拉槍機進程
    if (bolting) {
      boltT -= dt;
      if (boltT <= 0) bolting = false;
    }

    // 檢視進程
    if (inspecting) {
      inspectT -= dt;
      if (inspectT <= 0) inspecting = false;
    }

    // 操作
    if (Input.pressed('KeyR')) startReload();
    if (Input.pressed('KeyF') && !reloading && !switching && !inspecting) {
      inspecting = true;
      inspectT = 2.0;
      ViewModels.inspect();
    }

    var busy = reloading || switching || bolting || inspecting;

    // 右鍵：狙擊開鏡 / 刀重擊
    if (Input.mousePressed(2) && !busy) {
      if (current === 'sniper') cycleScope();
      else if (d.melee && fireCd <= 0) fire(true);
    }

    // 左鍵開火
    var wantFire = d.auto ? Input.mouse(0) : Input.mousePressed(0);
    if (wantFire && !busy && fireCd <= 0) {
      if (needBolt && current === 'sniper') {
        // 先拉槍機
        needBolt = false;
        bolting = true;
        boltT = d.bolt * 0.35;
        ViewModels.bolt();
        AudioSys.play('bolt');
        fireCd = d.bolt;
      } else {
        fire(false);
      }
    }

    // 視覺更新
    ViewModels.update(dt, {
      moving: Player.moving, sprinting: Player.sprinting,
      crouching: Player.crouching, speed: Player.speed, grounded: Player.grounded,
    });
  };

  return api;
})();
