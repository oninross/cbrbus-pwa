'use strict';

// import L from 'leaflet';
// import provider from 'providers';
// import CartoDB from 'cartodb';
import { ripple, toaster } from './_material';
import { loader, GMAP_API_KEY, debounce, easeOutExpo } from './_helper';

let $window = $(window),
    markers = [],
    busArr = [],
    busObjArr = [],
    markerUrl = '/assets/btt/images/currentMarker.svg',
    zoomLevel = 17,
    busId,
    busStopName,
    map;

export default class NearBy {
    constructor() {
        var that = this;

        that.isGeolocationEnabled = true;

        window.II.googleMap = this;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                that.mapSettings = {
                    'lat': position.coords.latitude,
                    'long': position.coords.longitude,
                    'zoom': zoomLevel,
                    'marker': markerUrl
                };

                that.loadGoogleMap();
            });

            setInterval(function () {
                navigator.geolocation.getCurrentPosition(function (position) {
                    that.mapSettings = {
                        'lat': position.coords.latitude,
                        'long': position.coords.longitude,
                        'zoom': zoomLevel,
                        'marker': markerUrl
                    };
                });

                that.updateMarker();
            }, 5000);
        } else {
            toaster('Geolocation is not supported or disabled by this browser.');

            that.isGeolocationEnabled = false;

            that.mapSettings = {
                'lat': -35.2823083,
                'long': 149.1285561,
                'zoom': 15,
                'marker': markerUrl
            };

            that.loadGoogleMap();
        }

        $window.on('resize', debounce(function () {
            $('#map').css({
                height: $(document).outerHeight() - $('.header').outerHeight()
            });
        }, 250)).trigger('resize');
    }

    loadGoogleMap() {
        var script = document.createElement('script'),
            scriptStr = 'https://maps.googleapis.com/maps/api/js?key=' + GMAP_API_KEY + '&callback=II.googleMap.loadData',
            clusterScript = document.createElement('script'),
            clusterScriptStr = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js';

        clusterScript.type = 'text/javascript';
        clusterScript.src = clusterScriptStr;
        clusterScript.async = 'async';
        clusterScript.defer = 'defer';
        document.body.appendChild(clusterScript);

        script.type = 'text/javascript';
        script.src = scriptStr;
        script.async = 'async';
        script.defer = 'defer';
        document.body.appendChild(script);
    }

    loadData() {
        var that = this;

        $.ajax({
            url: '/assets/btt/api/services.json',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                that.initMap(data);
                TweenMax.to('.loader', 0.75, {
                    autoAlpha: 0,
                    scale: 0,
                    ease: Expo.easeOut,
                    onComplete: function () {
                        $('.loader').remove();
                    }
                });
            },
            error: function (error) {
                console.log(error);
                TweenMax.to('.loader', 0.75, {
                    autoAlpha: 0,
                    scale: 0,
                    ease: Expo.easeOut,
                    onComplete: function () {
                        $('.loader').remove();
                    }
                });

                toaster('Whoops! Something went wrong! Error (' + error.status + ' ' + error.statusText + ')');
            }
        });
    }

    initMap(json) {
        var that = this,
            center = {
                lat: that.mapSettings.lat,
                lng: that.mapSettings.long
            },
            currentIcon = {
                url: that.mapSettings.marker,
                size: new google.maps.Size(24, 24),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(12, 12)
            },
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: that.mapSettings.zoom,
                center: center,
                streetViewControl: false,
                mapTypeControl: false
            }),
            stopIcon = {
                url: '/assets/btt/images/stopMarker.svg',
                size: new google.maps.Size(40, 48),
                origin: new google.maps.Point(0, -10),
                anchor: new google.maps.Point(20, 48)
            },
            busMarker;

        that.map = map;

        that.currentMarker = new google.maps.Marker({
            icon: currentIcon,
            position: center,
            map: map
        });

        $.each(json, function (i, v) {
            busMarker = new google.maps.Marker({
                icon: stopIcon,
                label: v.data,
                position: {
                    lat: v.lat,
                    lng: v.long
                },
                map: map
            });

            markers.push(busMarker);

            var label = '';
            google.maps.event.addListener(busMarker, 'click', function (e) {
                label = this.label;

                var busStopName = $.map(json, function (n) {
                        if (n.data == label) {
                            return n.name;
                        }
                    });

                window.location.href = '/busstop/?busStopId=' + label + '&busStopName=' + busStopName;
            });
        });

        // Add a marker clusterer to manage the markers.
        that.initClusterMarker();

        if (that.isGeolocationEnabled) {
            $('.widget-mylocation-button')
                .fadeIn()
                .on('click', function (e) {
                    e.preventDefault();

                    map.setCenter({
                        lat: that.mapSettings.lat,
                        lng: that.mapSettings.long
                    });
                });
        }
    }

    updateMarker() {
        var that = this;

        that.currentMarker.setPosition({
            lat: this.mapSettings.lat,
            lng: this.mapSettings.long
        });
    }

    initClusterMarker() {
        var that = this;

        if (typeof MarkerClusterer == "undefined") {
            setTimeout(function() {
                that.initClusterMarker();
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
            markerCluster = new MarkerClusterer(that.map, markers, {
                styles: clusterStyles,
                imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                maxZoom: 15,
                averageCenter: true
            });
        }
    }
}
