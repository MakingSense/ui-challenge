import angular from 'angular';

import msMain from './main.component';
import header from '../../components/header/header.component';
import menu from '../../components/menu/menu.component';
import content from '../../components/content/content.component';
import more from '../../components/more/more.component';
import contact from '../../components/contact/contact.component';
import footer from '../../components/footer/footer.component';

let mainModule = angular.module('ms.app.main', [])
  .component('msMain', msMain)
  .component('header', header)
  .component('menu', menu)
  .component('content', content)
  .component('more', more)
  .component('contact', contact)
  .component('footer', footer);

export default mainModule;