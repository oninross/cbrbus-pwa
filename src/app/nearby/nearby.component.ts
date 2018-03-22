import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';

import { TweenMax, Expo } from 'gsap/src/uncompressed/TweenMax';
import { ToasterComponent } from '../toaster/toaster.component';

import { GlobalVariable } from '../__shared/globals';
import { Helpers } from '../__shared/helpers';
import { DomService } from '../__shared/dom-service';
import { slideInOutAnimation } from '../__shared/animations';
import '../__shared/mapSettings';

declare const google: any;
declare const MarkerClusterer: any;

@Component({
    selector: 'app-nearby',
    templateUrl: './nearby.component.html',
    styleUrls: ['./nearby.component.scss'],
    providers: [GlobalVariable, Helpers],
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' }
})
export class NearbyComponent implements OnInit {
    isGeolocationEnabled: Boolean = true;
    zoomLevel: Number = 17;
    markers: Array<Object> = [];
    mapSettings: MapSettings;
    map = null;
    currentMarker = null;
    refreshInterval: number = 0;

    constructor(
        private globalVariable: GlobalVariable,
        private helpers: Helpers,
        private router: Router,
        private domService: DomService
    ) { }

    ngOnInit() {
        const self = this;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                self.mapSettings = {
                    lat: position.coords.latitude,
                    long: position.coords.longitude,
                    zoom: self.zoomLevel,
                    marker: self.globalVariable.MARKER_URL
                }

                self.initMap();
            });

            self.refreshInterval = <any>setInterval(function () {
                navigator.geolocation.getCurrentPosition(function (position) {
                    self.mapSettings = {
                        lat: position.coords.latitude,
                        long: position.coords.longitude,
                        zoom: self.zoomLevel,
                        marker: self.globalVariable.MARKER_URL
                    };
                });

                self.updateMarker();
            }, 5000);
        } else {
            this.domService.appendComponentToBody(ToasterComponent, {
                text: 'Geolocation is not supported or disabled by this browser.'
            });

            this.isGeolocationEnabled = false;

            this.mapSettings = {
                'lat': -35.2823083,
                'long': 149.1285561,
                'zoom': 15,
                'marker': self.globalVariable.MARKER_URL
            };

            this.initMap();
        }

        const event = new Event('resize');

        window.addEventListener('resize', function (e) {
            self.resizeWindow(this, e);
        });

        window.dispatchEvent(event);
    }


    ngOnDestroy() {
        clearInterval(this.refreshInterval);
    }

    resizeWindow(el, e) {
        const header = <HTMLElement>document.getElementsByClassName('header')[0];

        document.getElementById('map').style.height = window.outerHeight - header.offsetHeight + 'px';
    }

    initMap() {
        let self = this,
            center: Object = {
                lat: this.mapSettings.lat,
                lng: this.mapSettings.long
            },
            busMarker = null;

        const loader = document.getElementsByClassName('loader')[0],
            currentIcon = {
                url: this.mapSettings.marker,
                size: new google.maps.Size(24, 24),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(12, 12)
            },
            map = new google.maps.Map(document.getElementById('map'), {
                zoom: this.mapSettings.zoom,
                center: center,
                streetViewControl: false,
                mapTypeControl: false
            }),
            stopIcon = {
                url: '/assets/cbrbus/images/stopMarker.png',
                size: new google.maps.Size(32, 38),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(16, 38)
            };

        TweenMax.to(loader, 0.75, {
            autoAlpha: 0,
            scale: 0,
            ease: Expo.easeOut,
            onComplete: function () {
                loader.parentNode.removeChild(loader);
            }
        });

        this.map = map;

        this.currentMarker = new google.maps.Marker({
            icon: currentIcon,
            position: center,
            map: map
        });


        let SERVICES = this.globalVariable.SERVICES;
        for (let i = 0, l = SERVICES.length; i < l; i++) {
            let v = SERVICES[i];

            busMarker = new google.maps.Marker({
                id: v.data.toString(),
                icon: stopIcon,
                position: {
                    lat: v.lat,
                    lng: v.long
                },
                map: map
            });

            self.markers.push(busMarker);

            let id = '';
            google.maps.event.addListener(busMarker, 'click', function (e) {
                id = this.id;

                let busStopName = self.globalVariable.SERVICES.map(function (v, i) {
                    if (v.data == id) {
                        self.router.navigate(['/busstop/'], {
                            queryParams: {
                                busStopId: id,
                                busStopName: v.name
                            }
                        });
                    }
                });
            });
        }


        // Add a marker clusterer to manage the markers.
        this.initClusterMarker();

        if (this.isGeolocationEnabled) {
            let myLocationBtn = <HTMLElement>document.getElementsByClassName('widget-mylocation-button')[0];
            myLocationBtn.style.display = 'block';
        }
    }

    centerMap() {
        this.map.setCenter({
            lat: this.mapSettings.lat,
            lng: this.mapSettings.long
        });
    }

    updateMarker() {
        const self = this;

        this.currentMarker.setPosition({
            lat: self.mapSettings.lat,
            lng: self.mapSettings.long
        });
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
                    url: '/assets/cbrbus/images/cluster.svg',
                    height: 40,
                    width: 40,
                    textColor: '#ffffff'
                }
            ],
                markerCluster = new MarkerClusterer(self.map, self.markers, {
                    styles: clusterStyles,
                    imagePath: '//developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                    maxZoom: 15,
                    averageCenter: true
                });
        }
    }
}
