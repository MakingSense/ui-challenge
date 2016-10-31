import angular from 'angular';
import ngComponentRouter from '@angular/router/angular1/angular_1_router.js';
import ngAnimate from 'angular-animate';

//App components
/*import Common from './common/common';
import Directives from './directives/directives';*/
import Views from './views/views';
import AppComponent from './app.component';

//App scss
import 'normalize.css';
import './app.scss';

let App = angular.module('app', [
    "ngComponentRouter",
    "ngAnimate",
    Views.name
  ])
  .component('app', AppComponent)
  .value('$routerRootComponent', 'app')
  .run();

export default App;
