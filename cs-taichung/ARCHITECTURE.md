# CS:TAICHUNG 台中訓練場 — 架構與介面契約

純前端 Three.js (r128, UMD) FPS 訓練場。所有 JS 皆為 **classic script**（禁止 ES module / import），
依序由 `index.html` 載入，透過全域命名空間溝通。直接雙擊 `index.html`（file://）即可執行，
禁止任何 `fetch` / 外部資源請求（字體、貼圖、音效全部由程式產生）。

## 載入順序（index.html 固定）

1. `js/lib/three.min.js` → 全域 `THREE`
2. `js/config.js` → `G`, `CFG`, `WEAPON_DATA`
3. `js/utils.js` → `U`
4. `js/core/input.js` → `Input`
5. `js/core/audio.js` → `AudioSys`
6. `js/world/textures.js` → `Tex`
7. `js/world/effects.js` → `FX`
8. `js/world/city.js` → `City`
9. `js/world/props.js` → `Props`
10. `js/world/range.js` → `Range`, `Targets`
11. `js/weapons/viewmodels.js` → `ViewModels`
12. `js/weapons/weapons.js` → `Weapons`
13. `js/ui/hud.js` → `HUD`
14. `js/ui/menu.js` → `Menu`
15. `js/core/player.js` → `Player`
16. `js/main.js` → `Game`（最後，負責 init 全部）

每個檔案用 IIFE 包住：`window.Xxx = (function(){ ... return api; })();`

## 全域共享狀態 `G`（config.js 定義）

```js
G = {
  renderer, scene, camera, canvas,          // main.js 建立
  colliders: [THREE.Box3],                  // 靜態 AABB 碰撞盒（世界座標，玩家用）
  worldMeshes: [THREE.Mesh],                // 可產生彈孔的靜態網格（raycast 用）
  targets: [],                              // Range 註冊的目標（見下）
  state: 'menu',                            // 'menu' | 'playing' | 'paused'
  score: 0, combo: 0, comboT: 0,
  stats: { shots:0, hits:0, heads:0, kills:0 },
  settings: { sens:1.0, vol:0.8, quality:'high', invertY:false },
  time: 0,                                  // 遊玩累計秒數（playing 時累加）
  challenge: { active:false, t:0, best:Number(localStorage...) || 0 },
  radar: null,                              // City 填入 {canvas, scale, cx, cz}
  sunLight: null,                           // City 填入 DirectionalLight（品質切換用）
}
```

## 座標與單位

- 1 單位 = 1 公尺。Y 向上。地面 y=0。
- 地圖可玩範圍約 x,z ∈ [-88, 88]（`CFG.BOUNDS`）。
- 台灣大道為東西向（沿 X 軸，z=0）；逢甲夜市巷在南側；公園靶場在西側；
  一中商圈在北側；台中車站在東端當視覺終點。
- camera.rotation.order = 'YXZ'；yaw 繞 Y、pitch 繞 X。yaw=0 面朝 -Z。

## 模組 API 契約

### `CFG`（config.js）
`EYE_STAND:1.62, EYE_CROUCH:1.05, GRAVITY:22, WALK:4.4, SPRINT:6.8, CROUCH_SPEED:2.2,
JUMP:7.2, PLAYER_RADIUS:0.35, BOUNDS:{minX,maxX,minZ,maxZ}`

### `WEAPON_DATA`（config.js）
```js
knife : {slot:1, name:'小刀',      en:'KNIFE',    melee:true, damage:40, heavyDamage:65,
         rate:0.42, heavyRate:1.0, range:2.4, price:0}
pistol: {slot:2, name:'格洛克 18', en:'GLOCK-18', damage:30, headMult:4, rpm:400, mag:20,
         reserve:120, reload:2.2, auto:false, spreadBase:0.010, spreadMove:0.020,
         bloom:0.006, recoil:0.011, price:400}
rifle : {slot:3, name:'AK-47',     en:'AK-47',    damage:36, headMult:4, rpm:600, mag:30,
         reserve:90, reload:2.5, auto:true,  spreadBase:0.012, spreadMove:0.030,
         bloom:0.010, recoil:0.020, price:2700}
sniper: {slot:4, name:'AWP',       en:'AWP',      damage:115, headMult:4, rpm:41, mag:10,
         reserve:30, reload:3.2, auto:false, bolt:1.45, spreadBase:0.001,
         spreadMove:0.05, bloom:0, recoil:0.06, zoom:[2.25,6], price:4750}
```

### `U`（utils.js）
`rand(a,b)`, `randInt(a,b)`, `pick(arr)`, `clamp(v,a,b)`, `lerp(a,b,t)`,
`mat(color, opts)` → MeshLambertMaterial（快取重用）,
`box(w,h,d,color,opts)` → Mesh（castShadow 依 opts）,
`addCollider(meshOrBox3, pad=0)` → 推入 G.colliders 並回傳 Box3,
`colliderFromMesh(mesh, pad)` → 由 mesh 位置/尺寸建 AABB,
`registerWorld(mesh, {collide=true, shootable=true})` → 加入 scene + worldMeshes + collider。

### `Input`（core/input.js）
- `Input.init(canvas)`
- `Input.key(code)` → 按住（'KeyW','ShiftLeft','Space','ControlLeft','Tab'...）
- `Input.pressed(code)` → 單次觸發（每幀末清除）
- `Input.mouse(btn)` / `Input.mousePressed(btn)`：0=左 2=右
- `Input.dx, Input.dy` → 本幀滑鼠位移（pointer lock 下累加，每幀末清零）
- `Input.wheel` → 本幀滾輪方向 +1/-1/0
- `Input.locked` → pointer lock 狀態
- `Input.requestLock()` / `Input.exitLock()`
- `Input.endFrame()` → main loop 每幀最後呼叫
- 需 `e.preventDefault()` 擋 Tab/右鍵選單。pointerlockchange 時若從 locked→unlocked
  且 `G.state==='playing'`，呼叫 `Game.pause()`。

### `AudioSys`（core/audio.js）
全部 WebAudio 合成，無音檔。`AudioSys.unlock()`（首次使用者手勢）、
`AudioSys.setVolume(v)`、`AudioSys.play(name, {dist}={})`（dist>0 依距離衰減）、
`AudioSys.ambience()`（城市環境底噪 loop，只啟動一次）。
音效名：`shot_pistol, shot_rifle, shot_sniper, knife, dryfire, reload_start, reload_end,
bolt, ping, glass, pop, paper, popup, hit, headshot, footstep, click, score, win`

### `Player`（core/player.js）
- `Player.init(camera)`
- `Player.pos`（THREE.Vector3，腳底）、`Player.yaw`、`Player.pitch`
- `Player.crouching / grounded / sprinting / moving`（bool）、`Player.speed`（2D m/s）
- `Player.update(dt)`：WASD 移動、Shift 衝刺、Ctrl/C 蹲、Space 跳、重力、
  對 G.colliders 做 AABB 碰撞（圓柱近似）、BOUNDS 限制、寫入 camera 位置與旋轉
- `Player.applyRecoil(pitchKick, yawKick)`：後座力（直接加在 pitch/yaw，可帶回復由 Weapons 處理）
- 移動音效（腳步）由此依移動距離觸發 `AudioSys.play('footstep')`。
- 出生點：公園靶場射擊線附近 `(-12, 0, 34)`，面向西邊靶場（yaw ≈ -Math.PI/2 可自行調整到好看的方向）。

### `Tex`（world/textures.js）— 全部回傳 `THREE.CanvasTexture`
產生器（簽名固定，其他模組會用）：
- `Tex.make(w,h,drawFn)` → CanvasTexture（設 `encoding = THREE.sRGBEncoding`、`anisotropy=4`）
- `Tex.target()` → 人形剪影靶紙（含頭/身分區、環線）— Range 用
- `Tex.plate()` → 圓形鋼靶面（金屬+紅白環）
- `Tex.bottle()` → 玻璃瓶標籤貼圖
- `Tex.balloon(hex)` → 氣球面
- `Tex.sign(text, {bg,fg,vertical,w,h})` → 中文招牌（vertical=true 為直式）
- `Tex.storefront(name, {bg,accent})` → 一樓店面門面（玻璃門+遮陽棚+店名）
- `Tex.facade({floors,color,style})` → 建築立面（窗格、冷氣、鐵窗隨機）
- `Tex.asphalt()` / `Tex.sidewalk()` / `Tex.crosswalk()` / `Tex.brick()` / `Tex.lantern()`
其他內部貼圖自由新增。中文用 canvas `fillText`，字體用
`'Microsoft JhengHei','PingFang TC','Noto Sans TC',sans-serif`。

### `FX`（world/effects.js）
- `FX.init(scene)` / `FX.update(dt, camera)`
- `FX.muzzleFlash(pos, dir)`：火光 quad + PointLight 閃爍（共用一盞燈避免大量光源）
- `FX.tracer(from, to)`：曳光（細長 additive 面片或 Line，快速飛行或瞬顯漸消）
- `FX.impact(point, normal)`：火花+塵粒
- `FX.bulletHole(point, normal)`：黑色小圓 decal 面片，沿 normal 偏移 0.01；上限 96 個循環回收
- `FX.shell(pos, dir)`：拋殼（小黃銅盒體，抛物線+落地）
- `FX.shatter(point, hexColor)`：玻璃碎裂粒子（瓶/窗）
- `FX.popBalloon(point, hexColor)`：氣球爆開粒子
- `FX.paperHit(point)`：紙靶紙屑
- `FX.damageNumber(point, amount, isHead)`：3D 浮動傷害數字（Sprite，上飄淡出，爆頭橘紅色放大）
粒子用共用 geometry/material 池，避免每幀 new。壽命管理在 update。

### `City`（world/city.js）
- `City.build()`：地面/道路/人行道/建築群/騎樓/店面招牌/天空穹頂/遠山/燈光（暖黃昏
  DirectionalLight 投影 + HemisphereLight）/霧。填 `G.colliders`、`G.worldMeshes`、
  `G.sunLight`、`G.radar = {canvas(512), scale(px/m), cx:0, cz:0}`（radar canvas 畫道路+建築俯視圖）。
- 規格見下方「地圖規格」。

### `Props`（world/props.js）
- `Props.build()`：機車、電線桿+垂電線、路燈、紅綠燈、夜市燈籠串、小吃攤、
  公園樹木/涼亭/長椅、屋頂水塔/招牌架、公車亭、垃圾桶、盆栽、拒馬等。
  重複物件用共用 geometry/material；每件實體 `U.registerWorld` 註冊碰撞。

### `Range` + `Targets`（world/range.js）
- `Range.build()`：建立全部訓練目標並註冊 `G.targets`
- `Range.update(dt)`：移動靶/彈出靶動態
- `Range.resetAll()`：全部目標復位
- `Range.challengeTotal()` / `Range.challengeCleared()`：計時挑戰進度
- 目標物件結構：
  ```js
  { id, type:'paper'|'plate'|'bottle'|'balloon'|'mover'|'popup',
    alive:true, challenge:true|false, meshes:[...], update(dt), reset(),
    onHit(zone, damage, point) -> {killed:bool, score:int} }
  ```
  每個可被擊中的 mesh：`mesh.userData.target = targetObj; mesh.userData.zone = 'head'|'body'|null`
- `Targets.hit(mesh, point, weaponKey, dist)` → `{zone, damage, killed, score, type, name}|null`
  由 Weapons 呼叫。內部：依 WEAPON_DATA 算傷害（head 乘 headMult、距離衰減
  dist>30m 起每 40m -15%、最低 40%），呼叫 target.onHit，播放音效/特效，
  命中回饋 `HUD.hitmarker(isHead)`，擊破時 `Game.addScore({points,head,type,name})`。
- 各類回饋：paper→中靶晃動+紙屑+留彈痕計分；plate→倒下金屬鏗聲；
  bottle→碎裂；balloon→爆；mover→命中停頓加分；popup→翻倒。
  被擊破目標 6~10 秒後自動復位（計時挑戰中不復位）。

### `ViewModels`（weapons/viewmodels.js）
- `ViewModels.buildAll(camera)`：四把武器低模模型（盒/柱拼裝，要有辨識度）掛 camera
- `ViewModels.show(key)`：顯示指定、其餘隱藏（切槍上抬動畫起點）
- `ViewModels.update(dt, s)`：s={moving,sprinting,crouching,speed,grounded} 走路搖擺+呼吸
- `ViewModels.kick(amount)`：射擊後座（往後+上跳，自動回彈）
- `ViewModels.reload(dur)` / `ViewModels.bolt()` / `ViewModels.swing(heavy)` / `ViewModels.inspect()`
- `ViewModels.scope(on)`：開鏡隱藏模型
- `ViewModels.muzzleWorld(v3)` / `ViewModels.ejectWorld(v3)`：槍口/拋殼口世界座標
- 槍口預置一個空 Object3D 名為 muzzle；狙擊槍要有瞄準鏡筒造型。

### `Weapons`（weapons/weapons.js）
- `Weapons.init(camera, scene)` / `Weapons.update(dt)`
- 唯讀狀態：`current`、`data`、`mag`、`reserveAmmo`、`spread`（總散佈弧度）、
  `scoped`、`zoomLevel`、`reloading`、`switching`
- 操作：Digit1~4 與滾輪切槍（0.55s 切槍動畫）、LMB 開火（rifle 全自動）、
  RMB：狙擊開鏡（兩段放大 FOV 75→33→12.5，開鏡時 `HUD.setScope(true)`）/ 刀重擊、
  R 換彈、F 檢視。
- 射擊流程：檢查彈藥（空→dryfire 音效+自動換彈）→ `G.stats.shots++` → 依 spread 偏移
  方向 raycast（對象 = G.worldMeshes + 所有 target meshes，取最近）→ 命中 target mesh 則
  `Targets.hit(...)`，否則 `FX.bulletHole + FX.impact`；一定呼叫 `FX.muzzleFlash + FX.tracer
  + FX.shell`、對應槍聲、`Player.applyRecoil`、`ViewModels.kick`、spread bloom 增加。
- 刀：近距 raycast（range 內），揮擊動畫+音效。
- 傷害/散佈/後座力數值全部讀 WEAPON_DATA；移動/跳躍時散佈加成
  （`spreadMove * speedRatio`，空中 x1.5）。狙擊未開鏡散佈 x8。

### `HUD`（ui/hud.js）
- `HUD.init()` / `HUD.update(dt)`（DOM 更新需節流，~15fps 即可，準星每幀）
- `HUD.hitmarker(isHead)` / `HUD.killfeed(text)` / `HUD.centerMsg(text, dur)`
- `HUD.setScope(on, zoomLevel)` / `HUD.refreshRadar()` / `HUD.updateScoreboard()`
- 動態準星：四線間距 = `Weapons.spread` 換算 px（`px = tan(spread)* (h/2) / tan(fov/2)` 近似即可）
- 雷達：以 G.radar.canvas 為底，每幀畫玩家箭頭（yaw）+存活目標紅點。
- Tab 按住顯示記分板（shots/hits/命中率/爆頭/擊破/分數/挑戰最佳）。
- 顯示：HP 100 / 護甲 100（純裝飾）、彈藥 `mag | reserve`、武器名、金額 `$ score*10`、
  時間 mm:ss、連擊（combo≥2 時）、挑戰計時。

### `Menu`（ui/menu.js）
- `Menu.init()` / `Menu.show('main'|'pause'|null)`
- 主選單：標題「CS:TAICHUNG 台中訓練場」、開始訓練、操作說明、設定。
- 暫停：繼續、重置目標、設定、回主選單。
- 設定：滑鼠靈敏度(0.2~3)、音量(0~1)、畫質(高/低 — 切陰影與 pixelRatio)、
  反向Y軸。即時寫入 G.settings 並 localStorage 持久化（key `cst_settings`）。
- 按鈕動作呼叫 `Game.start() / Game.resume() / Game.resetTargets() / Game.applySettings()`。

### `Game`（js/main.js）
- `Game.start()`：menu→playing，requestLock，AudioSys.unlock+ambience
- `Game.pause()` / `Game.resume()` / `Game.resetTargets()`
- `Game.addScore({points, head, type, name})`：combo 機制（3 秒內連續擊破 combo+1，
  得分 x(1+0.1*combo)），寫 G.score/stats，HUD.killfeed，AudioSys('score'/'headshot')
- `Game.startChallenge()`（T 鍵）：resetAll→計時→`challengeCleared==challengeTotal` 時結算，
  破紀錄存 localStorage `cst_best`
- `Game.applySettings()`：音量/陰影/pixelRatio
- 主迴圈：requestAnimationFrame，dt clamp 0.05，`G.state==='playing'` 才更新
  Player/Weapons/Range；FX/HUD 恆更新；Input.endFrame() 收尾。
- renderer：`antialias:true`、`shadowMap.enabled`、`PCFSoftShadowMap`、
  `outputEncoding = sRGBEncoding`、`toneMapping = ACESFilmicToneMapping(1.05)`。

## index.html 的 DOM id（HUD/Menu 對應）

`#app` 容器；canvas 由 renderer 建立放入 `#app`。
`#hud` 內：`#crosshair`(四條 `.chl` n/s/e/w)、`#hitmarker`、`#scope`(.scope-ring/.scope-line)、
`#radar`(canvas 180x180)、`#hp-num`、`#armor-num`、`#ammo-mag`、`#ammo-reserve`、
`#weapon-name`、`#money`、`#timer`、`#combo`、`#killfeed`、`#center-msg`、`#challenge-timer`、
`#scoreboard`(內含 `#sb-body`)、`#fps`、`#hint`。
選單：`#menu`(標題/按鈕 `#btn-start` `#btn-help` `#btn-settings`)、
`#help-panel`(操作說明, `#btn-help-back`)、`#pause`(`#btn-resume` `#btn-reset` `#btn-pause-settings`
`#btn-quit`)、`#settings`(`#set-sens` `#set-vol` `#set-quality` `#set-inverty` `#btn-settings-back`)。
載入畫面 `#loading`。

## 效能預算

- draw call < 1200；重複物件共用 geometry/material，大量同款（機車/燈籠/電線桿）可合併或 Instanced。
- 陰影貼圖 2048（低畫質關閉）。霧 THREE.Fog 暖色。
- 禁止每幀配置新物件（粒子/曳光全部池化）。

## 地圖規格（City/Props 依此配置）

- 地面大平面 + 柏油路（含車道線、斑馬線）+ 人行道（高 0.12m）。
- **台灣大道**：z∈[-9,9]，全寬主幹道，中央分隔島+行道樹。
- **北側商圈街**（z∈[-52,-14]）：3~6 層騎樓建築連排，一樓店面（7-ELEVEN、50嵐、
  便當店、藥局、網咖、手機行…），直式招牌伸出，二樓以上彩色 facade。
- **逢甲夜市巷**（南側 x∈[18,66], z∈[14,64]）：窄巷，兩側小吃攤+燈籠串+霓虹招牌。
- **公園靶場**（西側 x∈[-84,-28], z∈[10,70]）：草皮、樹、涼亭、靶道
  （15/25/40m 紙靶排、鋼靶架、瓶桌、氣球），外圍矮牆。
- **台中車站**（東端 x≈70~88 面對 -X）：紅磚建築+鐘+「台中車站」字樣，當視覺終點。
- 邊界用建築/圍牆封住，G.BOUNDS 硬限制。
- 天空：漸層穹頂（黃昏暖橘→藍），遠山剪影，太陽方位低角度暖光，長影子。
