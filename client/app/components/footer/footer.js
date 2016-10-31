import angular from 'angular';
import footerComponent from './footer.component';

let footerModule = angular.module('ms.app.footer')
  .component('footer', footerComponent);

export default footerModule;
