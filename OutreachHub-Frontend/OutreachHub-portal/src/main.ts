import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ɵresolveComponentResources } from '@angular/core';


import { AppModule } from './app/app.module';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
function resolveComponentResources() {
  throw new Error('Function not implemented.');
}

