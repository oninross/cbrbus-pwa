import React, {Component} from 'react';

import {Navigation} from '../../components/navigation/navigation';
import {Button} from '../../components/button/button';
import {Accordion} from '../../components/accordion/accordion';

import '../../components/accordion/accordion.scss';

export class About extends Component {
  render() {
    return (
      <div>
        <section className="container narrow">
          <h2>Find out what the heck this is all about</h2>
          <p className="intro">
            <sup className="new">NEW! </sup> CBR Buses have been running for quite some time now. We would like to hear from our users how it has been going so we can improve it better for everyone. Click on the button below for the feedback form. Don&apos;t worry, we wont ask who you are.
          </p>

          <Button text="Feedback Form" link="https://goo.gl/forms/3N3YzYhpr9BnJGgA2" target="_blank" class="btn-begin"/>

          <p> Do let us know also if you faced any issues while using it. Would you like to suggest anything to improve the app? Or if you want to say g&apos;day, hit us up at: </p>
          <p>We a just a bunch of geeks playing with some new technology. This is no way connected to government or business. We are just having a play.</p>

          <Button text="cbrbusissues@gmail.com" link="mailto:cbrbusissues@gmail.com" class="btn-begin"/>

          <h2>How to use the app?</h2>
          <p>There area a few links in the menu but you may still wonder how to use all the features of the web app. Below are simple instuctions on how they can be used.</p>

          <div className="accordion">
            <Accordion text="Search"/>

            <div className="accordion__body">
              <p>You can search for you bus stop by the number or simply entering the location.</p>
              <img src="/assets/cbrbus/images/search.jpg"/>
            </div>
          </div>

          <div className="accordion">
            <Accordion text="Bookmarks"/>

            <div className="accordion__body">
              <p>You can bookmark your favourite bus stop. First search for the bus stop in the search page. Then you can tap on the star to save it on your bookmarks. You can unbookmark it on the search page or on the bus stop page itself.</p>
              <div className="bookmarks">
                <img src="/assets/cbrbus/images/bookmark1.jpg"/>
                <img src="/assets/cbrbus/images/bookmark2.jpg"/>
              </div>
            </div>
          </div>

          <div className="accordion">
            <Accordion text="Nearby"/>

            <div className="accordion__body">
              <p>Provided that you have given permission for your location, you can determine the nearby bus stops on your current location. Just tap on the
                <strong>bus stop marker </strong>
                <img src="/assets/cbrbus/images/stopMarker.png" className="stopMarker"/>
                on the map and it will take you to the bus stop page.
              </p>
            </div>
          </div>

          <div className="accordion">
            <Accordion text="Bus Stop"/>

            <div className="accordion__body">
              <p>You can view the listing of the bus services passing by the bus stop you have selected, searched or bookmarked. The buses here are arranged in descending order. Each “cards” will have the bus service number
                <strong>(1)</strong>, accessibility features
                <strong>(2)</strong>, current arriving bus time estimate
                <strong>(3)</strong> and the next arriving bus time estimate
                <strong>(4)</strong>
              </p>
              <p>The green button (5) is to refresh the bus times so you don’t have to refresh the page.</p>
              <img src="/assets/cbrbus/images/busStop.jpg"/>
              <p>Tapping on the card will display the current geolocation of the bus service you have selected (provided that the it can be tracked). It will be represented by a
                <strong>red pin </strong>
                <img src="https://maps.google.com/mapfiles/kml/paddle/red-blank_maps.png" className="redPin"/>
                on the map.
              </p>
              <img src="/assets/cbrbus/images/busLocation.jpg"/>
            </div>
          </div>

          <div className="accordion">
            <Accordion text="Track My Bus" isNew/>

            <div className="accordion__body">
              <p>Unfortunately, this is an <strong>Android exclusive</strong> feature. This feature can be used in 2 ways:</p>
              <ol>
                <li>If you know where your stop is, you can tap on the
                  <strong>marker </strong>
                  <img src="/assets/cbrbus/images/busMarker.png" className="busMarker"/>
                  on the map. You will receive a notification 1 stop before the one you have selected (if it is provided) so you can prepare yourself in alighting from the bus.
                </li>
                <li>
                  You can tap the marker of the current bus stop that you are on (it is <strong>blue pin </strong>
                  <img src="https://maps.google.com/mapfiles/kml/paddle/blu-blank_maps.png" className="bluePin"/>
                  that it is pointing at) to receive a notification if the bus is 1 stop away (if it is provided).
                </li>
              </ol>
              <p>Do take note that all information about the bus arrival is depending on the data we are grabbing from the API. Sometimes you will be notified when the bus is on the stop itself. Don&apos;t worry, we are working on it.</p>
            </div>
          </div>

          <Button text="Start using the app" link="/" class="btn-begin"/>

        </section>

        <Navigation/>
      </div>
    );
  }
}
