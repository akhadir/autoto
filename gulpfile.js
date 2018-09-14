var gulp = require('gulp'),
    clean = require('gulp-clean'),
    rename = require('gulp-rename'),
    runSequnce = require('run-sequence'),
    run = require('gulp-run-command');
    

gulp.task('clean', function() {
    return gulp.src(['dist/*'], {
            read: false
        })
        .pipe(clean());
});
gulp.task('build:sidebar', function () {
    return run('cd sidebar; npm run build;');
});
gulp.task('build:panel', function () {
    return run('cd panel; npm run panel;');
});
gulp.task('child:sidebar', function () {
    return runSequnce('copy:sidebar', 'update:sidebar');
});
gulp.task('child:panel', function () {
    return runSequnce('copy:panel', 'update:panel');
});
gulp.task('copy:chromefiles', function() {
    gulp.src('./manifest.json')
        .pipe(gulp.dest('./dist/'));
    gulp.src('./chromeJs/*.*')
        .pipe(gulp.dest('./dist/chromeJs'));
    gulp.src('./chromeHTML/*.*')
    .pipe(gulp.dest('./dist/'));
    gulp.src('./extJs/*.*')
    .pipe(gulp.dest('./dist/extJs/'));
    gulp.src('./icon.png')
    .pipe(gulp.dest('./dist/'));
});
gulp.task('minify-css', function() {
    gulp.src('dist/**/*.css')
        .pipe(minifyCss())
        .pipe(gulp.dest("dist/"));
});
gulp.task('copy:sidebar', function() {
    gulp.src('./sidebar/build/static/**/*.*')
        .pipe(gulp.dest('./dist/static/'));
});
gulp.task('update:sidebar', function() {
    gulp.src('./sidebar/build/index.html')
        .pipe(rename('sidebar.html'))
        .pipe(gulp.dest('./dist/'));
});
gulp.task('update:panel', function() {
    gulp.src('./panel/build/index.html')
        .pipe(rename('panel.html'))
        .pipe(gulp.dest('./dist/'));
})
gulp.task('copy:panel', function() {
    gulp.src('./panel/build/static/**/*.*')
        .pipe(gulp.dest('./dist/static/'));
});

gulp.task('build', function() {
    return runSequnce('clean','copy:chromefiles', 'build:sidebar', 'build:panel', 'child:sidebar', 'child:panel');
});

gulp.task('dev:build', function() {
    return runSequnce('clean','copy:chromefiles', 'child:sidebar', 'child:panel');
});

gulp.task('default', ['build']);

/************
 * Watch
 ************/
gulp.task('watch', function () {
    gulp.watch(['sidebar/build/**/*.js', 'sidebar/build/index.html'], ['child:sidebar']);
    gulp.watch(['panel/build/**/*.js', 'panel/build/index.html'], ['child:panel']);
    gulp.watch(['manifest.json', 'chrome*/**/*.*'], ['copy:chromefiles']);
});