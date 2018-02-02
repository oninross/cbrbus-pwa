import { Component, OnInit } from '@angular/core';
import { TweenMax, Expo } from 'gsap/src/uncompressed/TweenMax';
import 'gsap/src/uncompressed/plugins/ScrollToPlugin';


@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: [
        './about.component.scss',
        '../btn/btn.component.scss',
        '../accordion/accordion.component.scss'
    ]
})
export class AboutComponent implements OnInit {

    constructor() { }

    ngOnInit() {
        const accordion = document.getElementsByClassName('accordion'),
            accordionHeader = document.getElementsByClassName('accordion__header'),
            accordionBtn = document.getElementsByClassName('accordion__btn'),
            event = document.createEvent('HTMLEvents');

        event.initEvent('click', false, true);

        for (let i = 0, l = accordion.length; i < l; i++) {
            // accordion header EventListeners
            accordionHeader[i].addEventListener('click', function (e) {
                e.preventDefault();

                this.querySelector('.accordion__btn').dispatchEvent(event);
            });

            // accortion button EventListeners
            accordionBtn[i].addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                let accordion = this.parentNode.parentNode;

                // Vanilla JS of $(el).toggleClass();
                if (accordion.classList.value.indexOf('active') > -1) {
                    accordion.classList.remove('active');
                } else {
                    accordion.classList.add('active');
                }

                console.log(accordion)

                TweenMax.to(window, 1, {
                    scrollTo: parseInt(accordion.offsetTop),
                    ease: Expo.easeOut,
                    delay: 0.5
                });
            });
        }
    }

}
