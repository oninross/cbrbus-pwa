'use strict';

import doT from 'doT';
import { ripple, toaster } from '../../_assets/btt/js/_material';

export default class Bookmark {
    constructor() {
        const self = this;

        self.obj = {};
        self.services = {};
        self.tmpArr = [];
        self.tmpArrInd = 0;
        self.busStopName = '';
        self.strArr = '';
    }

    init() {
        const self = this;

        let cardBookmark = doT.template($('#card-bookmark').html()),
            cardMarkup = '';

        $.ajax({
            url: '/assets/btt/api/services.json',
            success: function (data) {
                self.services = data;

                if (JSON.parse(localStorage.bookmarks).length) {
                    self.tmpArr = JSON.parse(localStorage.bookmarks);

                    for (let i = 0, l = self.tmpArr.length; i < l; i++) {
                        // iterate over each element in the array
                        for (let j = 0, m = self.services.length; j < m; j++) {
                            // look for the entry with a matching `code` value
                            if (self.services[j].data == self.tmpArr[i]) {
                                // we found it
                                // obj[i].name is the matched result
                                self.busStopName = self.services[j].name;
                            }
                        }

                        self.obj = {
                            busStopId: self.tmpArr[i],
                            busStopName: self.busStopName
                        };

                        cardMarkup += cardBookmark(self.obj);
                    }

                    $('.cards-wrapper').html(cardMarkup);

                    TweenMax.staggerTo('.card', 0.75, {
                        opacity: 1,
                        top: 1,
                        ease: Expo.easeOut
                    }, 0.1);
                } else {
                    toaster('You have not bookmaked any stops yet.');
                }
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

    checkBookmark(id) {
        const self = this;

        if (localStorage.bookmarks) {
            self.tmpArr = JSON.parse(localStorage.bookmarks);

            if (self.tmpArr.indexOf(Number(id)) > -1) {
                $('.card__header .icon').addClass('active');
                return true;
            } else {
                return false;
            }
        }
    }

    setBookmark(id) {
        const self = this;

        if (localStorage.bookmarks == undefined) {
            self.tmpArr.push(id);
            self.strArr = JSON.stringify(self.tmpArr);

            localStorage.bookmarks = self.strArr;

            $('.card__header .icon').addClass('active');
        } else {
            self.tmpArr = JSON.parse(localStorage.bookmarks);

            if (self.tmpArr.indexOf(id) > -1) {
                self.tmpArrInd = self.tmpArr.indexOf('id');
                self.tmpArr.splice(self.tmpArrInd, 1);
                self.strArr = JSON.stringify(self.tmpArr);
                localStorage.bookmarks = self.strArr;

                $('.card__header .icon').removeClass('active');
            } else {
                self.tmpArr.push(id);
                self.strArr = JSON.stringify(self.tmpArr);
                localStorage.bookmarks = self.strArr;

                $('.card__header .icon').addClass('active');
            }
        }
    }
}
