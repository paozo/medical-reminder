// Service Workerのバージョン（キャッシュ管理用）
const CACHE_NAME = 'medical-reminder-v1';
// キャッシュするファイルのリスト
const urlsToCache = [
  '/',
  '/index.html',
  // ここにCSSやJavaScriptのファイルを追加できますが、
  // 今回はCDNを使っているので主要なものだけキャッシュします。
];

// インストールイベント
self.addEventListener('install', (event) => {
  // インストール処理が完了するまで待機
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチイベント (ネットワークリクエストへの介入)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにヒットすれば、それを返す
        if (response) {
          return response;
        }
        // キャッシュになければ、ネットワークにリクエストしに行く
        return fetch(event.request);
      })
  );
});

// アクティベートイベント (古いキャッシュの削除)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // このバージョンに属さないキャッシュは削除
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 通知クリック時のイベント
self.addEventListener('notificationclick', (event) => {
    console.log('On notification click: ', event.notification.tag);
    event.notification.close();

    // クライアント(ウィンドウ)を探してフォーカスする
    event.waitUntil(clients.matchAll({
        type: "window"
    }).then((clientList) => {
        for (const client of clientList) {
            if (client.url === '/' && 'focus' in client)
                return client.focus();
        }
        if (clients.openWindow)
            return clients.openWindow('/');
    }));
});
