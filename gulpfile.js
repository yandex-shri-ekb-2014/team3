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
  autoprefixer = require('gulp-autoprefixer'),
  templateCache = require('gulp-angular-templatecache');

// Compile Our less
gulp.task('styleProcessing', function () {
    gulp.src(staticPath + 'm_*/*.less')
    .pipe(concat('tmp_styles.less'))
    .pipe(gulp.dest(publicPath + 'css'))
    .pipe(less())
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer())
    .pipe(cssmin())
    .pipe(gulp.dest(publicPath + 'css'))
});

// Js task
gulp.task('scriptProcessing', ['templateCache'], function () {
    return gulp.src([
        publicPath + 'js/templates.js',
        staticPath + 'm_*/*.js'
    ])
    .pipe(concat('events.js'))
//    .pipe(uglify())
    .pipe(gulp.dest(publicPath + 'js'))
});

// Move
gulp.task('move', ['styleProcessing', 'scriptProcessing'], function () {
    gulp.src(staticPath + 'm_*/*.{jpg,png,jpeg,gif}')
    .pipe(rename({dirname: ''}))
    .pipe(gulp.dest(publicPath + 'img'));

    gulp.src(staticPath + 'm_*/*.html')
    .pipe(rename({dirname: ''}))
    .pipe(gulp.dest(publicPath + 'html'));
});

// Clear
gulp.task('clear', function () {
    return gulp.src(publicPath) // much faster
    .pipe(rimraf());
});

// Angular templateCache
gulp.task('templateCache', function () {
    return gulp.src(staticPath + 'm_*/*.html')
    .pipe(templateCache({standalone: true}))
    .pipe(uglify())
    .pipe(gulp.dest(publicPath + 'js'));
});

// Default Task
gulp.task('default', ['styleProcessing', 'scriptProcessing', 'move']);
