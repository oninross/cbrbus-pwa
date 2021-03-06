'use strict';

import $ from "jquery";
import gsap from "gsap";
import doT from 'doT';
import { API_KEY, loader, getQueryVariable, isNotificationGranted, debounce, getSortByTime, setSortByTime } from '../../_assets/btt/js/_helper';
import { ripple, toaster } from '../../_assets/btt/js/_material';

import Bookmark from '../bookmark/bookmark';

export default class BusStop {
    constructor() {
        const self = this;

        self.isLoading = true;
        self.busStopId = 0;
        self.busStopName = '';
        self.isSortByTime = getSortByTime();

        self.bookmark = new Bookmark();

        if ($('.timetable').length) {
            if (getQueryVariable('busStopId')) {
                self.busStopId = getQueryVariable('busStopId');
            } else {
                self.busStopId = _busStopId;
            }

            self.lookupBusId(self.busStopId, self.getBusStopName());

            if (self.isSortByTime) {
                $('#sort-toggle').attr('checked', true);
            };

            $('.js-toggle-sort').on('click', function () {
                if ($('#sort-toggle:checked').length) {
                    self.isSortByTime = true;
                } else {
                    self.isSortByTime = false;
                }

                setSortByTime(self.isSortByTime);

                $('.js-refresh').trigger('click');
            });

            $('.js-refresh').on('click', function () {
                if (self.isLoading) {
                    return false;
                }

                $('body').append(loader);

                var $this = $(this),
                    $icon = $this.find('.icon');

                gsap.to($icon, 1, {
                    rotation: 360,
                    ease: "expo.out",
                    onComplete: function () {
                        gsap.set($icon, {
                            rotation: 0
                        });
                    }
                });

                gsap.to('.card', 0.75, {
                    opacity: 0,
                    top: -50,
                    ease: "expo.out",
                    stagger: 0.1,
                    onComplete: () => {
                        $('.cards-wrapper').empty();
                        self.lookupBusId(self.busStopId, null);
                    }
                })

                $('.cards-wrapper').off('click', '.card', self.cardListener);
            });

            $(window).on('resize', debounce(function () {
                $('#main').css({
                    height: $(window).outerHeight() - $('.header').outerHeight()
                });
            }, 250)).trigger('resize');
        }
    }

    lookupBusId(id, name) {
        const self = this;

        let $xml = '';

        self.busStopId = id;
        self.busStopName = name;
        self.isLoading = false;

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
            // url: 'https://cors-ahead.herokuapp.com/http://siri.nxtbus.act.gov.au:11000/' + API_KEY +'/vm/service.xml',
            url: 'https://cors-ahead.herokuapp.com/http://siri.nxtbus.act.gov.au:11000/' + API_KEY + '/sm/service.xml',
            data: $xml,
            type: 'POST',
            contentType: "text/xml",
            dataType: "text",
            success: function (xml) {
                gsap.to('.loader', 0.75, {
                    autoAlpha: 0,
                    scale: 0,
                    ease: "expo.out",
                    onComplete: function () {
                        $('.loader').remove();

                        self.processData(xml);
                    }
                });
            },
            error: function (error) {
                console.log(error);

                toaster('Whoops! Something went wrong! Error (' + error.status + ' ' + error.statusText + ')');
            }
        });
    }

    processData(xml) {
        const self = this;

        var xotree = new XML.ObjTree(),
            json = xotree.parseXML(xml),
            serviceDelivery = json.Siri.ServiceDelivery,
            $status = serviceDelivery.Status;

        if (!$status) {
            toaster('Whoops! Something went wrong!');
            return false;
        }

        let cardHeader = doT.template($('#card-header').html()),
            cardTemplate = doT.template($('#card-template').html()),
            cardEmptyTemplate = doT.template($('#card-empty-template').html()),
            now = new Date(),
            obj = {},
            busArr = [],
            vehicleFeatureArr = [],
            tempArr = [],
            etaMinArr = [],
            vehicleRefNumArr = [],
            vehicleRefNum = 0,
            serviceNum = 0,
            arr = 0,
            eta = 0,
            etaMin = 0,
            icon = '',
            cardMarkup = '',
            vehicleFeatureRef = '',
            isBusPresent = false;

        let $stopMonitoringDelivery = serviceDelivery.StopMonitoringDelivery;

        if ($stopMonitoringDelivery == undefined) {
            cardMarkup += cardEmptyTemplate({});
        } else {
            let $monitoredStopVisit = $stopMonitoringDelivery.MonitoredStopVisit
            // Display Bus Stop Name if Available
            if (self.busStopName != undefined) {
                obj = {
                    busStopName: self.busStopName,
                    busStopId: self.busStopId,
                    isBookmarked: self.bookmark.checkBookmark(self.busStopId) == true ? 'active' : ''
                };

                // console.log(obj)

                cardMarkup += cardHeader(obj);
            }

            // Create obj cards
            if ($monitoredStopVisit.length) {
                $.each($monitoredStopVisit, function (i, v) {
                    isBusPresent = false;

                    // Get vehicle reference number
                    vehicleRefNumArr = [];
                    vehicleRefNum = v.MonitoredVehicleJourney.VehicleRef;
                    vehicleRefNumArr.push(vehicleRefNum);

                    // Check for Arrival time
                    let $monitoredCall = v.MonitoredVehicleJourney.MonitoredCall;

                    if ($monitoredCall.ExpectedArrivalTime == undefined) {
                        if ($monitoredCall.AimedArrivalTime == undefined) {
                            arr = new Date($monitoredCall.AimedDepartureTime);
                        } else {
                            arr = new Date($monitoredCall.AimedArrivalTime);
                        }
                    } else {
                        arr = new Date($monitoredCall.ExpectedArrivalTime);
                    }

                    // Calculate ETA
                    eta = arr.getTime() - now.getTime();
                    etaMin = Math.round(eta / 60000);
                    etaMinArr = [];
                    etaMinArr.push(etaMin);


                    // Check for Vehicle Features (Wheelchair or Bike Rack)
                    vehicleFeatureArr = [];
                    vehicleFeatureRef = v.MonitoredVehicleJourney.VehicleFeatureRef;
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

                    serviceNum = v.MonitoredVehicleJourney.PublishedLineName;
                    obj = {
                        busStopId: self.busStopId,
                        vehicleRefNum: vehicleRefNumArr,
                        serviceNum: serviceNum,
                        feature: vehicleFeatureArr,
                        estimatedArrival: etaMinArr
                    }

                    $.each(busArr, function (i, v) {
                        if (v.serviceNum == serviceNum) {
                            isBusPresent = true;

                            // Bus Service is present
                            if (v.estimatedArrival.length < 2) {
                                // Estimated Arrival per service is less than 3
                                tempArr = [];
                                tempArr.push(etaMin);
                                v.estimatedArrival = v.estimatedArrival.concat(tempArr);

                                tempArr = [];
                                tempArr.push(vehicleRefNum);
                                v.vehicleRefNum = v.vehicleRefNum.concat(tempArr);
                            } else {
                                // Replace timing that has earlier arrival
                                $.each(v.estimatedArrival, function (ind, val) {
                                    if (val > etaMin && v.estimatedArrival[ind] != etaMin) {
                                        v.estimatedArrival[ind] = etaMin;
                                        v.vehicleRefNum[ind] = vehicleRefNum;
                                        return false;
                                    }
                                });
                            }
                        }
                    });

                    if (!isBusPresent) {
                        busArr.push(obj);
                    }
                });
            } else {
                isBusPresent = false;

                // Get vehicle reference number
                vehicleRefNumArr = [];
                vehicleRefNum = $monitoredStopVisit.MonitoredVehicleJourney.VehicleRef;
                vehicleRefNumArr.push(vehicleRefNum);

                // Check for Arrival time
                let $monitoredCall = $monitoredStopVisit.MonitoredVehicleJourney.MonitoredCall;

                if ($monitoredCall.ExpectedArrivalTime == undefined) {
                    if ($monitoredCall.AimedArrivalTime == undefined) {
                        arr = new Date($monitoredCall.AimedDepartureTime);
                    } else {
                        arr = new Date($monitoredCall.AimedArrivalTime);
                    }
                } else {
                    arr = new Date($monitoredCall.ExpectedArrivalTime);
                }

                // Calculate ETA
                eta = arr.getTime() - now.getTime();
                etaMin = Math.round(eta / 60000);
                etaMinArr = [];
                etaMinArr.push(etaMin);


                // Check for Vehicle Features (Wheelchair or Bike Rack)
                vehicleFeatureArr = [];
                vehicleFeatureRef = $monitoredStopVisit.MonitoredVehicleJourney.VehicleFeatureRef;
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

                serviceNum = $monitoredStopVisit.MonitoredVehicleJourney.PublishedLineName;
                obj = {
                    busStopId: self.busStopId,
                    vehicleRefNum: vehicleRefNumArr,
                    serviceNum: serviceNum,
                    feature: vehicleFeatureArr,
                    estimatedArrival: etaMinArr
                }

                $.each(busArr, function (i, v) {
                    if (v.serviceNum == serviceNum) {
                        isBusPresent = true;

                        // Bus Service is present
                        if (v.estimatedArrival.length < 2) {
                            // Estimated Arrival per service is less than 3
                            tempArr = [];
                            tempArr.push(etaMin);
                            v.estimatedArrival = v.estimatedArrival.concat(tempArr);

                            tempArr = [];
                            tempArr.push(vehicleRefNum);
                            v.vehicleRefNum = v.vehicleRefNum.concat(tempArr);
                        } else {
                            // Replace timing that has earlier arrival
                            $.each(v.estimatedArrival, function (ind, val) {
                                if (val > etaMin && v.estimatedArrival[ind] != etaMin) {
                                    v.estimatedArrival[ind] = etaMin;
                                    v.vehicleRefNum[ind] = vehicleRefNum;
                                    return false;
                                }
                            });
                        }
                    }
                });

                if (!isBusPresent) {
                    busArr.push(obj);
                }
            }

            // Sort bus timings
            $.each(busArr, function (i, v) {
            //     // Append Markup - FOR TESTING ONLY
            //     // cardMarkup += gulp (v);

                if ((v.estimatedArrival.length > 1) && (v.estimatedArrival[0] > v.estimatedArrival[1])) {
                    v.estimatedArrival.swap(0, 1);
                    tempArr = v.vehicleRefNum;
                    tempArr.swap(0, 1);
                    v.vehicleRefNum = tempArr;
                }
            });

            let busArrSplice = busArr.slice(0);

            if (self.isSortByTime) {
                busArrSplice.sort(function (a, b) {
                    return a.estimatedArrival[0] - b.estimatedArrival[0];
                });
            } else {
                busArrSplice.sort(function (a, b) {
                    return a.serviceNum - b.serviceNum;
                });
            }

            $.each(busArrSplice, function (i, v) {
                // Append Markup
                cardMarkup += cardTemplate(busArrSplice[i]);
            });
        }

        // Render Markup
        $('.cards-wrapper').html(cardMarkup);

        gsap.to('.btn-refresh', 0.75, {
            autoAlpha: 1,
            top: 0,
            ease: "expo.out"
        });

        gsap.to('.sort-toggle', 0.75, {
            autoAlpha: 1,
            top: 0,
            ease: "expo.out",
            delay: 0.1
        });

        gsap.to('.card', 0.75, {
            opacity: 1,
            top: 0,
            ease: "expo.out",
            delay: 0.2,
            stagger: 0.1
        })

        $('.cards-wrapper').on('click', '.card', self.cardListener);
    }

    cardListener() {
        const bookmark = new Bookmark();

        let $this = $(this),
            $busStopId = $this.data('busstopid'),
            $vehicleRefNum = $this.data('vehicleref'),
            $serviceRefNum = $this.data('servicenum');

        if ($this.hasClass('card__header')) {
            let $this = $(this),
                $id = $this.data('id');

            bookmark.setBookmark($id);

            return false;
        }

        if (!isNotificationGranted) {
            toaster('Please enable your notifications to know if your bus is approaching.');
        }

        if ($vehicleRefNum == '' || $vehicleRefNum == null || $vehicleRefNum == undefined) {
            toaster('Sorry, we can\t track this bus service.');
        } else {
            window.location.href = '/trackmybus/?busStopId=' + $busStopId + '&busId=' + $serviceRefNum + '&vehicleRef=' + $vehicleRefNum;
        }
    }

    getBusStopName() {
        if (getQueryVariable('busStopName')) {
            return decodeURI(getQueryVariable('busStopName'));
        } else if (self.busStopName == '') {
            return _busStopName;
        }
    }
}

Array.prototype.swap = function (x, y) {
    var b = this[x];
    this[x] = this[y];
    this[y] = b;
    return this;
};


// ========================================================================
//  XML.ObjTree -- XML source code from/to JavaScript object like E4X
//  http://www.utilities-online.info/xmltojson/#.WLSmJV9xWaV
// ========================================================================
if (typeof (XML) == 'undefined') {
    var XML = function () {};
}

//  constructor
XML.ObjTree = function () {
    return this;
};

//  class variables
XML.ObjTree.VERSION = "0.23";

//  object prototype
XML.ObjTree.prototype.xmlDecl = '<?xml version="1.0" encoding="UTF-8" ?>\n';
XML.ObjTree.prototype.attr_prefix = '-';

//  method: parseXML( xmlsource )
XML.ObjTree.prototype.parseXML = function (xml) {
    var root;
    if (window.DOMParser) {
        var xmldom = new DOMParser();
        //      xmldom.async = false;           // DOMParser is always sync-mode
        var dom = xmldom.parseFromString(xml, "application/xml");
        if (!dom) {
            return;
        }
        root = dom.documentElement;
    } else if (window.ActiveXObject) {
        xmldom = new ActiveXObject('Microsoft.XMLDOM');
        xmldom.async = false;
        xmldom.loadXML(xml);
        root = xmldom.documentElement;
    }
    if (!root) {
        return;
    }
    return this.parseDOM(root);
};

//  method: parseHTTP( url, options, callback )
XML.ObjTree.prototype.parseHTTP = function (url, options, callback) {
    var myopt = {};
    for (var key in options) {
        myopt[key] = options[key]; // copy object
    }
    if (!myopt.method) {
        if (typeof (myopt.postBody) == "undefined" &&
            typeof (myopt.postbody) == "undefined" &&
            typeof (myopt.parameters) == "undefined") {
            myopt.method = "get";
        } else {
            myopt.method = "post";
        }
    }
    if (callback) {
        myopt.asynchronous = true; // async-mode
        var __this = this;
        var __func = callback;
        var __save = myopt.onComplete;
        myopt.onComplete = function (trans) {
            var tree;
            if (trans && trans.responseXML && trans.responseXML.documentElement) {
                tree = __this.parseDOM(trans.responseXML.documentElement);
            }
            __func(tree, trans);
            if (__save) __save(trans);
        };
    } else {
        myopt.asynchronous = false; // sync-mode
    }
    var trans;
    if (typeof (HTTP) != "undefined" && HTTP.Request) {
        myopt.uri = url;
        var req = new HTTP.Request(myopt); // JSAN
        if (req) {
            trans = req.transport;
        }
    } else if (typeof (Ajax) != "undefined" && Ajax.Request) {
        var req = new Ajax.Request(url, myopt); // ptorotype.js
        if (req) {
            trans = req.transport;
        }
    }
    if (callback) {
        return trans;
    }
    if (trans && trans.responseXML && trans.responseXML.documentElement) {
        return this.parseDOM(trans.responseXML.documentElement);
    }
}

//  method: parseDOM( documentroot )
XML.ObjTree.prototype.parseDOM = function (root) {
    if (!root) {
        return;
    }

    this.__force_array = {};
    if (this.force_array) {
        for (var i = 0; i < this.force_array.length; i++) {
            this.__force_array[this.force_array[i]] = 1;
        }
    }

    var json = this.parseElement(root); // parse root node
    if (this.__force_array[root.nodeName]) {
        json = [json];
    }
    if (root.nodeType != 11) { // DOCUMENT_FRAGMENT_NODE
        var tmp = {};
        tmp[root.nodeName] = json; // root nodeName
        json = tmp;
    }
    return json;
};

//  method: parseElement( element )
XML.ObjTree.prototype.parseElement = function (elem) {
    //  COMMENT_NODE
    if (elem.nodeType == 7) {
        return;
    }

    //  TEXT_NODE CDATA_SECTION_NODE
    if (elem.nodeType == 3 || elem.nodeType == 4) {
        var bool = elem.nodeValue.match(/[^\x00-\x20]/);
        if (bool == null) {
            return; // ignore white spaces
        }
        return elem.nodeValue;
    }

    var retval;
    var cnt = {};

    //  parse attributes
    if (elem.attributes && elem.attributes.length) {
        retval = {};
        for (var i = 0; i < elem.attributes.length; i++) {
            var key = elem.attributes[i].nodeName;
            if (typeof (key) != "string") {
                continue;
            }
            var val = elem.attributes[i].nodeValue;
            if (!val) {
                continue;
            }
            key = this.attr_prefix + key;
            if (typeof (cnt[key]) == "undefined") {
                cnt[key] = 0;
            }
            cnt[key]++;
            this.addNode(retval, key, cnt[key], val);
        }
    }

    //  parse child nodes (recursive)
    if (elem.childNodes && elem.childNodes.length) {
        var textonly = true;
        if (retval) {
            textonly = false; // some attributes exists
        }
        for (var i = 0; i < elem.childNodes.length && textonly; i++) {
            var ntype = elem.childNodes[i].nodeType;
            if (ntype == 3 || ntype == 4) {
                continue;
            }
            textonly = false;
        }
        if (textonly) {
            if (!retval) {
                retval = "";
            }
            for (var i = 0; i < elem.childNodes.length; i++) {
                retval += elem.childNodes[i].nodeValue;
            }
        } else {
            if (!retval) {
                retval = {};
            }
            for (var i = 0; i < elem.childNodes.length; i++) {
                var key = elem.childNodes[i].nodeName;
                if (typeof (key) != "string") {
                    continue;
                }
                var val = this.parseElement(elem.childNodes[i]);
                if (!val) {
                    continue;
                }
                if (typeof (cnt[key]) == "undefined") {
                    cnt[key] = 0;
                }
                cnt[key]++;
                this.addNode(retval, key, cnt[key], val);
            }
        }
    }
    return retval;
};

//  method: addNode( hash, key, count, value )
XML.ObjTree.prototype.addNode = function (hash, key, cnts, val) {
    if (this.__force_array[key]) {
        if (cnts == 1) {
            hash[key] = [];
        }
        hash[key][hash[key].length] = val; // push
    } else if (cnts == 1) { // 1st sibling
        hash[key] = val;
    } else if (cnts == 2) { // 2nd sibling
        hash[key] = [hash[key], val];
    } else { // 3rd sibling and more
        hash[key][hash[key].length] = val;
    }
};

//  method: writeXML( tree )
XML.ObjTree.prototype.writeXML = function (tree) {
    var xml = this.hash_to_xml(null, tree);
    return this.xmlDecl + xml;
};

//  method: hash_to_xml( tagName, tree )
XML.ObjTree.prototype.hash_to_xml = function (name, tree) {
    var elem = [];
    var attr = [];
    for (var key in tree) {
        if (!tree.hasOwnProperty(key)) {
            continue;
        }
        var val = tree[key];
        if (key.charAt(0) != this.attr_prefix) {
            if (typeof (val) == "undefined" || val == null) {
                elem[elem.length] = "<" + key + " />";
            } else if (typeof (val) == "object" && val.constructor == Array) {
                elem[elem.length] = this.array_to_xml(key, val);
            } else if (typeof (val) == "object") {
                elem[elem.length] = this.hash_to_xml(key, val);
            } else {
                elem[elem.length] = this.scalar_to_xml(key, val);
            }
        } else {
            attr[attr.length] = " " + (key.substring(1)) + '="' + (this.xml_escape(val)) + '"';
        }
    }
    var jattr = attr.join("");
    var jelem = elem.join("");
    if (typeof (name) == "undefined" || name == null) {
        // no tag
    } else if (elem.length > 0) {
        if (jelem.match(/\n/)) {
            jelem = "<" + name + jattr + ">\n" + jelem + "</" + name + ">\n";
        } else {
            jelem = "<" + name + jattr + ">" + jelem + "</" + name + ">\n";
        }
    } else {
        jelem = "<" + name + jattr + " />\n";
    }
    return jelem;
};

//  method: array_to_xml( tagName, array )
XML.ObjTree.prototype.array_to_xml = function (name, array) {
    var out = [];
    for (var i = 0; i < array.length; i++) {
        var val = array[i];
        if (typeof (val) == "undefined" || val == null) {
            out[out.length] = "<" + name + " />";
        } else if (typeof (val) == "object" && val.constructor == Array) {
            out[out.length] = this.array_to_xml(name, val);
        } else if (typeof (val) == "object") {
            out[out.length] = this.hash_to_xml(name, val);
        } else {
            out[out.length] = this.scalar_to_xml(name, val);
        }
    }
    return out.join("");
};

//  method: scalar_to_xml( tagName, text )
XML.ObjTree.prototype.scalar_to_xml = function (name, text) {
    if (name == "#text") {
        return this.xml_escape(text);
    } else {
        return "<" + name + ">" + this.xml_escape(text) + "</" + name + ">\n";
    }
};

//  method: xml_escape( text )
XML.ObjTree.prototype.xml_escape = function (text) {
    return (text + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};