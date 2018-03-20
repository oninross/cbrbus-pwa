import { Component, OnInit, Input } from '@angular/core';
import { Helpers } from '../__shared/helpers';
import { GlobalVariable } from '../__shared/globals';

import { TweenMax, Expo } from 'gsap/src/uncompressed/TweenMax';
import { DomService } from '../__shared/dom-service';
import { ToasterComponent } from '../toaster/toaster.component';

import { parseString } from 'xml2js/lib/xml2js';
import { CardEmptyComponent } from '../card-empty/card-empty.component';
import { CardHeaderComponent } from '../card-header/card-header.component';
import { BookmarksComponent } from '../bookmarks/bookmarks.component';

@Component({
    selector: 'app-busstop',
    templateUrl: './busstop.component.html',
    styleUrls: [
        './busstop.component.scss',
        '../btn/btn.component.scss',
        '../toggle/toggle.component.scss',
        '../card/card.component.scss',
    ]
})
export class BusStopComponent implements OnInit {
    @Input() index: number = 0;
    @Input() text: string = '';
    @Input() busesArr: Array<any> = [];
    @Input() bookmarkArr: Array<any> = [];

    busStopId: number;
    busStopName: string;
    isBookmarked: boolean;
    loader;
    refresh;
    bookmark;

    constructor(
        private globalVariable: GlobalVariable,
        private helpers: Helpers,
        private domService: DomService,
        private bookmarks: BookmarksComponent
    ) { }

    ngOnInit() {
        const self = this,
            sortToggle = <HTMLInputElement>document.getElementById('sort-toggle');

        if (this.helpers.getQueryVariable('busStopId')) {
            this.busStopId = this.helpers.getQueryVariable('busStopId');
            this.busStopName = this.getBusStopName();
            this.isBookmarked = this.bookmarks.checkBookmark(self.busStopId);
        }

        self.lookupBusId(this.busStopId, this.busStopName);

        self.loader = document.getElementsByClassName('loader')[0];
        self.refresh = document.getElementsByClassName('js-refresh')[0];
        self.globalVariable.isSortByTime = this.helpers.getSortByTime();

        if (self.globalVariable.isSortByTime) {
            sortToggle.setAttribute('checked', 'checked');
        };

        sortToggle.addEventListener('click', function () {
            if (this.checked) {
                self.globalVariable.isSortByTime = true;
            } else {
                self.globalVariable.isSortByTime = false;
            }

            self.helpers.setSortByTime(self.globalVariable.isSortByTime);
            self.refreshTimetable();
        });

        self.refresh.addEventListener('click', function (e) {
            e.preventDefault();

            self.refreshTimetable();
        });
    }

    refreshTimetable() {
        let self = this,
            icon = this.refresh.querySelector('.icon');

        TweenMax.to(icon, 1, {
            rotation: 360,
            ease: Expo.easeOut,
            onComplete: function () {
                TweenMax.set(icon, {
                    rotation: 0
                });
            }
        });

        TweenMax.to(self.loader, 0.75, {
            autoAlpha: 1,
            scale: 1,
            ease: Expo.easeOut
        });

        TweenMax.staggerTo('.card', 0.75, {
            opacity: 0,
            top: -50,
            ease: Expo.easeOut
        }, 0.1, function () {
            self.busesArr = [];
            self.bookmarkArr = [];
            self.lookupBusId(self.busStopId, null);
        });
    }

    lookupBusId(id, name) {
        const self = this,
            loader = document.getElementsByClassName('loader')[0];

        let xml = `<?xml version="1.0" encoding="iso-8859-1" standalone="yes"?>
            <Siri version="2.0" xmlns:ns2="http://www.ifopt.org.uk/acsb" xmlns="http://www.siri.org.uk/siri" xmlns:ns4="http://datex2.eu/schema/2_0RC1/2_0" xmlns:ns3="http://www.ifopt.org.uk/ifopt">
                <ServiceRequest>
                    <RequestTimestamp>` + new Date().toISOString() + `</RequestTimestamp>
                    <RequestorRef>` + self.globalVariable.API_KEY + `</RequestorRef>
                    <StopMonitoringRequest version="2.0">
                        <PreviewInterval>PT60M</PreviewInterval>
                        <RequestTimestamp>` + new Date().toISOString() + `</RequestTimestamp>
                        <MonitoringRef>` + id + `</MonitoringRef>
                    </StopMonitoringRequest>
                </ServiceRequest>
            </Siri>`;

        var request = new XMLHttpRequest();
        request.open('POST', 'https://cors-anywhere.herokuapp.com/http://siri.nxtbus.act.gov.au:11000/' + self.globalVariable.API_KEY + '/sm/service.xml', true);
        request.setRequestHeader('Content-Type', 'text/xml');
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                TweenMax.to(loader, 0.75, {
                    autoAlpha: 0,
                    scale: 0,
                    ease: Expo.easeOut,
                    onComplete: function () {
                        self.convertXML(request.response);
                    }
                });
            }
        };

        request.onerror = function () {
            console.log(request.responseText);
            self.domService.appendComponentToBody(ToasterComponent, {
                text: request.responseText
            });
        };

        request.send(xml);
    }

    processData(json) {
        const self = this,
            serviceDelivery = json.Siri.ServiceDelivery[0],
            status = (serviceDelivery.Status[0] === 'true'),
            cardHeader = new CardHeaderComponent();

        if (!status) {
            self.domService.appendComponentToBody(ToasterComponent, {
                text: 'Whoops! Something went wrong!'
            });
            return false;
        }

        let isBusPresent: boolean = false,
            now = new Date(),
            obj: object = {},
            stopMonitoringDelivery: Array<any> = serviceDelivery.StopMonitoringDelivery,
            busArr: Array<any> = [],
            vehicleFeatureArr: Array<any> = [],
            tempArr: Array<number> = [],
            etaMinArr: Array<number> = [],
            vehicleRefNumArr: Array<number> = [],
            vehicleRefNum: number = 0,
            serviceNum: number = 0,
            eta: number = 0,
            etaMin: number = 0,
            icon: string = '',
            vehicleFeatureRef: string = '',
            arr: Date;

        if (stopMonitoringDelivery == undefined) {
            self.domService.appendComponentToBody(CardEmptyComponent, {});
        } else {
            // Display Bus Stop Name if Available
            if (self.busStopName !== undefined) {
                cardHeader.setCardHeader(self.busStopId, self.busStopName, self.isBookmarked);
            }

            let monitoredStopVisit = stopMonitoringDelivery[0].MonitoredStopVisit;
            if (monitoredStopVisit.length) {
                console.log('A')

                for (let i = 0, l = monitoredStopVisit.length; i < l; i++) {
                    isBusPresent = false;

                    // Get vehicle reference number
                    vehicleRefNumArr = [];
                    vehicleRefNum = monitoredStopVisit[i].MonitoredVehicleJourney[0].VehicleRef;
                    vehicleRefNumArr.push(vehicleRefNum);

                    // Check for Arrival time
                    let monitoredCall = monitoredStopVisit[i].MonitoredVehicleJourney[0].MonitoredCall[0];

                    if (monitoredCall.ExpectedArrivalTime == undefined) {
                        if (monitoredCall.AimedArrivalTime == undefined) {
                            arr = new Date(monitoredCall.AimedDepartureTime);
                        } else {
                            arr = new Date(monitoredCall.AimedArrivalTime);
                        }
                    } else {
                        arr = new Date(monitoredCall.ExpectedArrivalTime);
                    }


                    // Calculate ETA
                    eta = arr.getTime() - now.getTime();
                    etaMin = Math.round(eta / 60000);
                    etaMinArr = [];
                    etaMinArr.push(etaMin);


                    // Check for Vehicle Features (Wheelchair or Bike Rack)
                    vehicleFeatureArr = [];
                    vehicleFeatureRef = monitoredStopVisit[i].MonitoredVehicleJourney[0].VehicleFeatureRef;
                    if (Array.isArray(vehicleFeatureRef)) {
                        for (let j = 0, m = vehicleFeatureRef.length; j < m; j++) {
                            icon = vehicleFeatureRef[j];
                            icon = icon.replace(' ', '-').toLowerCase();
                            vehicleFeatureArr.push(icon);
                        }
                    } else {
                        if (vehicleFeatureRef !== undefined) {
                            icon = vehicleFeatureRef;
                            icon = icon.replace(' ', '-').toLowerCase();
                            vehicleFeatureArr.push(icon);
                        }
                    }

                    serviceNum = monitoredStopVisit[i].MonitoredVehicleJourney[0].PublishedLineName[0];

                    obj = {
                        busStopId: self.busStopId,
                        vehicleRefNum: vehicleRefNumArr,
                        serviceNum: serviceNum,
                        feature: vehicleFeatureArr,
                        estimatedArrival: etaMinArr
                    };

                    for (let j = 0, m = busArr.length; j < m; j++) {
                        if (busArr[j].serviceNum == serviceNum) {
                            isBusPresent = true;

                            // Bus Service is present
                            if (busArr[j].estimatedArrival.length < 2) {
                                // Estimated Arrival per service is less than 3
                                tempArr = [];
                                tempArr.push(etaMin);
                                busArr[j].estimatedArrival = busArr[j].estimatedArrival.concat(tempArr);

                                tempArr = [];
                                tempArr.push(vehicleRefNum);
                                busArr[j].vehicleRefNum = busArr[j].vehicleRefNum.concat(tempArr);
                            } else {
                                // Replace timing that has earlier arrival
                                for (let k = 0, m = busArr[j].estimatedArrival.length; k < m; k++) {
                                    if (busArr[j].estimatedArrival[k] > etaMin && busArr[j].estimatedArrival[k] != etaMin) {
                                        busArr[j].estimatedArrival[k] = etaMin;
                                        busArr[j].vehicleRefNum[k] = vehicleRefNum;
                                        // return false;
                                    }
                                }
                            }
                        }
                    }

                    if (!isBusPresent) {
                        busArr.push(obj);
                    }
                }
            } else {

            }

            // Sort bus timings
            busArr.forEach(function (v, i) {
                if ((v.estimatedArrival.length > 1) && (v.estimatedArrival[0] > v.estimatedArrival[1])) {
                    [v.estimatedArrival[0], v.estimatedArrival[1]] = [v.estimatedArrival[1], v.estimatedArrival[0]];
                    tempArr = v.vehicleRefNum;
                    [tempArr[0], tempArr[1]] = [tempArr[1], tempArr[0]];
                    v.vehicleRefNum = tempArr;
                }
            });

            let busArrSplice = busArr.slice(0);
            if (self.globalVariable.isSortByTime) {
                busArrSplice.sort(function (a, b) {
                    return a.estimatedArrival[0] - b.estimatedArrival[0];
                });
            } else {
                busArrSplice.sort(function (a, b) {
                    return a.serviceNum - b.serviceNum;
                });
            }

            self.bookmarkArr.push({
                text: self.busStopName,
                id: self.busStopId,
                isBookmark: self.bookmarks.checkBookmark(self.busStopId) == true ? 'active' : ''
            });

            self.busesArr = busArrSplice;
        }

        setTimeout(() => {
            TweenMax.to('.btn-refresh', 0.75, {
                autoAlpha: 1,
                top: 0,
                ease: Expo.easeOut
            });

            TweenMax.to('.sort-toggle', 0.75, {
                autoAlpha: 1,
                top: 0,
                ease: Expo.easeOut,
                delay: 0.1
            });

            TweenMax.staggerTo('.card', 0.75, {
                opacity: 1,
                top: 0,
                ease: Expo.easeOut,
                delay: 0.2
            }, 0.1);

            self.bookmark = document.getElementsByClassName('js-bookmark')[0];

            self.bookmark.addEventListener('click', function (e) {
                e.preventDefault();

                self.bookmarks.setBookmark(this.dataset.id);

            });
        }, 0);
    }

    convertXML(xml) {
        const self = this;

        parseString(xml, function (err, result) {
            self.processData(result);
        });
    }

    getBusStopName() {
        const self = this;

        if (self.helpers.getQueryVariable('busStopName')) {
            return decodeURI(self.helpers.getQueryVariable('busStopName'));
            // } else if (self.busStopName == '') {
            //     return _busStopName;
        }
    }
}
