import angular from 'angular';
import moreComponent from './more.component';

let moreModule = angular.module('ms.app.more')
  .component('more', moreComponent);

export default moreModule;
