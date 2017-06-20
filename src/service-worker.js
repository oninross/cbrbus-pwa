const OFFLINE_URL = '/pages/offline/';

importScripts('sw-toolbox.js');

self.toolbox.precache([
    '//developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js',
    '//maps.google.com/mapfiles/kml/paddle/blu-blank_maps.png',
    '//maps.google.com/mapfiles/kml/paddle/A_maps.png',
    '//maps.google.com/mapfiles/kml/paddle/B_maps.png',
    'assets/btt/images/busMarker.svg',
    'assets/btt/images/cluster.svg',
    'assets/btt/images/stopMarker.svg',
    'assets/btt/images/favicon/android-icon-192x192.png',
    'assets/btt/images/favicon/favicon-32x32.png',
    'assets/btt/images/favicon/favicon-96x96.png',
    'assets/btt/images/favicon/favicon-16x16.png',
    'assets/btt/api/services.json',
    'assets/btt/js/main.js',
    'assets/btt/css/main.css',
    'assets/btt/css/fonts/icomoon.woff',
    OFFLINE_URL,
    'index.html?homescreen=1'
]);

self.toolbox.router.default = self.toolbox.networkFirst;

self.toolbox.router.get('/(.*)', function (req, vals, opts) {
    return self.toolbox.networkFirst(req, vals, opts)
        .catch(function (error) {
            if (req.method === 'GET' && req.headers.get('accept').includes('text/html')) {
                return self.toolbox.cacheOnly(new Request(OFFLINE_URL), vals, opts);
            }
            throw error;
        });
    });

var arr = [],
    busId = 0,
    vehicleRef = 0;

self.addEventListener('push', function (event) {
    console.log('Push message received', event);

    var arrStr = event.data ? event.data.text() : 'no payload';

    if (arrStr != 'no payload') {
        arr = arrStr.split(',');

        busId = Number(arr[0]),
        vehicleRef = Number(arr[1]);
    }


    var payload = {
        title: 'CBR Buses',
        body: 'Your bus has arrived.',
        icon: 'https://cbrbuses.firebaseapp.com/assets/btt/images/notify-image.png',
        url: 'https://cbrbuses.firebaseapp.com/?busId=' + busId + '&vehicleRef=' + vehicleRef
    };

    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: payload.icon,
            tag: payload.url + payload.body + payload.icon + payload.title,
            vibrate: [500, 500, 500]
        })
    );
});

self.addEventListener('notificationclick', function (event) {
    console.log('On notification click: ', event.notification.tag);
    event.notification.close();

    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(clients.matchAll({
        type: "window"
    }).then(function (clientList) {
        return clients.openWindow('/trackmybus/?busId=' + busId + '&vehicleRef=' + vehicleRef);
    }));
});

