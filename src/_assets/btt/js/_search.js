'use strict';

import 'autocomplete';
import doT from 'doT';
import { ripple, toaster } from './_material';

let loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/></svg></div>',
    busStopId = null;

$(() => {
    if ($('.search').length) {
        $.ajax({
            url: '/assets/btt/api/services.json',
            success: function (data) {
                var services = data;

                $('.search input[type="text"]').autocomplete({
                    lookup: services,
                    noCache: true,
                    triggerSelectOnValidInput: false,
                    onSelect: function (suggestion) {
                        busStopId = suggestion.data;
                        getData(suggestion.data);
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

        $('body').on('click', '.card', function (e) {
            e.preventDefault();

            var $this = $(this),
                serviceNum = $this.data('servicenum');

            if (serviceNum == undefined) {
                return false;
            }

            ripple(e, $this);

            $this.find('.eta').text('');

            $this.append(loader);

            $.ajax({
                url: 'https://cors-anywhere.herokuapp.com/http://datamall2.mytransport.sg/ltaodataservice/BusArrival?BusStopID=' + busStopId + '&ServiceNo=' + serviceNum + '&SST=True',
                type: 'GET',
                headers: {
                    'AccountKey': 'GXJLVP0cQTyUGWGTjf7TwQ==',
                    'UniqueUserID': '393c7339-4df2-4e6a-b840-ea6b1f5d8acc',
                    'accept': 'application/json'
                },
                success: function (data) {
                    // console.log(data);

                    TweenMax.to('.loader', 0.75, {
                        autoAlpha: 0,
                        scale: 0,
                        ease: Expo.easeOut,
                        onComplete: function () {
                            $('.loader').remove();
                            updateEta($this, data);
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
        });
    }
});

function getData(busStopId) {
    $('#main').before(loader);

    $.ajax({
        url: 'https://cors-anywhere.herokuapp.com/http://datamall2.mytransport.sg/ltaodataservice/BusArrival?BusStopID=' + busStopId + '&SST=True',
        type: 'GET',
        headers: {
            'AccountKey': 'GXJLVP0cQTyUGWGTjf7TwQ==',
            'UniqueUserID': '393c7339-4df2-4e6a-b840-ea6b1f5d8acc',
            'accept': 'application/json'
        },
        success: function (data) {
            // console.log(data);
            TweenMax.to('.loader', 0.75, {
                autoAlpha: 0,
                scale: 0,
                ease: Expo.easeOut,
                onComplete: function () {
                    $('.loader').remove();
                    processData(data);
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
