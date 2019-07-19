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

// Move Required folders to appengine_www and upload to appengine
gulp.task('appengine', function() {
  gulp.src([
      'vendor/slick-carousel/slick.min.js',
      'vendor/jquery-easing/jquery.easing.min.js',
      'vendor/d3/d3.min.js',
      'vendor/bootstrap/js/bootstrap.bundle.min.js',
      'vendor/jquery/jquery.min.js',
      'vendor/bootstrap/css/bootstrap.css',
      'vendor/font-awesome/css/font-awesome.min.css',
      'js/phylo_tree.js',
      'js/gawad_lab.min.js',
      'js/contact_me.js',
      'js/jqBootstrapValidation.js',
      'css/gawad_lab.min.css',
      'vendor/bootstrap/css/bootstrap.css',
      'index.html',
      'img/logos/sj_logo_white_small.png',
      'img/research_cancer_clonal_evolution_cropped_350x350.jpg',
      'img/research_virulence_350x350.jpg',
      'img/research_development_of_novel_tools_cropped_350x350.jpg',
      'img/applications/cell_seek_application.jpg',
      'img/publications/res_disease_detection.png',
      'img/publications/atoh1_2018_paper.png',
      'img/publications/cerebellum_2018_paper.png',
      'img/publications/lc3_phagocytosis_2018.png',
      'img/publications/sc_genome_sequencing_2019.png',
      'img/publications/gawad_sc_dna_seq_review.png',
      'img/publications/all_diversity.png',
      'img/publications/mutant_segregation.png',
      'img/publications/circular_rnas.jpg',
      'img/team/chuck_headshot_g225x225_r72x72.jpg',
      'img/team/veronica_headshot_g225x225_r72x72.jpg',
      'img/team/rob_headshot_g225x225_r72x72.jpg',
      'img/team/siva_headshot_g225x225_r72x72.jpg',
      'img/team/ousman_headshot_g225x225_r72x72.jpg',
      'img/team/yakun_headshot_g225x225_r72x72.jpg',
      'img/team/ripley_headshot_g225x225_r72x72.jpg',
      'img/team/tesla_headshot_g225x225_r72x72.jpg',
      'img/logos/sj_logo_white_footer.png',
      'img/logos/bwf_logo_x90.png',
      'img/header-bg.jpg',
      'img/cancer_cells_rect_gray_low_exposure.jpg',
      'img/logos/ash_logo_x90.png',
      'img/logos/lls_logo_x90.png',
      'img/logos/how_logo_x90.png',
      'img/logos/stanford-logo-vector-png--1200_50pct.png',
      'img/logos/stanford-logo-vector-png--1200_25pct.png',
      'vendor/font-awesome/fonts/**'
    ], {base: "."})
    .pipe(gulp.dest('gawadlab_appengine/www/'))
})

// Default task
gulp.task('default', ['sass', 'minify-css', 'minify-js', 'copy']);

// Configure the browserSync task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: './'
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
