import angular from 'angular';

import Constants from './app.constant';

import App from './app';



function bootstrapApp() {
  angular.element(document).ready(function () {
    angular.bootstrap(document.body, [ App.name ],{
      strictDi: true
    })
  });
}

bootstrapApp();