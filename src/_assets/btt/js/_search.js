'use strict';

import 'autocomplete';
import doT from 'doT';
import { ripple, toaster } from './_material';
import { lookupBusId } from './_busStop';
import { setBookmark } from './_bookmark';

let loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/></svg></div>',
    isLoading = false,
    busStopId = null,
    busStopName = null;

$(() => {
    if ($('.search').length) {
        let $search = $('.search input[type="text"]');

        $('.js-clear').on('click', function () {
            $search.autocomplete().clear();
            $search.val('').focus();
        });

        $('body').on('click', '.js-bookmark', function (e) {
            e.preventDefault();

            let $this = $(this),
                $id = $this.data('id');

            setBookmark($id);
        });

        $('.js-refresh').on('click', function() {
            if (isLoading) {
                return false;
            }

            $('body').append(loader);

            TweenMax.staggerTo('.card', 0.75, {
                opacity: 0,
                top: -50,
                ease: Expo.easeOut
            }, 0.1, function() {
                lookupBusId(busStopId, busStopName);
            });
        });

        $.ajax({
            url: '/assets/btt/api/services.json',
            // url: '/assets/btt/api/services.json',
            success: function (data) {
                var services = data;

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

                        // window.location.href = '/busstop/?busStopId=' + busStopId + '&busStopName=' + busStopName;
                        getData(suggestion.data);
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
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1),
        vars = query.split("&");

    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");

        if (pair[0] == variable) {
            return pair[1];
        }
    }

    return (false);
};
