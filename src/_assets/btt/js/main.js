// Main javascript entry point
// Should handle bootstrapping/starting application

'use strict';

import $ from 'jquery';
import 'lazyload';
import 'TweenMax';
import './_modernizr';

import PrimaryNav from '../../../_modules/primary-nav/primary-nav';
import Accordion from '../../../_modules/accordion/accordion';
import NearBy from  './_nearby';
import TrackMyBus from  './_trackmybus';

import { BASE_URL, debounce, isMobile, isServiceWorkerSupported } from './_helper';
import { toaster } from './_material';
import './_busStop';
import './_search';
import './_bookmark';

// Variable declaration
var $window = $(window),
    $body = $('body'),
    $header = $('.header'),
    isMobileDevice = isMobile(),
    lastScrollTop = 0,
    vapidPublicKey = 'BICxnXBM_YNm-XbMG2OWfotUv4roMv7yxsXiowl0QDYs8ERPPlUd4A1Tcd8S3sXI7WneX9c2mh1xxNAdIjKzy0I';

window.II = {};

$(() => {
    new PrimaryNav();   // Activate Primary NAv modules logic

    if ($('.nearby').length) {
        new NearBy();
    }

    if ($('.trackMyBus').length) {
        new TrackMyBus();
    }

    if ($('.accordion').length) {
        new Accordion();
    }

    ////////////////////////////
    // Set framerate to 60fps //
    ////////////////////////////
    TweenMax.ticker.fps(60);



    ///////////////////////
    // Init Lazy Loading //
    ///////////////////////
    $('.lazy').lazyload({
        effect : 'fadeIn'
    });



    ////////////////////////////
    // Magical Table wrapping //
    ////////////////////////////
    (function () {
        $.fn.isTableWide = function () {
            return $(this).parent().width() < this.width();
        };

        $('table').each(function () {
            var $this = $(this);

            if ($this.length && !$this.parent().hasClass('table-wrapper') && $this.isTableWide()) {
                $this
                    .after('<button class="btn-print-table js-print-table">View Table</button>')
                    .wrap('<div class="table-wrapper"></div>');
            }
        });

        var $tablePreview = $('.table-preview');
        if ($tablePreview.length) {
            $('meta[name="viewport"]').attr('content', 'user-scalable=yes');
            $tablePreview.append(localStorage.tablePreview);

            $(window).bind('beforeunload', function () {
                localStorage.tablePreview = null;
            });
        }

        $('body').on('click', '.js-print-table', function () {
            var $table = $(this).prev();

            localStorage.tablePreview = $table[0].innerHTML;
            window.open('/table-preview/', '_blank').focus();
        });
    })();



    /////////////////////
    // Header Toggling //
    /////////////////////
    (function () {
        $window.on('resize scroll', debounce(toggleHeader, 250));

        function toggleHeader() {
            var st = $(this).scrollTop(),
                $headerHeight = $header.height();

            isMobileDevice = isMobile();

            if (!isMobileDevice) {
                if (st > lastScrollTop) {
                    // scroll down
                    if (st > $headerHeight) {
                        $header.addClass('hide').removeClass('compact');
                    }
                } else {
                    // scroll up
                    if (st <= $headerHeight) {
                        $header.removeClass('compact hide');
                    } else {
                        $header.addClass('compact');
                    }
                }
            }

            lastScrollTop = st;
        };
    })();

    console.log("I'm a firestarter!");
});

// Simple Service Worker to make App Install work
var endpoint,
    key,
    authSecret;

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

// if (isServiceWorkerSupported()) {
//     window.addEventListener('load', function () {
//         navigator.serviceWorker.register('/service-worker.js')
//         .then(function (registration) {
//             registration.onupdatefound = function () {
//                 // The updatefound event implies that registration.installing is set; see
//                 // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
//                 const installingWorker = registration.installing;

//                 installingWorker.onstatechange = function () {
//                     switch (installingWorker.state) {
//                         case 'installed':
//                             if (!navigator.serviceWorker.controller) {
//                                 toaster('Caching complete!');
//                             }
//                             break;

//                         case 'redundant':
//                             throw Error('The installing service worker became redundant.');
//                     }
//                 };
//             };


//             // Use the PushManager to get the user's subscription to the push service.

//             //service worker.ready will return the promise once the service worker is registered. This can help to get rid of
//             //errors that occur while fetching subscription information before registration of the service worker

//             return navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
//                 return serviceWorkerRegistration.pushManager.getSubscription()
//                     .then(function (subscription) {

//                         // If a subscription was found, return it.
//                         if (subscription) {
//                             return subscription;
//                         }

//                         const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

//                         // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
//                         // send browser push notifications that don't have a visible effect for the user).
//                         return serviceWorkerRegistration.pushManager.subscribe({
//                             userVisibleOnly: true,
//                             applicationServerKey: convertedVapidKey
//                         });
//                     });
//             });
//         }).then(function (subscription) { //chaining the subscription promise object

//             // Retrieve the user's public key.
//             var rawKey = subscription.getKey ? subscription.getKey('p256dh') : '';
//             key = rawKey ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) : '';
//             var rawAuthSecret = subscription.getKey ? subscription.getKey('auth') : '';
//             authSecret = rawAuthSecret ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuthSecret))) : '';

//             endpoint = subscription.endpoint;

//             // Send the subscription details to the server using the Fetch API.
//             window.II.pushData = {
//                 endpoint: endpoint,
//                 key: key,
//                 authSecret: authSecret
//             };
//         })
//         .catch(function (whut) {
//             console.error('uh oh... ');
//             console.error(whut);
//             toaster('Service worker registration failed:', e);
//         });
//     });

//     window.addEventListener('beforeinstallprompt', function (e) {
//         ga('send', 'event', 'Prompt to add to homescreen', 'click');

//         // e.userChoice will return a Promise. For more details read: http://www.html5rocks.com/en/tutorials/es6/promises/
//         e.userChoice.then(function (choiceResult) {
//             console.log(choiceResult.outcome);

//             if (choiceResult.outcome == 'dismissed') {
//                 console.log('User cancelled homescreen install');
//                 ga('send', 'event', 'Cancelled add to homescreen', 'click');
//             } else {
//                 console.log('User added to homescreen');
//                 ga('send', 'event', 'Added to homescreen', 'click');
//             }
//         });
//     });

//     // Check to see if the service worker controlling the page at initial load
//     // has become redundant, since this implies there's a new service worker with fresh content.
//     if (navigator.serviceWorker && navigator.serviceWorker.controller) {
//         console.log("navigator.serviceWorker.controller.onstatechange:: " + navigator.serviceWorker.controller.onstatechange)
//         navigator.serviceWorker.controller.onstatechange = function (event) {
//             if (event.target.state === 'redundant') {
//                 toaster('A new version of this app is available. Please reload the page.'); // duration 0 indications shows the toast indefinitely.
//                 window.location.reload();
//             }
//         };
//     }
// }

