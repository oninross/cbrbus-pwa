'use strict';

import { ripple, toaster } from './_material';
import { lookupBusId } from './_busStop';

let loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/></svg></div>',
    tmpArr = [],
    tmpArrInd = 0,
    strArr = '';

$(() => {
    if ($('.bookmark').length) {

    }
});

let setBookmark = function (id) {
    if (localStorage.bookmarks == undefined) {
        tmpArr.push(id);
        strArr = JSON.stringify(tmpArr);

        localStorage.bookmarks = strArr;

        $('.card__header .icon').addClass('active');
    } else {
        tmpArr = JSON.parse(localStorage.bookmarks);

        if (tmpArr.indexOf(id) > -1) {
            tmpArrInd = tmpArr.indexOf('id');
            tmpArr.splice(tmpArrInd, 1);
            strArr = JSON.stringify(tmpArr);
            localStorage.bookmarks = strArr;

            $('.card__header .icon').removeClass('active');
        } else {
            tmpArr.push(id);
            strArr = JSON.stringify(tmpArr);
            localStorage.bookmarks = strArr;

            $('.card__header .icon').addClass('active');
        }
    }
};

export { setBookmark };