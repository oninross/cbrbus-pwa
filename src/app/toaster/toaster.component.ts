import { Component, Input, OnInit } from '@angular/core';

import { TweenMax, Expo } from 'gsap/src/uncompressed/TweenMax';
import { DomService } from '../__shared/dom-service';

@Component({
    selector: 'app-toaster',
    templateUrl: './toaster.component.html',
    styleUrls: ['./toaster.component.scss']
})
export class ToasterComponent {
    @Input() message: string = 'Toasty!';

    index: number = 0;

    constructor(
        private domService: DomService
    ) { }

    ngOnInit() {
        const self = this;

        setTimeout(() => {
            let toaster = document.getElementsByClassName('toaster' + this.index)[0];

            TweenMax.to(toaster, 0.75, {
                scale: 1,
                autoAlpha: 1,
                ease: Expo.easeOut
            });

            TweenMax.to(toaster, 0.75, {
                scale: 0.5,
                autoAlpha: 0,
                ease: Expo.easeOut,
                delay: 5,
                onComplete: function () {
                    self.domService.destroyComponent();
                }
            });
        }, 0);
    }
}
