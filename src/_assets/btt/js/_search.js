'use strict';

import 'autocomplete';
import doT from 'doT';
import { ripple, toaster } from './_material';
import { lookupBusId } from './_busStop';

let loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/></svg></div>',
    busStopId = null;

$(() => {
    if ($('.search').length) {
        let $search = $('.search input[type="text"]');

        $('.js-clear').on('click', function () {
            $search.autocomplete().clear();
            $search.val('').focus();
        });

        $.ajax({
            url: '/assets/btt/api/services.json',
            // url: '/assets/btt/api/services.json',
            success: function (data) {
                var services = data;

                $search.autocomplete({
                    lookup: services,
                    noCache: false,
                    lookupLimit: 5,
                    triggerSelectOnValidInput: false,
                    autoSelectFirst: true,
                    onSelect: function (suggestion) {
                        busStopId = suggestion.data;
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

    lookupBusId(busStopId);
}

function processData(json) {
    console.log(json)
    var services = json.Services,
        cardTemplate = doT.template($('#card-template').html()),
        obj = {},
        cardMarkup = '',
        now = new Date(),
        arr,
        eta,
        etaMin;

    for (var i = 0, l = services.length; i < l; i++) {
        arr = new Date(services[i].NextBus.EstimatedArrival);
        eta = arr.getTime() - now.getTime(); // This will give difference in milliseconds
        etaMin = Math.round(eta / 60000);

        obj = {
            serviceNo: services[i].ServiceNo,
            status: services[i].Status,
            EstimatedArrival: etaMin
        };

        cardMarkup += cardTemplate(obj);
    }

    $('.cards-wrapper').html(cardMarkup);

    TweenMax.staggerTo('.card', 0.75, {
        opacity: 1,
        top: 1,
        ease: Expo.easeOut
    }, 0.1);
};

function updateEta(el, json) {
    var services = json.Services,
        now = new Date(),
        arr,
        eta,
        etaMin;

    arr = new Date(services[0].NextBus.EstimatedArrival);
    eta = arr.getTime() - now.getTime(); // This will give difference in milliseconds
    etaMin = Math.round(eta / 60000);

    if (etaMin < 0) {
        el.find('.eta').html('<p class="departed">Departed</p>');
    } else if (etaMin == 0) {
        el.find('.eta').html('<p class="arriving">Arriving</p>');
    } else if (etaMin == 1) {
        el.find('.eta').html('<p class="near">' + etaMin + ' min</p>');
    } else {
        el.find('.eta').html('<p>' + etaMin + ' mins</p>');
    }

    el.find('.eta').text();
};

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
