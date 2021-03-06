'use strict';

import jQuery from "jquery";

const loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/></svg></div>';

// const BASE_URL = '192.168.1.7:8888'; // local
// const BASE_URL = '10.16.0.107:8888'; // local
const BASE_URL = 'cbrserver.herokuapp.com'; // Production

const API_KEY = 'A6F762'; // Development
// const API_KEY = 'AE9887'; // Production/

const GMAP_API_KEY = 'AIzaSyCuYrPi0JKjxl20V4TR0d2PH1VZ0t6gv5c'; // Development && Production

let debounce = function (func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
};

let isMobile = function () {
    return Modernizr.mq('(max-width: 767px)');
};

let isTablet = function () {
    return Modernizr.mq('(min-width: 768px)');
};

let isDesktop = function () {
    return Modernizr.mq('(min-width: 1024px)');
};

let isLargeDesktop = function () {
    return Modernizr.mq('(min-width: 1200px)');
};

let isNotificationGranted = function () {
    return Notification.permission == 'granted';
}

let isServiceWorkerSupported = function () {
    return 'serviceWorker' in navigator;
}

let getSortByTime = function () {
    if (localStorage.isSortByTime == undefined) {
        localStorage.isSortByTime = JSON.stringify(false);
    }

    return JSON.parse(localStorage.isSortByTime);
}

let setSortByTime = function (boolean) {
    var bool = boolean;
    switch (boolean) {
        case 0:
            bool = false;
            break;
        case 1:
            bool = true;
            break;
    };

    ga('send', 'event', 'Set Sort By Time', 'click', bool);

    localStorage.isSortByTime = JSON.stringify(bool);
}

function getQueryVariable(variable) {
    let query = window.location.search.substring(1),
        vars = query.split("&");

    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");

        if (pair[0] == variable) {
            return pair[1];
        }
    }

    return false;
};


/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing.jswing = jQuery.easing.swing;

jQuery.extend(jQuery.easing, {
    def: 'easeOutQuad',
    easeOutExpo: function (x, t, b, c, d) {
        return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    easeInOutExpo: function (x, t, b, c, d) {
        if (t == 0) {
            return b;
        }

        if (t == d) {
            return b + c;
        }

        if ((t /= d / 2) < 1) {
            return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        }

        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    }
});

let easeOutExpo = {
    duration: 500,
    easing: 'easeOutExpo',
    queue: false
};

export {
    loader,
    debounce,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    getQueryVariable,
    easeOutExpo,
    BASE_URL,
    API_KEY,
    GMAP_API_KEY,
    isNotificationGranted,
    isServiceWorkerSupported,
    getSortByTime,
    setSortByTime
};
