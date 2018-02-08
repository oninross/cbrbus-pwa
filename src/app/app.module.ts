import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './/app-routing.module';


import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component';
import { NavigationComponent } from './navigation/navigation.component';
import { ShareComponent } from './share/share.component';
import { BtnComponent } from './btn/btn.component';
import { AboutComponent } from './about/about.component';
import { AccordionComponent } from './accordion/accordion.component';
import { LoaderComponent } from './loader/loader.component';
import { NearbyComponent } from './nearby/nearby.component';
import { DomService } from './__shared/dom-service';
import { ToasterComponent } from './toaster/toaster.component';

@NgModule({
    declarations: [
        AppComponent,
        SearchComponent,
        NavigationComponent,
        ShareComponent,
        BtnComponent,
        AboutComponent,
        AccordionComponent,
        LoaderComponent,
        NearbyComponent,
        ToasterComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule
    ],
    providers: [DomService],
    bootstrap: [AppComponent],
    entryComponents: [ToasterComponent]
})
export class AppModule { }
