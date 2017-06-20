'use strict';

import 'autocomplete';
import doT from 'doT';
import { loader, debounce, getSortByTime, setSortByTime } from '../../_assets/btt/js/_helper';
import { ripple, toaster } from '../../_assets/btt/js/_material';

import Bookmark from '../bookmark/bookmark';
import BusStop from '../busstop/busstop';

export default class Search {
    constructor() {
        const self = this,
            bookmark = new Bookmark();

        self.isLoading = false;
        self.busStopId = 0;
        self.busStopName = '';
        self.$body = $('body');
        self.isSortByTime = getSortByTime();
        self.busStop = new BusStop();

        if ($('.search').length) {
            let $search = $('.search input[type="text"]');

            $('.js-clear').on('click', function () {
                $search.autocomplete().clear();
                $search.val('').focus();
            });

            self.$body.on('click', '.js-bookmark', function (e) {
                e.preventDefault();

                bookmark.setBookmark($(this).data('id'));
            });

            if (self.isSortByTime) {
                $('#sort-toggle').attr('checked', true);
            };

            $('.js-toggle-sort').on('click', function () {
                if ($('#sort-toggle:checked').length) {
                    self.isSortByTime = true;
                } else {
                    self.isSortByTime = false;
                }

                setSortByTime(self.isSortByTime);

                $('.js-refresh').trigger('click');
            });

            $('.js-refresh').on('click', function () {
                if (self.isLoading) {
                    return false;
                }

                var $this = $(this);

                TweenMax.to($this.find('.icon'), 1, {
                    rotation: 360,
                    ease: Expo.easeOut,
                    onComplete: function () {
                        TweenMax.set($this.find('.icon'), {
                            rotation: 0
                        });
                    }
                });

                self.$body.append(loader);

                TweenMax.staggerTo('.card', 0.75, {
                    opacity: 0,
                    top: -50,
                    ease: Expo.easeOut
                }, 0.1, function () {
                    self.busStop.lookupBusId(self.busStopId, self.busStopName);
                });
            });

            $(window).on('resize', debounce(function () {
                $('#main').css({
                    height: $(window).outerHeight() - $('.header').outerHeight()
                });
            }, 250)).trigger('resize');

            $.ajax({
                url: '/assets/btt/api/services.json',
                success: function (data) {
                    let services = data;

                    $search.autocomplete({
                        lookup: services,
                        noCache: true,
                        lookupLimit: 5,
                        triggerSelectOnValidInput: false,
                        autoSelectFirst: true,
                        onSelect: function (suggestion) {
                            $search.blur();
                            self.busStopId = suggestion.data;
                            self.busStopName = suggestion.name;

                            $(this).closest('.search').addClass('selected');

                            self.getData(suggestion.data);
                            ga('send', 'event', 'Bus Stop Search', 'click', self.busStopId);
                        },
                        onSearchStart: function (query) {
                            TweenMax.to('.search .btn', 0.75, {
                                autoAlpha: 1,
                                ease: Expo.easeOut
                            });
                        },
                        onHide: function () {
                            TweenMax.to('.search .btn', 0.75, {
                                autoAlpha: 0,
                                ease: Expo.easeOut
                            });
                        }
                    });
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
    }

    getData(busStopId) {
        const self = this;

        $('#main').before(loader);

        self.busStop.lookupBusId(busStopId, self.busStopName);
    }
}
