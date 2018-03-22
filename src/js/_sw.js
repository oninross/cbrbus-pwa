// Simple Service Worker to make App Install work
var vapidPublicKey = 'BICxnXBM_YNm-XbMG2OWfotUv4roMv7yxsXiowl0QDYs8ERPPlUd4A1Tcd8S3sXI7WneX9c2mh1xxNAdIjKzy0I',
    endpoint,
    key,
    authSecret;

window.II = {};
window.II.pushData = {};

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

window.addEventListener('load', function () {
    navigator.serviceWorker.register('/service-worker.js')
        .then(function (registration) {
            registration.onupdatefound = function () {
                // The updatefound event implies that registration.installing is set; see
                // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
                const installingWorker = registration.installing;

                installingWorker.onstatechange = function () {
                    switch (installingWorker.state) {
                        case 'installed':
                            if (!navigator.serviceWorker.controller) { }
                            break;

                        case 'redundant':
                            throw Error('The installing service worker became redundant.');
                    }
                };
            };


            // Use the PushManager to get the user's subscription to the push service.

            //service worker.ready will return the promise once the service worker is registered. This can help to get rid of
            //errors that occur while fetching subscription information before registration of the service worker

            return navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
                return serviceWorkerRegistration.pushManager.getSubscription()
                    .then(function (subscription) {

                        // If a subscription was found, return it.
                        if (subscription) {
                            return subscription;
                        }

                        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

                        // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
                        // send browser push notifications that don't have a visible effect for the user).
                        return serviceWorkerRegistration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: convertedVapidKey
                        });
                    });
            });
        }).then(function (subscription) { //chaining the subscription promise object

            // Retrieve the user's public key.
            var rawKey = subscription.getKey ? subscription.getKey('p256dh') : '';
            key = rawKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) : '';
            var rawAuthSecret = subscription.getKey ? subscription.getKey('auth') : '';
            authSecret = rawAuthSecret ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuthSecret))) : '';

            endpoint = subscription.endpoint;

            // Send the subscription details to the server using the Fetch API.
            window.II.pushData = {
                endpoint: endpoint,
                key: key,
                authSecret: authSecret
            };
        })
        .catch(function (whut) {
            console.error('uh oh... ');
            console.error(whut);
        });
});

window.addEventListener('beforeinstallprompt', function (e) {

    // e.userChoice will return a Promise. For more details read: http://www.html5rocks.com/en/tutorials/es6/promises/
    e.userChoice.then(function (choiceResult) {
        console.log(choiceResult.outcome);

        if (choiceResult.outcome == 'dismissed') {
            console.log('User cancelled homescreen install');
        } else {
            console.log('User added to homescreen');
        }
    });
});

// Check to see if the service worker controlling the page at initial load
// has become redundant, since this implies there's a new service worker with fresh content.
if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    console.log("navigator.serviceWorker.controller.onstatechange:: " + navigator.serviceWorker.controller.onstatechange)
    navigator.serviceWorker.controller.onstatechange = function (event) {
        if (event.target.state === 'redundant') {
            window.location.reload();
        }
    };
}