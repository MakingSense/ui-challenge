
'use strict';

import gulp         from 'gulp';
import gutil        from 'gulp-util';
import tar          from 'gulp-tar';
import gzip         from 'gulp-gzip';
import webpack      from 'webpack-stream';
import webpack2     from 'webpack';
import path         from 'path';
import sync         from 'run-sequence';
import rename       from 'gulp-rename';
import template     from 'gulp-template';
import yargs        from 'yargs';
import del          from 'del';
import iconfont     from 'gulp-iconfont';
import iconfontCss  from 'gulp-iconfont-css';
import spritesmith  from 'gulp.spritesmith';
import merge        from 'lodash/merge';
import WebpackDevServer from 'webpack-dev-server';
import eslint from 'gulp-eslint';
import stubby from 'gulp-stubby-server';
import eslintrc from './.eslintrc.json';



const ERROR_MSG = `Your build is broken, I'll fix it for ya`;
const NOTICE_MSG = `DO NOT MODIFY THIS FILE. IS AUTO GENERATED AND THEREFORE YOUR CHANGES WILL BE LOST`;

let root = 'client';
let output = 'dist';
let fontName = 'Icons';
const CONFIG_FILE_NAME = 'app.constant';

let resolveTo = function (p) {
  return function (glob = '') {
    return path.join(root, p, glob)
  };
};

let resolveToApp = resolveTo('app');

let resolveToComponents = resolveTo('app/components');

let resolveToConfig = resolveTo('config');

let resolveToEnv = resolveTo('config/env');

let resolveError = (callback) => (message) => {
  gutil.log(gutil.colors.magenta(ERROR_MSG));
  gutil.log(gutil.colors.magenta(message));
  callback();
};

// map of all paths
let paths = {
  js: resolveToComponents('**/*!(.spec.js).js'), // exclude spec files
  sass: resolveToApp('**/*.scss'), // stylesheets
  config: {
    default: resolveToConfig('config.default.js'),
    env: {
      local: resolveToEnv('config.local.js'),
      dev: resolveToEnv('config.dev.js'),
      prod: resolveToEnv('config.prod.js')
    }
  },
  html: [
    resolveToApp('**/*.html'),
    path.join(root, 'index.html')
  ],
  entry: path.join(root, 'app/app.js'),
  output,
  blankTemplates: path.join(__dirname, 'generator', 'component/**/*.**'),
  configTemplate: path.join(__dirname, 'generator', 'configuration/config.template.js')
};

gulp.task('clean', () => {
  return del([
    'dist/*.{html,css,js,map,eot,woff,ttf}'
  ]);
});

gulp.task('cleanConfig', () => {
  return del([
    resolveToApp(CONFIG_FILE_NAME)
  ]);
});

// use webpack.config.babel.js to build modules
gulp.task('webpack', ['clean'], (callback) => {
  let webpackStream = webpack(require('./webpack.config.babel.js'))
    .on('error', resolveError(callback));

  return gulp.src(paths.entry)
    .pipe(webpackStream)
    .pipe(gulp.dest(paths.output));
});

gulp.task('webpack-dev-server', ['clean', 'config:generate:local'], (callback) => {
  let webpackStream = webpack2(require('./webpack.config.babel.js'));

  // Start a webpack-dev-server
  new WebpackDevServer(webpackStream, {
    quite: true,
    compress: true,
    watchOptions: {
      poll: 1000
    },
    contentBase: 'static/',
    stats: {
      colors: true,
      chunks: false
    }
  }).listen(3000, "0.0.0.0", function (err) {
    if (err) throw new gutil.PluginError("webpack-dev-server", err);
    // Server listening
    gutil.log("[webpack-dev-server]", "http://localhost:3000/index.html");

    callback();
  });
});

gulp.task('set-dev-babel-env', () => {
    return process.env.BABEL_ENV = 'DEV';
});

gulp.task('webpack:prod', ['clean'], () => {
  return gulp.src(paths.entry)
    .pipe(webpack(require('./webpack.config.prod.babel.js')))
    .pipe(gulp.dest(paths.output));
});

gulp.task('iconfont', () => {
  gulp.src(['generator/icons/*.svg'])
    .pipe(iconfontCss({
      fontName: fontName,
      path: 'generator/icons/_template.scss',
      targetPath: '../../common/icons/_icons.scss',
      fontPath: './'
    }))
    .pipe(iconfont({
      fontName: fontName,
      formats: ['ttf', 'eot', 'woff'],
      normalize: true
    }))
    .pipe(gulp.dest('client/app/common/icons/'));
});

/*
 Compile sprite maps by folder
 --src common/checkbox
 --name checkbox
 */

gulp.task('sprites', function () {
  let dest = `client/app/${ yargs.argv.src }/`;
  let src = `${dest}images/`;
  let blob = `${src}*.png`;
  let retina = `${src}*@2x.png`;

  let spriteData = gulp.src(blob).pipe(spritesmith({
    imgName: 'sprites.png',
    cssName: '_sprites.scss',
    retinaSrcFilter: [retina],
    retinaImgName: 'sprites@2x.png',
    algorithm: 'top-down'
  }));

  return spriteData.pipe(gulp.dest(dest));
});

gulp.task('component', () => {
  let cap = (val) => {
    return val.charAt(0).toUpperCase() + val.slice(1);
  };
  let name = yargs.argv.name;
  let parentPath = yargs.argv.parent || '';
  let destPath = path.join(resolveToComponents(), parentPath, name);

  return gulp.src(paths.blankTemplates)
    .pipe(template({
      name: name,
      upCaseName: cap(name)
    }))
    .pipe(rename((path) => {
      path.basename = path.basename.replace('temp', name);
    }))
    .pipe(gulp.dest(destPath));
});

gulp.task('config', () => {
  const config = require(path.join(__dirname, resolveToApp(CONFIG_FILE_NAME)));

  gutil.log(gutil.colors.red('========================================='));
  gutil.log(gutil.colors.red('========= Current configuration ========='));
  gutil.log(gutil.colors.red('========================================='));
  gutil.log(
    gutil.colors.yellow(
      JSON.stringify(config, null, 2)));
});

let generateConfig = (env) => {
  return () => {
    const config = merge(
      require(path.join(__dirname, paths.config.default)),
      require(path.join(__dirname, paths.config.env[env]))
    );

    config.notice = NOTICE_MSG;

    return gulp.src(paths.configTemplate)
      .pipe(template(config))
      .pipe(rename((path) => {
        gutil.log(path.basename);
        path.basename = CONFIG_FILE_NAME;
      }))
      .pipe(gulp.dest(resolveToApp()));
  }
};
gulp.task('config:generate:local', ['cleanConfig'], generateConfig('local'));
gulp.task('config:generate:dev', ['cleanConfig'], generateConfig('dev'));
gulp.task('config:generate:prod', ['cleanConfig'], generateConfig('prod'));

gulp.task('build:compress', () => {
  return gulp.src('dist/*')
    .pipe(tar(`dist-${Date.now()}.tar`))
    .pipe(gzip())
    .pipe(gulp.dest('./'));
});

gulp.task('default', (done) => {
  sync('webpack-dev-server', done);
});

gulp.task('build:dev', ['clean', 'config:generate:dev'], (done) => {
  sync('webpack:prod', 'build:compress', done);
});

gulp.task('build:prod', ['config:generate:prod'], (done) => {
  sync('webpack:prod', 'build:compress', done);
});

gulp.task('lint', function () {
  return gulp.src([
      'client/app/common/**/*.js',
      'client/app/components/**/*.js',
      '!client/app/**/*.spec.js'
    ])
    .pipe(eslint(eslintrc))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});
