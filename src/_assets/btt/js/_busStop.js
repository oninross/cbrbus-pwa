'use strict';

import doT from 'doT';
import { API_KEY, loader, getQueryVariable, isNotificationGranted } from './_helper';
import { ripple, toaster } from './_material';
import { checkBookmark, setBookmark } from './_bookmark';

let isLoading = true,
    busArr = [],
    busObjArr = [],
    busStopId,
    busStopName;

$(() => {
    if ($('.timetable').length) {
        if (getQueryVariable('busStopId')) {
            busStopId = getQueryVariable('busStopId');
        } else {
            busStopId = _busStopId;
        }

        getBusStopName();

        lookupBusId(busStopId, busStopName);

        $('.js-refresh').on('click', function () {
            if (isLoading) {
                return false;
            }

            $('body').append(loader);

            TweenMax.staggerTo('.card', 0.75, {
                opacity: 0,
                top: -50,
                ease: Expo.easeOut
            }, 0.1, function () {
                $('.cards-wrapper').html('');
                lookupBusId(busStopId, null);
            });

            $('.cards-wrapper').off('click', '.card', cardListener);
        });
    }
});



let lookupBusId = function (id, name) {
    let $xml = '';

    busStopName = name;
    isLoading = false;

    $xml = '<?xml version="1.0" encoding="iso-8859-1" standalone="yes"?>';
    $xml += '<Siri version="2.0" xmlns:ns2="http://www.ifopt.org.uk/acsb" xmlns="http://www.siri.org.uk/siri" xmlns:ns4="http://datex2.eu/schema/2_0RC1/2_0" xmlns:ns3="http://www.ifopt.org.uk/ifopt">';


    // Check status
    //$xml += '<CheckStatusRequest>';
    //$xml += '<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>';
    //$xml += '<RequestorRef>' + API_KEY +'</RequestorRef>';
    //$xml += '</CheckStatusRequest>';


    // (Bus) Stop Monitoring Request
    $xml += '<ServiceRequest>';
    $xml += '<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>';
    $xml += '<RequestorRef>' + API_KEY + '</RequestorRef>';
    $xml += '<StopMonitoringRequest version="2.0">';
    $xml += '<PreviewInterval>PT60M</PreviewInterval>';
    $xml += '<RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp>';
    $xml += '<MonitoringRef>' + id + '</MonitoringRef>';
    $xml += '</StopMonitoringRequest>';
    $xml += '</ServiceRequest>';



    $xml += '</Siri>';


    $.ajax({
        // url: 'https://cors-anywhere.herokuapp.com/http://siri.nxtbus.act.gov.au:11000/' + API_KEY +'/vm/service.xml',
        url: 'https://cors-anywhere.herokuapp.com/http://siri.nxtbus.act.gov.au:11000/' + API_KEY + '/sm/service.xml',
        data: $xml,
        type: 'POST',
        contentType: "text/xml",
        dataType: "text",
        success: function (xml) {
            TweenMax.to('.loader', 0.75, {
                autoAlpha: 0,
                scale: 0,
                ease: Expo.easeOut,
                onComplete: function () {
                    $('.loader').remove();

                    processData(xml);
                }
            });
        },
        error: function (error) {
            console.log(error);

            toaster('Whoops! Something went wrong! Error (' + error.status + ' ' + error.statusText + ')');
        }
    });
};

function processData(xml) {
    let xmlDoc = $.parseXML(xml),
        $xml = $(xmlDoc),
        $status = $xml.find('Status')[0].innerHTML == 'true' ? true : false,
        $monitoringRef = $xml.find('MonitoringRef');

    if (!$status) {
        toaster('Whoops! Something went wrong! Error (' + $xml.find('ErrorText')[0].innerHTML + ')');
        return false;
    }

    console.log(xmlDoc)

    let $monitoredStopVisit = $xml.find('MonitoredStopVisit'),
        cardHeader = doT.template($('#card-header').html()),
        cardTemplate = doT.template($('#card-template').html()),
        cardEmptyTemplate = doT.template($('#card-empty-template').html()),
        now = new Date(),
        obj = {},
        vehicleFeatureArr = [],
        etaArr = [],
        cardMarkup = '',
        vehicleFeatureRef = '',
        serviceNum = '',
        arr = '',
        eta = '',
        etaMin = '',
        icon = '';

    getBusStopName();

    if ($monitoredStopVisit.length || $monitoringRef.length) {
        if (busStopName != undefined) {
            obj = {
                busStopName: busStopName,
                busStopId: $monitoringRef[0].innerHTML,
                isBookmarked: checkBookmark($monitoringRef[0].innerHTML) == true ? 'active' : ''
            };

            cardMarkup += cardHeader(obj);
        }

        let monitoredStopVisitArr,
            $monitoredStopVisitArr,
            vehicleRefNum,
            vehicleRefArr;

        $monitoredStopVisit.each(function (i, v) {
            monitoredStopVisitArr = $monitoredStopVisit[i];
            $monitoredStopVisitArr = $(monitoredStopVisitArr);
            serviceNum = $monitoredStopVisitArr.find('PublishedLineName')[0].innerHTML;


            // Check for Arrival time
            if ($monitoredStopVisitArr.find('ExpectedArrivalTime')[0] == undefined) {
                if ($monitoredStopVisitArr.find('AimedArrivalTime')[0] == undefined) {
                    arr = new Date($monitoredStopVisitArr.find('AimedDepartureTime')[0].innerHTML);
                } else {
                    arr = new Date($monitoredStopVisitArr.find('AimedArrivalTime')[0].innerHTML);
                }
            } else {
                arr = new Date($monitoredStopVisitArr.find('ExpectedArrivalTime')[0].innerHTML);
            }


            // Check for Vehicle Features (Wheelchair or Bike Rack)
            vehicleFeatureArr = [];
            vehicleFeatureRef = $monitoredStopVisitArr.find('VehicleFeatureRef');
            for (let j = 0, m = vehicleFeatureRef.length; j < m; j++) {
                icon = vehicleFeatureRef[j].innerHTML;
                icon = icon.replace(' ', '-').toLowerCase();
                vehicleFeatureArr.push(icon);
            }


            // Calculate ETA
            eta = arr.getTime() - now.getTime();
            etaMin = Math.round(eta / 60000);
            etaArr = [];
            etaArr.push(etaMin);


            // Get vehicle reference number
            if ($monitoredStopVisitArr.find('VehicleRef')[0] == undefined) {
                vehicleRefNum = null;
            } else {
                vehicleRefNum = $monitoredStopVisitArr.find('VehicleRef')[0].innerHTML;
            }

            vehicleRefArr = [];
            vehicleRefArr.push(vehicleRefNum);

            obj = {
                vehicleRefNum: vehicleRefArr,
                serviceNum: serviceNum,
                feature: vehicleFeatureArr,
                estimatedArrival: etaArr
            };

            // Initial push for busArr
            if (i == 0) {
                busArr.push(serviceNum);
                busObjArr.push(obj);
            }

            // console.log(busObjArr)
            // Check if bus is already present in array
            if (busArr.indexOf(serviceNum) == -1) {
                // New Bus Service
                busArr.push(serviceNum);
                busObjArr.push(obj);
            } else {
                // Existing Bus Service
                let busArrEta = busObjArr[busArr.indexOf(serviceNum)].estimatedArrival,
                    busArrVehicleRef = busObjArr[busArr.indexOf(serviceNum)].vehicleRefNum;

                if (busArrEta.length < 2 && busObjArr[0].estimatedArrival != etaMin) {
                    busArrEta.push(etaMin);
                    busArrVehicleRef.push(vehicleRefNum);
                    busArrEta.sort(function (a, b) {
                        busArrVehicleRef.swap(0, 1);
                        busArrVehicleRef.splice(1, 1);
                        return a - b;
                    });
                }
            }
        });

        let byServiceNum = busObjArr.slice(0);

        byServiceNum.sort(function (a, b) {
            return a.serviceNum - b.serviceNum;
        });

        $.each(byServiceNum, function (i, v) {
            // Append Markup
            cardMarkup += cardTemplate(byServiceNum[i]);
        });
    } else {
        cardMarkup += cardEmptyTemplate({});
    }

    // Render Markup
    $('.cards-wrapper').html(cardMarkup);

    TweenMax.to('.btn-refresh', 0.75, {
        autoAlpha: 1,
        top: 0,
        ease: Expo.easeOut
    });

    TweenMax.staggerTo('.card', 0.75, {
        opacity: 1,
        top: 0,
        ease: Expo.easeOut,
        delay: 0.1
    }, 0.1);

    $('.cards-wrapper').on('click', '.card', cardListener);
};

function cardListener() {
    let $this = $(this),
        $vehicleRefNum = $this.data('vehicleref'),
        $serviceRefNum = $this.data('servicenum');

    if ($this.hasClass('card__header')) {
        let $this = $(this),
            $id = $this.data('id');

        setBookmark($id);

        return false;
    }

    if (!isNotificationGranted) {
        toaster('Please enable your notifications to know if your bus is approaching.');
    }

    if ($vehicleRefNum == '') {
        toaster('Sorry, we can\t track this bus service.');
    } else {
        window.location.href = '/trackmybus/?busId=' + $serviceRefNum + '&vehicleRef=' + $vehicleRefNum;
    }
}

function getBusStopName() {
    if (getQueryVariable('busStopName')) {
        busStopName = decodeURI(getQueryVariable('busStopName'));
    } else if (busStopName == '') {
        busStopName = _busStopName;
    }
};

Array.prototype.swap = function (x, y) {
    var b = this[x];
    this[x] = this[y];
    this[y] = b;
    return this;
}

export { lookupBusId }
