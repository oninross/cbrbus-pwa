import React, {Component} from 'react';

import {Navigation} from '../../components/navigation/navigation';
import {Button} from '../../components/button/button';

export class Share extends Component {
  render() {
    return (
      <div>
        <section className="container narrow">
          <h2>Help us spread the word!</h2>
          <p className="intro">If you love what we have done here, help us spread the word. It would mean a lot to us.</p>

          <Button text="Share on Facebook" link="https://www.facebook.com/sharer.php?u=www.cbrbus.com.au" target="_blank" class="btn-share -facebook js-share"/>
          <Button text="Tweet on Twitter" link="https://twitter.com/intent/tweet?url=www.cbrbus.com.au&amp;text=CBR%20Buses%20https%3A%2F%2Fwww.cbrbus.com.au%20&amp;hashtags=cbrbuses%20%23pwa" target="_blank" class="btn-share -twitter js-share"/>
        </section>

        <Navigation/>
      </div>
    );
  }
}
