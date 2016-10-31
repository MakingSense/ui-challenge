import angular from 'angular';
import headerComponent from './header.component';

let headerModule = angular.module('ms.app.header')
  .component('header', headerComponent);

export default headerModule;
