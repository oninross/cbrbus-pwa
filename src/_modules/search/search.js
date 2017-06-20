'use strict';

import 'autocomplete';
import doT from 'doT';
import { loader, debounce, getSortByTime, setSortByTime } from '../../_assets/btt/js/_helper';
import { ripple, toaster } from '../../_assets/btt/js/_material';

import Bookmark from '../bookmark/bookmark';
import BusStop from '../busstop/busstop';

let isLoading = false,
    busStopId = null,
    busStopName = null,
    $body = $('body'),
    isSortByTime = getSortByTime();

export default class Search {
    constructor() {
        const that = this,
            bookmark = new Bookmark();

        that.busStop = new BusStop();

        if ($('.search').length) {
            let $search = $('.search input[type="text"]');

            $('.js-clear').on('click', function () {
                $search.autocomplete().clear();
                $search.val('').focus();
            });

            $body.on('click', '.js-bookmark', function (e) {
                e.preventDefault();

                bookmark.setBookmark($(this).data('id'));
            });

            if (isSortByTime) {
                $('#sort-toggle').attr('checked', true);
            };

            $('.js-toggle-sort').on('click', function () {
                if ($('#sort-toggle:checked').length) {
                    isSortByTime = true;
                } else {
                    isSortByTime = false;
                }

                setSortByTime(isSortByTime);

                $('.js-refresh').trigger('click');
            });

            $('.js-refresh').on('click', function () {
                if (isLoading) {
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

                $body.append(loader);

                TweenMax.staggerTo('.card', 0.75, {
                    opacity: 0,
                    top: -50,
                    ease: Expo.easeOut
                }, 0.1, function () {
                    that.busStop.lookupBusId(busStopId, busStopName);
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
                            busStopId = suggestion.data;
                            busStopName = suggestion.name;

                            $(this).closest('.search').addClass('selected');

                            that.getData(suggestion.data);
                            ga('send', 'event', 'Bus Stop Search', 'click', busStopId);
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
        const that = this;

        $('#main').before(loader);

        that.busStop.lookupBusId(busStopId, busStopName);
    }
}
