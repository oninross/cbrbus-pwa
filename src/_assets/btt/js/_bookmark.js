'use strict';

import doT from 'doT';
import { ripple, toaster } from './_material';
import { lookupBusId } from './_busStop';

let loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/></svg></div>',
    obj = {},
    services = {},
    tmpArr = [],
    tmpArrInd = 0,
    busStopName = '',
    strArr = '';

$(() => {
    let cardBookmark = doT.template($('#card-bookmark').html()),
        cardMarkup = '';

    if ($('.bookmark').length) {
        $.ajax({
            url: '/assets/btt/api/services.json',
            success: function (data) {
                services = data;

                tmpArr = JSON.parse(localStorage.bookmarks);

                for (let i = 0, l = tmpArr.length; i < l; i++) {
                    // iterate over each element in the array
                    for (let j = 0, m = services.length; j < m; j++){
                        // look for the entry with a matching `code` value
                        if (services[j].data == tmpArr[i]){
                            // we found it
                            // obj[i].name is the matched result
                            busStopName = services[j].name;
                        }
                    }

                    obj = {
                        busStopId: tmpArr[i],
                        busStopName: busStopName
                    };

                    cardMarkup += cardBookmark(obj);
                }

                $('.cards-wrapper').html(cardMarkup);

                TweenMax.staggerTo('.card', 0.75, {
                    opacity: 1,
                    top: 1,
                    ease: Expo.easeOut
                }, 0.1);
            },
            error: function (error) {
                console.log(error);

                toaster('Whoops! Something went wrong! Error (' + error.status + ' ' + error.statusText + ')');
            },
            statusCode: function (code) {
                console.log(code);
            }
        });
    }
});

let checkBookmark = function (id) {
    if (localStorage.bookmarks != undefined) {
        tmpArr = JSON.parse(localStorage.bookmarks);

        if (tmpArr.indexOf(Number(id)) > -1) {
            $('.card__header .icon').addClass('active');
            return true;
        } else {
            return false;
        }
    }
};

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

export { checkBookmark, setBookmark };