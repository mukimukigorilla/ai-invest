// ===== AI投資アシスタント Service Worker =====
const CACHE_NAME = 'ai-invest-v1.0.0';
const STATIC_CACHE = 'ai-invest-static-v1.0.0';
const API_CACHE = 'ai-invest-api-v1.0.0';

// キャッシュするファイル
const STATIC_FILES = [
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap'
];

// APIドメイン（キャッシュ戦略を分ける）
const API_DOMAINS = [
  'finnhub.io',
  'query1.finance.yahoo.com',
  'api.allorigins.win'
];

// ===== インストール =====
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_FILES).catch(err => {
        // Googleフォントなど外部リソースの失敗は無視
        console.warn('[SW] Some static files failed to cache:', err);
      });
    }).then(() => {
      console.log('[SW] Installed successfully');
      return self.skipWaiting();
    })
  );
});

// ===== アクティベート（古いキャッシュ削除） =====
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== STATIC_CACHE && name !== API_CACHE)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Activated');
      return self.clients.claim();
    })
  );
});

// ===== フェッチ戦略 =====
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // APIリクエスト → Network First（失敗したらキャッシュ）
  if (API_DOMAINS.some(domain => url.hostname.includes(domain))) {
    event.respondWith(networkFirstWithCache(event.request));
    return;
  }

  // Googleフォント → Cache First
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // 静的ファイル → Cache First（オフライン対応）
  if (event.request.method === 'GET') {
    event.respondWith(cacheFirstWithFallback(event.request));
    return;
  }
});

// Network First（APIに最適）
async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetch(request, { signal: AbortSignal.timeout(8000) });
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      // GETリクエストのみキャッシュ
      if (request.method === 'GET') {
        cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (err) {
    console.warn('[SW] Network failed, trying cache:', request.url);
    const cached = await caches.match(request);
    if (cached) return cached;
    // キャッシュもなければエラーレスポンス
    return new Response(JSON.stringify({ error: 'offline', message: 'ネットワークに接続できません' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache First（静的リソースに最適）
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    return new Response('', { status: 503 });
  }
}

// Cache First + オフラインフォールバック
async function cacheFirstWithFallback(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    // HTMLリクエストにはメインページを返す（SPA対応）
    if (request.headers.get('accept')?.includes('text/html')) {
      const fallback = await caches.match('./index.html');
      if (fallback) return fallback;
    }
    return new Response('オフラインです。インターネット接続を確認してください。', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

// ===== バックグラウンド同期（将来拡張用） =====
self.addEventListener('sync', event => {
  if (event.tag === 'sync-portfolio') {
    console.log('[SW] Background sync: portfolio');
    // ここでポートフォリオデータの同期処理を追加可能
  }
});

// ===== プッシュ通知（将来拡張用） =====
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const title = data.title || 'AI投資アシスタント';
  const options = {
    body: data.body || '新しいアラートがあります',
    icon: './icons/icon-192.png',
    badge: './icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || './index.html' },
    actions: [
      { action: 'open', title: '確認する' },
      { action: 'close', title: '閉じる' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || './index.html')
    );
  }
});

console.log('[SW] Service Worker script loaded');
