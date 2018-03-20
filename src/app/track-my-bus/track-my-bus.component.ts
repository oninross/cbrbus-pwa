import { Component, OnInit } from '@angular/core';

import { TweenMax, Expo } from 'gsap/src/uncompressed/TweenMax';
import { parseString } from 'xml2js/lib/xml2js';

import { GlobalVariable } from '../__shared/globals';
import { Helpers } from '../__shared/helpers';
import '../__shared/mapSettings';
import { DomService } from '../__shared/dom-service';
import { ToasterComponent } from '../toaster/toaster.component';
import { slideInOutAnimation } from '../__shared/animations';

declare const google: any;
declare const MarkerClusterer: any;

@Component({
    selector: 'app-track-my-bus',
    templateUrl: './track-my-bus.component.html',
    styleUrls: ['./track-my-bus.component.scss'],
    providers: [GlobalVariable, Helpers],
    animations: [slideInOutAnimation],
    host: { '[@slideInOutAnimation]': '' }
})
export class TrackMyBusComponent implements OnInit {

    markers: Array<any> = [];
    refreshInterval: number = 0;
    busDir: number = 0;
    busStopId: number = 0;
    isRouteDrawn: boolean = false;
    isIntervalInit: boolean = false;
    isGeolocationEnabled: boolean = false;
    map = null;
    currentMarker = null;
    busStopMarker = null;
    busId = null;
    vehicleRef = null;

    mapSettings: MapSettings;

    constructor(
        private globalVariable: GlobalVariable,
        private helpers: Helpers,
        private domService: DomService
    ) {
        const self = this;

        console.log(self.globalVariable.isMapLoaded);

        self.busId = this.helpers.getQueryVariable('busId');
        self.busStopId = this.helpers.getQueryVariable('busStopId');
        self.vehicleRef = this.helpers.getQueryVariable('vehicleRef');

        self.isGeolocationEnabled = true;

        navigator.geolocation.getCurrentPosition(function (position) {
            self.mapSettings = {
                'lat': position.coords.latitude,
                'long': position.coords.longitude,
                'zoom': 12,
                'marker': '/assets/cbrbus/images/currentMarker.svg'
                // 'marker': 'https://maps.google.com/mapfiles/kml/paddle/blu-blank_maps.png'
            };

            self.initMap();
        });

        const event = new Event('resize'),
            header = <HTMLElement>document.getElementsByClassName('header')[0];

        window.addEventListener('resize', this.helpers.debounce(function () {
            document.getElementById('map').style.height = window.outerHeight - header.offsetHeight + 'px';
        }, 250, false));

        window.dispatchEvent(event);
    }

    ngOnInit() { }

    ngOnDestroy() {
        clearInterval(this.refreshInterval);
    }

    initMap() {
        const self = this,
            SERVICES = this.globalVariable.SERVICES,
            center: Object = {
                lat: this.mapSettings.lat,
                lng: this.mapSettings.long
            },
            loader = document.getElementsByClassName('loader')[0],
            currentIcon = {
                url: this.mapSettings.marker,
                size: new google.maps.Size(24, 24),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(12, 12)
            },
            busStopIcon = {
                url: 'https://maps.google.com/mapfiles/kml/paddle/blu-blank_maps.png',
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(16, 48)
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

        let busMarker = null,
            busStopCenter,
            stopMarker;


        SERVICES.map(function (n) {
            if (n.data == self.busStopId) {
                busStopCenter = {
                    lat: n.lat,
                    lng: n.long
                };
            }
        });

        TweenMax.to(loader, 0.75, {
            autoAlpha: 0,
            scale: 0,
            ease: Expo.easeOut,
            onComplete: function () {
                loader.parentNode.removeChild(loader);
            }
        });

        this.map = map;

        self.currentMarker = new google.maps.Marker({
            icon: currentIcon,
            position: center,
            map: map
        });

        self.busStopMarker = new google.maps.Marker({
            icon: busStopIcon,
            position: busStopCenter,
            map: map
        });

        google.maps.event.addListener(self.busStopMarker, 'click', function (e) {
            map.setZoom(18);
            map.panTo(self.busStopMarker.position);
        });


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
                        // self.router.navigate(['/busstop/'], {
                        //     queryParams: {
                        //         busStopId: id,
                        //         busStopName: v.name
                        //     }
                        // });
                    }
                });
            });
        }


        // Add a marker clusterer to manage the markers.
        this.initClusterMarker();

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

    notifyMe(id) {
        const self = this;

        console.log('endpoint:  ' + (<any>window).II.pushData.endpoint)

        fetch('//' + this.globalVariable.BASE_URL + '/sendNotification', {
            method: 'post',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                endpoint: (<any>window).II.pushData.endpoint,
                key: (<any>window).II.pushData.key,
                authSecret: (<any>window).II.pushData.authSecret,
                busId: this.helpers.getQueryVariable('busId'),
                busStopId: id,
                vehicleRef: self.vehicleRef
            })
        });
    }

    processData(xml) {
        const self = this;

        let status: boolean = xml.Siri.ServiceDelivery[0].Status[0] == 'true' ? true : false,
            isVehicleFound: boolean = false;

        if (!status) {
            self.domService.appendComponentToBody(ToasterComponent, {
                text: 'Whoops! Something went wrong!'
            });
            return false;
        }

        if (self.isIntervalInit) {
            self.markers.forEach(function (el, i) {
                self.markers[i].setMap(null);
            });
        } else {
            self.isIntervalInit = true;
            self.refreshInterval = <any>setInterval(function () {
                self.callApi();
            }, 10000);
        }

        let vehicleActivity = xml.Siri.ServiceDelivery[0].VehicleMonitoringDelivery[0].VehicleActivity,
            monitoredJourney,
            vehicleLocation,
            vehicleLat,
            vehicleLng,
            directionRef,
            vehicleRef,
            busMarker;


        console.log(xml)
        vehicleActivity.forEach(function (el, i) {
            monitoredJourney = el.MonitoredVehicleJourney[0];

            if (typeof monitoredJourney.VehicleLocation !== 'undefined' && typeof monitoredJourney.VehicleFeatureRef !== 'undefined') {
                vehicleLocation = monitoredJourney.VehicleLocation[0];
                vehicleRef = monitoredJourney.VehicleRef[0];
                vehicleLat = vehicleLocation.Latitude[0];
                vehicleLng = vehicleLocation.Longitude[0];
                directionRef = monitoredJourney.DirectionRef[0];

                if (vehicleRef == self.vehicleRef) {
                    self.busDir = directionRef[0].innerHTML == 'A' ? 0 : 1;
                    self.drawRoute();

                    busMarker = new google.maps.Marker({
                        icon: 'https://maps.google.com/mapfiles/kml/paddle/' + directionRef + '_maps.png',
                        position: {
                            lat: Number(vehicleLat),
                            lng: Number(vehicleLng)
                        },
                        map: self.map
                    });

                    self.markers.push(busMarker);

                    isVehicleFound = true;
                }
            }
        });

        if (!isVehicleFound) {
            self.domService.appendComponentToBody(ToasterComponent, {
                text: 'Whoops! Sorry the vehicle you are tracking can not be found. Try again later.'
            });

            clearInterval(self.refreshInterval);
        }
    }

    callApi() {
        const self = this;

        if (self.busId < 10) {
            self.busId = '000' + self.busId.toString();
        } else if (self.busId < 100) {
            self.busId = '00' + self.busId.toString();
        } else if (self.busId < 1000) {
            self.busId = '0' + self.busId.toString();
        }

        let request = new XMLHttpRequest();
        request.open('POST', 'https://cors-anywhere.herokuapp.com/http://siri.nxtbus.act.gov.au:11000/' + self.globalVariable.API_KEY + '/vm/service.xml', true);
        request.setRequestHeader('Content-Type', 'text/xml');
        request.onload = function () {
            console.log(request);
            if (request.status >= 200 && request.status < 400) {
                self.convertXML(request.response);
            }
        };

        request.onerror = function () {
            console.log(request.responseText);
            self.domService.appendComponentToBody(ToasterComponent, {
                text: request.responseText
            });
        };

        request.send('<?xml version="1.0" encoding="iso-8859-1" standalone="yes"?><Siri version="2.0" xmlns:ns2="http://www.ifopt.org.uk/acsb" xmlns="http://www.siri.org.uk/siri" xmlns:ns4="http://datex2.eu/schema/2_0RC1/2_0" xmlns:ns3="http://www.ifopt.org.uk/ifopt"><ServiceRequest><RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp><RequestorRef>' + this.globalVariable.API_KEY + '</RequestorRef><VehicleMonitoringRequest version="2.0"><RequestTimestamp>' + new Date().toISOString() + '</RequestTimestamp><VehicleMonitoringRef>VM_ACT_' + self.busId + '</VehicleMonitoringRef></VehicleMonitoringRequest></ServiceRequest></Siri>');
    }

    drawRoute() {
        const self = this;

        let busCoordinates = [];

        if (self.isRouteDrawn) {
            return false;
        }

        let request = new XMLHttpRequest();
        request.open('POST', 'https://cors-anywhere.herokuapp.com/https://' + this.globalVariable.BASE_URL + '/getBusPath', true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                let busPath = new google.maps.Polyline({
                    path: JSON.parse(request.response).busCoordinates,
                    geodesic: true,
                    strokeColor: '#cc0000',
                    strokeOpacity: 0.75,
                    strokeWeight: 5
                });

                busPath.setMap(self.map);
            }
        };

        request.onerror = function () {
            console.log(request.responseText);
            self.domService.appendComponentToBody(ToasterComponent, {
                text: request.responseText
            });
        };

        request.send(JSON.stringify({
            busId: self.busId,
            busDir: self.busDir
        }));

        self.isRouteDrawn = true;
    }

    convertXML(xml) {
        const self = this;

        parseString(xml, function (err, result) {
            self.processData(result);
        });
    }
}
