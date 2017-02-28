'use strict';

import doT from 'doT';
import { API_KEY, loader, getQueryVariable, isNotificationGranted } from './_helper';
import { ripple, toaster } from './_material';
import { checkBookmark, setBookmark } from './_bookmark';

let isLoading = true,
    busStopId = 0,
    busStopName = '';

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
                $('.cards-wrapper').empty();
                lookupBusId(busStopId, null);
            });

            $('.cards-wrapper').off('click', '.card', cardListener);
        });
    }
});

let lookupBusId = function (id, name) {
    let $xml = '';

    busStopId = id;
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
    var xotree = new XML.ObjTree(),
        json = xotree.parseXML(xml),
        serviceDelivery = json.Siri.ServiceDelivery,
        $status = serviceDelivery.Status;

    console.log(json);;

    if (!$status) {
        toaster('Whoops! Something went wrong!');
        return false;
    }

    let $monitoredStopVisit = serviceDelivery.StopMonitoringDelivery.MonitoredStopVisit,
        cardHeader = doT.template($('#card-header').html()),
        cardTemplate = doT.template($('#card-template').html()),
        cardEmptyTemplate = doT.template($('#card-empty-template').html()),
        now = new Date(),
        obj = {},
        busArr = [],
        vehicleFeatureArr = [],
        tempArr = [],
        etaMinArr = [],
        vehicleRefNum = 0,
        serviceNum = 0,
        arr = 0,
        eta = 0,
        etaMin = 0,
        icon = '',
        cardMarkup = '',
        vehicleFeatureRef = '',
        isBusPresent = false;

    getBusStopName();

    if ($monitoredStopVisit.length) {
        // Display Bus Stop Name if Available
        if (busStopName != undefined) {
            obj = {
                busStopName: busStopName,
                busStopId: busStopId,
                isBookmarked: checkBookmark(busStopId) == true ? 'active' : ''
            };

            console.log(obj)

            cardMarkup += cardHeader(obj);
        }

        $.each($monitoredStopVisit, function (i, v) {
            // Get vehicle reference number
            vehicleRefNum = v.MonitoredVehicleJourney.VehicleRef;
            if (vehicleRefNum == undefined) {
                vehicleRefNum = null;
            }


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
                busStopId: busStopId,
                vehicleRefNum: vehicleRefNum,
                serviceNum: serviceNum,
                feature: vehicleFeatureArr,
                estimatedArrival: etaMinArr
            }

            // Initial push for busArr
            if (i == 0) {
                console.log('Initial Push');
                busArr.push(obj);
            } else {
                console.log('Second Push');
                isBusPresent = false;

                $.each(busArr, function (i, v) {
                    if (v.serviceNum == serviceNum) {
                        // Bus Service is present
                        if (v.estimatedArrival.length < 2) {
                            // Estimated Arrival per service is less than 3
                            tempArr = [];
                            tempArr.push(etaMin);
                            v.estimatedArrival = v.estimatedArrival.concat(tempArr);
                        } else {
                            // Sort to array and replace which is more closer to arriving
                            $.each(v.estimatedArrival, function (ind, val) {
                                if (val > etaMin && v.estimatedArrival[ind] != etaMin) {
                                    v.estimatedArrival[ind] = etaMin;
                                    v.vehicleRefNum = vehicleRefNum;

                                    // Sort time array in descending order

                                    return false;
                                }
                            });

                            v.estimatedArrival.sort(function (a, b) {
                                return a - b;
                            });
                        }

                        isBusPresent = true;
                    }
                });

                if (!isBusPresent) {
                    busArr.push(obj);
                }
            }
        });

        // $.each(busArr, function (i, v) {
        //     // Append Markup
        //     cardMarkup += cardTemplate(v);
        // });

        let byServiceNum = busArr.slice(0);

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

    // // Render Markup
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
        $busStopId = $this.data('busstopid'),
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
        window.location.href = '/trackmybus/?busStopId=' + $busStopId + '&busId=' + $serviceRefNum + '&vehicleRef=' + $vehicleRefNum;
    }
};

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


export { lookupBusId }
