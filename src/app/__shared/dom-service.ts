import {
    Injectable,
    Injector,
    ComponentFactoryResolver,
    EmbeddedViewRef,
    ApplicationRef,
    ComponentRef,
    NgModule
} from '@angular/core';

import { GlobalVariable } from './globals';
import { ToasterComponent } from '../toaster/toaster.component';

@Injectable()
export class DomService {
    componentRef;

    index: number = 0;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector,
        private globalVariable: GlobalVariable
    ) { }

    appendComponentToBody(component: any, settings: any) {
        // Create a component reference from the component
        this.componentRef = this.componentFactoryResolver
            .resolveComponentFactory(component)
            .create(this.injector);


        this.globalVariable.toasterIndex += 1;
        (<any>this.componentRef.instance).index = this.globalVariable.toasterIndex;
        (<any>this.componentRef.instance).text = settings.text;

        // Attach component to the appRef so that it's inside the ng component tree
        this.appRef.attachView(this.componentRef.hostView);

        // Get DOM element from component
        const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;

        // Append DOM element to the body
        document.getElementsByClassName('toaster-wrap')[0].appendChild(domElem);
    }

    destroyComponent() {
        // destroy appened component
        this.appRef.detachView(this.componentRef.hostView);
        this.componentRef.destroy();
    }
}