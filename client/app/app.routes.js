const $routeConfig = [
  { path: '/', component: 'msMain', name: 'MainDisplay' },
  { path: '/**', redirectTo: ['MainDisplay'] },
];

export default $routeConfig;
