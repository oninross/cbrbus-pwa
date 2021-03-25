'use strict';

import $ from "jquery";
import gsap from "gsap";
import { ripple, toaster } from '../../_assets/btt/js/_material';
import { BASE_URL, API_KEY, GMAP_API_KEY, debounce, easeOutExpo, getQueryVariable, isNotificationGranted, isServiceWorkerSupported } from '../../_assets/btt/js/_helper';

let $window = $(window);

export default class Trackmybus {
    constructor() {
        if ($('.trackMyBus').length) {
            let self = this;

            self.refreshInterval = 0;
            self.markers = [];
            self.isRouteDrawn = false;
            self.isIntervalInit = false;

            if (isServiceWorkerSupported()) {
                // Just to wake up the server IF its sleeping
                fetch('//' + BASE_URL + '/register', {
                    method: 'post'
                });
            }

            self.busId = getQueryVariable('busStopId');

            self.isGeolocationEnabled = true;

            window.II.googleMap = this;


            navigator.geolocation.getCurrentPosition(function (position) {
                self.mapSettings = {
                    'lat': position.coords.latitude,
                    'long': position.coords.longitude,
                    'zoom': 12,
                    'marker': '/assets/btt/images/currentMarker.svg'
                    // 'marker': 'https://maps.google.com/mapfiles/kml/paddle/blu-blank_maps.png'
                };

                self.loadGoogleMap();
            });

            $window.on('resize', debounce(function () {
                $('#map').css({
                    height: $(document).outerHeight() - $('.header').outerHeight()
                });
            }, 250)).trigger('resize');
        }
    }

    loadGoogleMap() {
        var script = document.createElement('script'),
            scriptStr = 'https://maps.googleapis.com/maps/api/js?key=' + GMAP_API_KEY + '&callback=II.googleMap.loadData',
            clusterScript = document.createElement('script'),
            clusterScriptStr = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js';

        script.type = 'text/javascript';
        script.src = scriptStr;
        document.body.appendChild(clusterScript);

        clusterScript.type = 'text/javascript';
        clusterScript.src = clusterScriptStr;

        setTimeout(function () {
            document.body.appendChild(script);
        }, 1000);
    }

    loadData() {
        let self = this;

        $.ajax({
            url: '/assets/btt/api/services.json',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.initMap(data);

                gsap.to('.loader', 0.75, {
                    autoAlpha: 0,
                    scale: 0,
                    ease: "expo.out",
                    onComplete: function () {
                        $('.loader').remove();
                    }
                });
            },
            error: function (error) {
                console.log(error);
                gsap.to('.loader', 0.75, {
                    autoAlpha: 0,
                    scale: 0,
                    ease: "expo.out",
                    onComplete: function () {
                        $('.loader').remove();
                    }
                });
                toaster('Whoops! Something went wrong! Error (' + error.status + ' ' + error.statusText + ')');
            }
        });
    }

    initMap(json) {
        const self = this;

        let center = {
                lat: self.mapSettings.lat,
                lng: self.mapSettings.long
            },
            busStopCenter =  $.map(json, function (n) {
                if (n.data == getQueryVariable('busStopId')) {
                    return {
                        lat: n.lat,
                        lng: n.long
                    };
                }
            }),
            currentIcon = {
                url: self.mapSettings.marker,
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(16, 32)
            },
            busStopIcon = {
                url: 'https://maps.google.com/mapfiles/kml/paddle/blu-blank_maps.png',
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(16, 48)
            },
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: self.mapSettings.zoom,
                center: center,
                streetViewControl: false,
                mapTypeControl: false
            }),
            stopMarker;

        self.map = map;

        self.currentMarker = new google.maps.Marker({
            icon: currentIcon,
            position: center,
            map: map
        });

        self.busStopMarker = new google.maps.Marker({
            icon: busStopIcon,
            position: busStopCenter[0],
            map: map
        })

        google.maps.event.addListener(self.busStopMarker, 'click', function (e) {
            map.setZoom(18);
            map.panTo(self.busStopMarker.position);
        });

        $.each(json, function (i, v) {
            stopMarker = new google.maps.Marker({
                id: v.data,
                position: {
                    lat: v.lat,
                    lng: v.long
                },
                icon: {
                    url: '/assets/btt/images/busMarker.svg'
                },
                map: map,
                zIndex: 1
            });

            self.markers.push(stopMarker);

            if (isServiceWorkerSupported()) {
                google.maps.event.addListener(stopMarker, 'click', function (e) {
                    if (isNotificationGranted()) {
                        let busStopId = $(this)[0].id;
                        self.notifyMe(busStopId);

                        // ga('send', 'event', 'Notify', 'click');
                        toaster('You will be notified when your stop is approaching. ' + busStopId);
                    } else {
                        toaster('Please enable your notifications to know if your bus is approaching.');
                    }
                });
            }
        });

        // Add a marker clusterer to manage the markers.
        self.initClusterMarker();

        self.callApi();
    }

    initClusterMarker() {
        const self = this;

        if (typeof MarkerClusterer == "undefined") {
            setTimeout(function () {
                self.initClusterMarker();
            }, 500);
        } else {
            let clusterStyles = [
                {
                    url: '/assets/btt/images/cluster.svg',
                    height: 40,
                    width: 40,
                    textColor: '#ffffff'
                }
            ],
            markerCluster = new MarkerClusterer(self.map, self.markers, {
                styles: clusterStyles,
                imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                maxZoom: 15,
                averageCenter: true
            });
        }
    }

    notifyMe(id) {
        const that = this;

        console.log('endpoint:  ' + window.II.pushData.endpoint)

        fetch('//' + BASE_URL + '/sendNotification', {
            method: 'post',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                endpoint: window.II.pushData.endpoint,
                key: window.II.pushData.key,
                authSecret: window.II.pushData.authSecret,
                busId: getQueryVariable('busId'),
                busStopId: id,
                vehicleRef: getQueryVariable('vehicleRef')
            })
        });
    }

    processData(xml) {
        const self = this;

        let xmlDoc = $.parseXML(xml),
            $xml = $(xmlDoc),
            $status = $xml.find('Status')[0].innerHTML == 'true' ? true : false,
            $monitoringRef = $xml.find('MonitoringRef'),
            isVehicleFound = false;

        if (!$status) {
            toaster('Whoops! Something went wrong! Error (' + $xml.find('ErrorText')[0].innerHTML + ')');
            return false;
        }

        console.log(xmlDoc);

        if (self.isIntervalInit) {
            $.each(self.markers, function (i, v) {
                self.markers[i].setMap(null);
            });
        } else {
            self.isIntervalInit = true;
            self.refreshInterval = setInterval(function () {
                self.callApi();
            }, 10000);
        }

        let $vehicleRefQuery = getQueryVariable('vehicleRef'),
            $vehicleActivity = $xml.find('VehicleActivity'),
            $vehicleLocation,
            $vehicleLat,
            $vehicleLng,
            vehicleRef,
            directionRef,
            busMarker,
            $v;

        $.each($vehicleActivity, function (i, v) {
            $v = $(v);
            $vehicleLocation = $v.find('VehicleLocation');
            $vehicleLat = $vehicleLocation.find('Latitude');
            $vehicleLng = $vehicleLocation.find('Longitude');
            vehicleRef = $v.find('VehicleRef');
            directionRef = $v.find('DirectionRef');

            if ($vehicleLat[0] != undefined && $vehicleLng[0] != undefined && vehicleRef[0] != undefined) {
                if (vehicleRef[0].innerHTML == $vehicleRefQuery) {
                    self.busDir = directionRef[0].innerHTML == 'A' ? 0 : 1;

                    self.drawRoute();

                    busMarker = new google.maps.Marker({
                        icon: 'https://maps.google.com/mapfiles/kml/paddle/' + directionRef[0].innerHTML + '_maps.png',
                        position: {
                            lat: Number($vehicleLat[0].innerHTML),
                            lng: Number($vehicleLng[0].innerHTML)
                        },
                        map: self.map
                    });

                    self.markers.push(busMarker);

                    isVehicleFound = true;
                }
            }
        });

        if (!isVehicleFound) {
            toaster('Whoops! Sorry the vehicle you are tracking can not be found. Try again later.');
            clearInterval(self.refreshInterval);
        }
    }

    callApi() {
        const self = this;

        self.busId = getQueryVariable('busId');

        if (self.busId < 10) {
            self.busId = '000' + self.busId.toString();
        } else if (self.busId < 100) {
            self.busId = '00' + self.busId.toString();
        } else if (self.busId < 1000) {
            self.busId = '0' + self.busId.toString();
        }

        $.ajax({
            url: 'https://cors-ahead.herokuapp.com/http://siri.nxtbus.act.gov.au:11000/' + API_KEY + '/vm/service.xml',
            data: '<?xml version="1.0" encoding="iso-8859-1" standalone="yes"?><Siri version="2.0" xmlns:ns2="http://www.ifopt.org.uk/acsb" xmlns="http://www.siri.org.uk/siri" xmlns:ns4="http://datex2.eu/schema/2_0RC1/2_0" xmlns:ns3="http://www.ifopt.org.uk/ifopt"><ServiceRequest><RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp><RequestorRef>' + API_KEY + '</RequestorRef><VehicleMonitoringRequest version="2.0"><RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp><VehicleMonitoringRef>VM_ACT_' + self.busId + '</VehicleMonitoringRef></VehicleMonitoringRequest></ServiceRequest></Siri>',
            type: 'POST',
            contentType: "text/xml",
            dataType: "text",
            success: function (xml) {
                self.processData(xml);
            },
            error: function (error) {
                console.log(error);

                toaster('Whoops! Something went wrong! Error (' + error.status + ' ' + error.statusText + ')');
            }
        });
    }

    drawRoute() {
        const self = this;

        let busCoordinates = [];

        if (self.isRouteDrawn) {
            return false;
        }

        $.ajax({
            url: '//' + BASE_URL + '/getBusPath',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify({
                busId: self.busId,
                busDir: self.busDir
            }),
            dataType: 'json',
            success: function (data) {
                console.log(data);

                var busPath = new google.maps.Polyline({
                    path: data.busCoordinates,
                    geodesic: true,
                    strokeColor: '#cc0000',
                    strokeOpacity: 0.75,
                    strokeWeight: 5
                });

                busPath.setMap(self.map);
            },
            error: function (error) {
                console.log(error);
            }
        });

        self.isRouteDrawn = true;
    }
}
