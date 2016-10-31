import angular from 'angular';
import contentComponent from './content.component';

let contentModule = angular.module('ms.app.content')
  .component('content', contentComponent);

export default contentModule;
