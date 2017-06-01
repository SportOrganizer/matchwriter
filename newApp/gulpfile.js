var 
	gulp = require('gulp'),
	newer = require('gulp-newer'),
	imagemin = require('gulp-imagemin'),
	htmlclean = require('gulp-htmlclean'),
	concat = require('gulp-concat'),
	order = require("gulp-order")
	stripdebug = require('gulp-strip-debug'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-sass'),
	postcss = require('gulp-postcss'),
	assets = require('postcss-assets'),
	autoprefixer = require('autoprefixer'),
	mqpacker = require('css-mqpacker'),
	cssnano = require('cssnano'),
  fileinclude = require('gulp-file-include');

// development mode?
devBuild = (process.env.NODE_ENV !== 'production'),

// folders
folder = {
	src: 'src/',
	build: 'build/'
}

gulp.task('images', function() {
  var out = folder.build + 'images/';
  return gulp.src(folder.src + 'images/**/*')
    .pipe(newer(out))
    .pipe(imagemin({ optimizationLevel: 5 }))
    .pipe(gulp.dest(out));
});

// HTML processing
gulp.task('html', ['images'], function() {
  var
    out = folder.build + 'html/',
    page = gulp.src(folder.src + 'html/*.html')
      .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }));

  // minify production code
  if (!devBuild) {
    page = page.pipe(htmlclean());
  }

  return page.pipe(gulp.dest(out));
});

// JavaScript processing
gulp.task('js', function() {

  return gulp
    .src(folder.src + "js/**/*.js")// gulp.src passes through input 
    .pipe(order([
      "defaultRequired.js",
      "defaultReadyState.js",
      "ipc/**/*.js",
      "controller/**/*.js",
      "**/*.js"
    ]))
    .pipe(concat("bundle.js"))
    .pipe(gulp.dest(folder.build + "js"));

});

// JavaScript processing
gulp.task('nodeJS', function() {

  return gulp
    .src(folder.src + "/nodeJS/**/*.js")// gulp.src passes through input 
    .pipe(order([
      "main.js",
      "**/*.js"
    ]))
    .pipe(concat("main.js"))
    .pipe(gulp.dest(folder.build));

});

//Config process
gulp.task('config', function() {

  return gulp
    .src(folder.src + "config.js")
    .pipe(concat("config.js"))
    .pipe(gulp.dest(folder.build));

});

// CSS processing
gulp.task('css', ['images'], function() {

  var postCssOpts = [
  assets({ loadPaths: ['images/'] }),
  autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
  mqpacker
  ];

  if (!devBuild) {
    postCssOpts.push(cssnano);
  }

  return gulp.src(folder.src + 'scss/main.scss')
    .pipe(sass({
      outputStyle: 'nested',
      imagePath: 'images/',
      precision: 3,
      errLogToConsole: true
    }))
    .pipe(postcss(postCssOpts))
    .pipe(gulp.dest(folder.build + 'css/'));

});

// run all tasks
gulp.task('run', ['html', 'css', 'js', 'nodeJS', 'config']);

// watch for changes
gulp.task('watch', function() {

  // image changes
  gulp.watch(folder.src + 'images/**/*', ['images']);

  // html changes
  gulp.watch(folder.src + 'html/**/*', ['html']);

  // javascript changes
  gulp.watch(folder.src + 'js/**/*', ['js']);

  // javascript changes
  gulp.watch(folder.src + 'nodeJS/**/*', ['nodeJS']);

  // javascript changes
  gulp.watch(folder.src + 'config.js', ['config']);

  // css changes
  gulp.watch(folder.src + 'scss/**/*', ['css']);

});

// default task
gulp.task('default', ['run', 'watch']);

