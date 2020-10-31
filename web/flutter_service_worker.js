'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/amazon_app_store.png": "5574c2ceb18d51948e02256ed9a6eea8",
"assets/AssetManifest.json": "3600f98cdcd88bfd1900dd50f41256fe",
"assets/bluebliss_games_logo.png": "9e7ed5752f9b7edb32cee15c06a69740",
"assets/Download_on_the_App_Store_Badge.png": "fbe19a223a27f971ff782ab1e2537b76",
"assets/facebook_phrasepuzzlechallenge.jpg": "a107bb11249ea05eebfbabe878edcee1",
"assets/FontManifest.json": "e03be0e0d5bdcda62663c880ce70045c",
"assets/Fun%20iPhone%208%20Plus%20Screen%20Shot%20Phrase%20Puzzle%20Challenege.png": "6293c7a2069fb76fb6900a3fb4582626",
"assets/google_play_badge.png": "db9b21a1c41f3dcd9731e1e7acfdbb57",
"assets/hiraminpro-w3.otf": "3fabfe5faf69d7514122ef7c61d9e62c",
"assets/home_pic.png": "246893af740f9178b2c508edbf2dcff0",
"assets/image.png": "fa67c5c06e7b8adb91f06d922fa0e4a0",
"assets/image_new.png": "f7e7f219a6d12ce5250a5fec76892ce5",
"assets/image_old.png": "6a35aeceda16acd87a50ebe7d795ae7f",
"assets/image_small.png": "8a59b6ab791aa63ca5ed9bcdf3a1db93",
"assets/instagram_phrasepuzzlechallenge.jpg": "b72062b79a77bb680a65eb37765b4c4e",
"assets/iPhone%208%20Plus%20Screen%20Shot%20Phrase%20Puzzle%20Challenege.png": "393b6d166c5644e414a9d9c5dfda9afa",
"assets/iPhone%208%20Plus_Phrase_Puzzle_Challenge.png": "150ca101f1fc76df8295be6feb3b1936",
"assets/linkin_phrasepuzzlechallenge.jpg": "63b49c24943bf1e0890a194de43a9b7a",
"assets/menu.png": "24085b165cf07dbb15583b1fa0ea583d",
"assets/Montserrat-Bold.ttf": "a3b387c93882604792867736aecd56c8",
"assets/Montserrat-Regular.ttf": "a8a117360e71de94ae3b0b0f8d15b44d",
"assets/NOTICES": "bb9d5e4ee34b18e802de2f6b82013d82",
"assets/packages/flutter_inappwebview/t_rex_runner/t-rex.css": "5a8d0222407e388155d7d1395a75d5b9",
"assets/packages/flutter_inappwebview/t_rex_runner/t-rex.html": "16911fcc170c8af1c5457940bd0bf055",
"assets/PhrasePuzzleChallenge_icon.png": "b8c174030191841a2478c731e870507c",
"assets/samsungapps_phrasepuzzlechallenge.png": "98889987352cd54b5b2daf646bf23c2e",
"assets/scroll_down.png": "c94ad85495208197e60f12bf0078f5c4",
"assets/sent.png": "a76dea49fba5b97bf9504db741d38356",
"assets/shape-3.svg": "3a311e31f69ee7df8e48db6853e33a76",
"assets/twitter_phrasepuzzlechallenge.jpg": "5287f91adf7df310aba2ce766ea23f9c",
"assets/youtube_phrasepuzzlechallenge.png": "74fc6181050e8ee39825613beb011992",
"index.html": "85d64ae3e02672eba913aec0f4e54ef0",
"/": "85d64ae3e02672eba913aec0f4e54ef0",
"main.dart": "c72cd54cdb99a0f1afaa33d160d25278",
"main.dart.js": "e27b8abd70959eed26ca595f479bf639",
"version.json": "abd985ee89d2d80b9e60c0f7d90be286"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
