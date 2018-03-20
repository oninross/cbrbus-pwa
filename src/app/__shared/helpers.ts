import { Injectable } from "@angular/core";

@Injectable()
export class Helpers {
    readonly debounce = function (func, wait, immediate) {
        let timeout;

        return function () {
            let context = this, args = arguments;

            let later = function () {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            };

            let callNow = immediate && !timeout;

            clearTimeout(timeout);

            timeout = setTimeout(later, wait);

            if (callNow) {
                func.apply(context, args);
            }
        };
    }

    readonly getQueryVariable = function (variable): any {
        let query = window.location.search.substring(1),
            vars = query.split("&");

        for (let i = 0; i < vars.length; i++) {
            let pair = vars[i].split("=");

            if (pair[0] == variable) {
                return pair[1];
            }
        }

        return false;
    }

    readonly getSortByTime = function () {
        if (localStorage.isSortByTime == undefined) {
            localStorage.isSortByTime = JSON.stringify(false);
        }

        return JSON.parse(localStorage.isSortByTime);
    }

    setSortByTime = function (boolean) {
        var bool = boolean;
        switch (boolean) {
            case 0:
                bool = false;
                break;
            case 1:
                bool = true;
                break;
        };

        localStorage.isSortByTime = JSON.stringify(bool);
    }
}