// Paths
var publicPath = './public/';
var staticPath = './static/';

// Not production
process.env.production = false;

// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var less = require('gulp-less'),
    rimraf = require('gulp-rimraf'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglifyjs'),
    autoprefixer = require('gulp-autoprefixer');

// Jade task
gulp.task('jadeProcessing', function(){
  return gulp.src(staticPath + 'modules/m_*/jade/*.jade')
  .pipe(rename({dirname: ''}))
  .pipe(gulp.dest(publicPath + 'jade'));
});

// Compile Our less
gulp.task('styleProcessing', function() {
    gulp.src(staticPath + 'modules/m_*/less/*.less')
    .pipe(concat('tmp_styles.less'))
    .pipe(gulp.dest(publicPath + 'css'))
    .pipe(less())
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer())
    .pipe(cssmin())
    .pipe(gulp.dest(publicPath + 'css'))
});

// Js task
gulp.task('scriptProcessing', function() {
    return gulp.src(staticPath + 'modules/m_*/js/*.js')
    .pipe(concat('events.js'))
//    .pipe(uglify())
    .pipe(gulp.dest(publicPath + 'js'))
});

// Move
gulp.task('move',['styleProcessing', 'scriptProcessing'], function(){
  gulp.src(staticPath + 'modules/m_*/img/*')
  .pipe(rename({dirname: ''}))
  .pipe(gulp.dest(publicPath + 'img'));

  gulp.src(staticPath + 'js/*')
  .pipe(rename({dirname: ''}))
  .pipe(gulp.dest(publicPath + 'js'));
});

// Clear 
gulp.task('clear', function () {
    return gulp.src(publicPath) // much faster
    .pipe(rimraf());
});

// Default Task
gulp.task('default', ['jadeProcessing', 'styleProcessing', 'scriptProcessing', 'move']);
