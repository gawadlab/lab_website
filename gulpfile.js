var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pump = require('pump');
var pkg = require('./package.json');

// Set the banner content
var banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  ''
].join('');

// Compiles SCSS files from /scss into /css
gulp.task('sass', function() {
  return gulp.src('scss/gawad_lab.scss')
    .pipe(sass())
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

// Minify compiled CSS
gulp.task('minify-css', ['sass'], function() {
  return gulp.src('css/gawad_lab.css')
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('minify-js', function(cb) {
	pump([
		gulp.src('js/gawad_lab.js'),
		uglify(),
		rename({
      suffix: '.min'
    }),
		header(banner, {
      pkg: pkg
    }),
		gulp.dest('js')
		],
		cb
	);
});

// Minify custom JS
/*
gulp.task('minify-js', function() {
  return gulp.src('js/gawad_lab.js')
    .pipe(uglify())
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('js'))
    .pipe(browserSync.reload({
      stream: true
    }))
});
*/

// Copy vendor files from /node_modules into /vendor
// NOTE: requires `npm install` before running!
gulp.task('copy', function() {
  gulp.src([
      'node_modules/bootstrap/dist/**/*',
      '!**/npm.js',
      '!**/bootstrap-theme.*',
      '!**/*.map'
    ])
    .pipe(gulp.dest('vendor/bootstrap'))

  gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
    .pipe(gulp.dest('vendor/jquery'))

  gulp.src(['node_modules/jquery.easing/*.js'])
    .pipe(gulp.dest('vendor/jquery-easing'))

  gulp.src([
      'node_modules/font-awesome/**',
      '!node_modules/font-awesome/**/*.map',
      '!node_modules/font-awesome/.npmignore',
      '!node_modules/font-awesome/*.txt',
      '!node_modules/font-awesome/*.md',
      '!node_modules/font-awesome/*.json'
    ])
    .pipe(gulp.dest('vendor/font-awesome'))

  gulp.src(['node_modules/slick-carousel/slick/slick.min.js'])
    .pipe(gulp.dest('vendor/slick-carousel'))

  gulp.src(['node_modules/d3/dist/d3.min.js'])
    .pipe(gulp.dest('vendor/d3'))
})

// Default task
gulp.task('default', ['sass', 'minify-css', 'minify-js', 'copy']);

// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: ''
    },
  })
})

// Dev task with browserSync
gulp.task('dev', ['browserSync', 'sass', 'minify-css', 'minify-js'], function() {
  gulp.watch('scss/*.scss', ['sass']);
  gulp.watch('css/*.css', ['minify-css']);
  gulp.watch('js/*.js', ['minify-js']);
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('*.html', browserSync.reload);
  gulp.watch('js/**/*.js', browserSync.reload);
});
