'use strict';

import 'autocomplete';
import doT from 'doT';
import { loader } from './_helper';
import { ripple, toaster } from './_material';
import { lookupBusId } from './_busStop';
import { setBookmark } from './_bookmark';

let isLoading = false,
    busStopId = null,
    busStopName = null,
    $body = $('body');

$(() => {
    if ($('.search').length) {
        let $search = $('.search input[type="text"]');

        $('.js-clear').on('click', function () {
            $search.autocomplete().clear();
            $search.val('').focus();
        });

        $body.on('click', '.js-bookmark', function (e) {
            e.preventDefault();

            setBookmark($(this).data('id'));
        });

        $('.js-refresh').on('click', function () {
            if (isLoading) {
                return false;
            }

            $body.append(loader);

            TweenMax.staggerTo('.card', 0.75, {
                opacity: 0,
                top: -50,
                ease: Expo.easeOut
            }, 0.1, function () {
                lookupBusId(busStopId, busStopName);
            });
        });

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

                        getData(suggestion.data);
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
});

function getData(busStopId) {
    $('#main').before(loader);

    lookupBusId(busStopId, busStopName);
};
