import {
    Injectable,
    Injector,
    ComponentFactoryResolver,
    EmbeddedViewRef,
    ApplicationRef,
    ComponentRef
} from '@angular/core';

@Injectable()
export class DomService {
    componentRef;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector
    ) { }

    appendComponentToBody(component: any, text:String = 'Dom Service Text') {
        // Create a component reference from the component
        this.componentRef = this.componentFactoryResolver
            .resolveComponentFactory(component)
            .create(this.injector);

        (<any>this.componentRef.instance).message = text;
        (<any>this.componentRef.instance).index += 1;

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