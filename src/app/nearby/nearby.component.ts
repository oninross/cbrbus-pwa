import { Component, OnInit, Inject } from '@angular/core';
import { GlobalVariable } from '../__shared/globals';

import { TweenMax, Expo } from 'gsap/src/uncompressed/TweenMax';
import { DomService } from '../__shared/dom-service';
import { ToasterComponent } from '../toaster/toaster.component';
import { slideInOutAnimation } from '../__shared/animations';
import { Router } from '@angular/router';
import { Helpers } from '../__shared/helpers';

declare const google: any;
declare const MarkerClusterer: any;

class MapSettings {
    lat: Number;
    long: Number;
    zoom: Number;
    marker: String;
}

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

    constructor(
        public globalVariable: GlobalVariable,
        public helpers: Helpers,
        private router: Router,
        private domService: DomService
    ) {
        const self = this;

        // Attaching a property in the windows object
        (<any>window).II = {
            googleMap: this
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                self.mapSettings = {
                    lat: position.coords.latitude,
                    long: position.coords.longitude,
                    zoom: self.zoomLevel,
                    marker: self.globalVariable.MARKER_URL
                }

                self.loadGoogleMap();
            });

            setInterval(function () {
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
                isToaster: true,
                text: 'Geolocation is not supported or disabled by this browser.'
            });

            this.isGeolocationEnabled = false;

            this.mapSettings = {
                'lat': -35.2823083,
                'long': 149.1285561,
                'zoom': 15,
                'marker': self.globalVariable.MARKER_URL
            };

            this.loadGoogleMap();
        }

        const event = new Event('resize'),
            header = <HTMLElement>document.getElementsByClassName('header')[0];

        window.addEventListener('resize', this.helpers.debounce(function () {
            document.getElementById('map').style.height = window.outerHeight - header.offsetHeight + 'px';
        }, 250, false));

        window.dispatchEvent(event);
    }

    ngOnInit() { }

    loadGoogleMap(): void {
        const script = document.createElement('script'),
            scriptStr = '//maps.googleapis.com/maps/api/js?key=' + this.globalVariable.GMAP_API_KEY + '&callback=II.googleMap.initMap',
            clusterScript = document.createElement('script'),
            clusterScriptStr = '//developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js';

        clusterScript.type = 'text/javascript';
        clusterScript.src = clusterScriptStr;
        clusterScript.async = true;
        clusterScript.defer = true;
        document.body.appendChild(clusterScript);

        script.type = 'text/javascript';
        script.src = scriptStr;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
    }

    initMap(): void {
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

            myLocationBtn.addEventListener('click', function (e) {
                e.preventDefault();

                map.setCenter({
                    lat: self.mapSettings.lat,
                    lng: self.mapSettings.long
                });
            });
        }
    }

    updateMarker(): void {
        const self = this;

        this.currentMarker.setPosition({
            lat: self.mapSettings.lat,
            lng: self.mapSettings.long
        });
    }

    initClusterMarker(): void {
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
