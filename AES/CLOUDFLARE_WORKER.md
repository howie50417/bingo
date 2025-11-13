# Cloudflare Worker Proxy 部署指南

這份文件示範如何用 **Cloudflare Workers** 建立一個免費代理服務，讓前端網頁可以安全下載 OSS/S3 物件、繞過 CORS 限制，再交給 AES 解密工具使用。不需要自有網域，Cloudflare 會提供 `*.workers.dev` 子網域。

---

## 1. 先備條件
- Cloudflare 帳號（可免費申請）
- 目標儲存桶（阿里雲 OSS、AWS S3…）的公開讀取網址
- 任意瀏覽器即可完成部署（若想本機部署可安裝 `wrangler` CLI，但本指南以圖形介面為主）

---

## 2. 建立 Worker
1. 登入 [dash.cloudflare.com](https://dash.cloudflare.com)。
2. 左側選單點 **Workers & Pages** → **Create application**。
3. 選 **Create Worker** → 輸入名稱（例如 `aes-proxy`）→ **Deploy**。  
   - Cloudflare 會自動建立一個 `https://aes-proxy.<你的帳號>.workers.dev`。
4. 按 **Edit code** 進入編輯器；將預設程式碼改成下方範例。

---

## 3. Worker 程式碼
下列程式會接受 `GET /?url=<目標網址>` 要求，下載該網址內容並回傳，同時加上 CORS Header。它也支援 `OPTIONS` 預檢要求，並可透過環境變數限制允許的 host。

```javascript
const DEFAULT_ALLOWED_HOSTS = ['6avw5g5m.oss-cn-hongkong.aliyuncs.com'];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(origin),
      });
    }

    const requestUrl = new URL(request.url);
    const target = requestUrl.searchParams.get('url');
    if (!target) {
      return new Response('Missing url parameter', {
        status: 400,
        headers: corsHeaders(origin),
      });
    }

    let parsedTarget;
    try {
      parsedTarget = new URL(target);
    } catch (err) {
      return new Response('Invalid url parameter', {
        status: 400,
        headers: corsHeaders(origin),
      });
    }

    const allowedHosts = (env.ALLOWED_HOSTS || '')
      .split(',')
      .map((host) => host.trim())
      .filter(Boolean);
    const hostWhitelist = allowedHosts.length ? allowedHosts : DEFAULT_ALLOWED_HOSTS;

    if (!hostWhitelist.includes(parsedTarget.host)) {
      return new Response('Host is not allowed', {
        status: 403,
        headers: corsHeaders(origin),
      });
    }

    const upstreamResponse = await fetch(parsedTarget.href, {
      method: 'GET',
      headers: {
        'User-Agent': 'Cloudflare-Worker-Proxy',
      },
    });

    if (!upstreamResponse.ok) {
      return new Response(`Upstream error: ${upstreamResponse.status}`, {
        status: upstreamResponse.status,
        headers: corsHeaders(origin),
      });
    }

    const body = await upstreamResponse.arrayBuffer();
    const responseHeaders = corsHeaders(origin);
    responseHeaders['Content-Type'] =
      upstreamResponse.headers.get('Content-Type') || 'application/octet-stream';

    return new Response(body, {
      status: 200,
      headers: responseHeaders,
    });
  },
};

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Credentials': 'false',
    'Vary': 'Origin',
  };
}
```

> **安全建議**  
> - 依實際需求修改 `DEFAULT_ALLOWED_HOSTS` 或改用 `env.ALLOWED_HOSTS`。  
> - 若需要保護 URL，可改用 `POST` 並在 body 傳入，或加上 Token 驗證。

---

## 4. 設定環境變數（可選）
若想於儀表板管理允許 host：
1. 在 Worker 編輯頁點 **Settings** → **Variables** → **Add variable**。
2. 名稱輸入 `ALLOWED_HOSTS`，值填 `host1.example.com,host2.example.com`。

---

## 5. 測試 Worker
1. 在 Worker 頁面點 **Quick edit** → **Preview**，輸入測試 URL：  
   ```
   https://aes-proxy.<account>.workers.dev/?url=https://6avw5g5m.oss-cn-hongkong.aliyuncs.com/BDRIsdDlJazhWofa13
   ```
2. 預期會得到原始檔案內容，並且 Response Header 會包含 `Access-Control-Allow-Origin`。
3. 也可用 `curl` 驗證：
   ```bash
   curl "https://aes-proxy.<account>.workers.dev/?url=<encoded-url>"
   ```

---

## 6. 與前端整合
前端只需改成向 Worker 取得密文，再餵給解密流程。例如：

```javascript
const workerUrl = 'https://aes-proxy.<account>.workers.dev/?url=' + encodeURIComponent(s3Url);
const response = await fetch(workerUrl);
const cipherText = await response.text();
```

`fetch` 回傳後的內容與原始 S3 下載相同，但已附上可供瀏覽器存取的 CORS Header。

---

## 7. 費率與限制
- 免費方案：每日 100,000 requests、10ms CPU 時間；足以應付測試與輕量使用。
- 若需更大量流量，可再升級至付費方案或接自有網域。

---

## 8. 常見問題
| 問題 | 解法 |
| --- | --- |
| `401/403` | 確認儲存桶是否允許匿名讀取，或在 Worker 加入必要的授權 Header。 |
| `Host is not allowed` | 設定 `DEFAULT_ALLOWED_HOSTS` 或 `ALLOWED_HOSTS`，並確認大小寫。 |
| 須轉傳 JSON | 依原檔案內容自動帶 `Content-Type`，JSON 會正常傳遞。 |

完成以上步驟後，你的瀏覽器工具就能透過 Worker 下載密文並繼續解密流程，完全免去 OSS CORS 限制。祝順利！ 🎯
