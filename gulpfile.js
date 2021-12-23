const gulp = require('gulp'),
    clean = require('gulp-clean'),
    rename = require('gulp-rename'),
    cleanCSS = require('gulp-clean-css'),
    runCmd = require('gulp-run-command').default;

gulp.task('clean', function() {
    return gulp.src(['dist/*'], {
            read: false
        })
        .pipe(clean());
});
gulp.task('build:sidebar', async function () {
    return runCmd(['npm run build'], {
        env: { NODE_ENV: 'production' },
        cwd: './sidebar',
        // ignoreErrors: true
    })();
});
gulp.task('build:panel', function () {
    return runCmd(['npm run build'], {
        env: { NODE_ENV: 'production' },
        cwd: './panel',
        // ignoreErrors: true
    })();
});

gulp.task('copy:chromefiles', function() {
    gulp.src('./manifest.json')
        .pipe(gulp.dest('./dist/'));
    gulp.src('./chromeJs/**/*.*')
        .pipe(gulp.dest('./dist/chromeJs'));
    gulp.src('./chromeHTML/*.*')
        .pipe(gulp.dest('./dist/'));
    gulp.src('./extJs/*.*')
        .pipe(gulp.dest('./dist/extJs/'));
    return gulp.src('./icon.png')
        .pipe(gulp.dest('./dist/'));
});
gulp.task('minify-css', function() {
    return gulp.src('dist/**/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest("dist/"));
});
gulp.task('copy:sidebar', function() {
    return gulp.src('./sidebar/build/static/**/*.*')
        .pipe(gulp.dest('./dist/static/'));
});
gulp.task('update:sidebar', function() {
    return gulp.src('./sidebar/build/index.html')
        .pipe(rename('sidebar.html'))
        .pipe(gulp.dest('./dist/'));
});
gulp.task('update:panel', function() {
    return gulp.src('./panel/build/index.html')
        .pipe(rename('panel.html'))
        .pipe(gulp.dest('./dist/'));
})
gulp.task('copy:panel', function() {
    return gulp.src('./panel/build/static/**/*.*')
        .pipe(gulp.dest('./dist/static/'));
});

gulp.task('child:panel', gulp.series('copy:panel', 'update:panel'));

gulp.task('child:sidebar', gulp.series('copy:sidebar', 'update:sidebar'));

// Panel is no longer used
// gulp.task('build', gulp.series('clean','copy:chromefiles', 'build:sidebar', 'build:panel', 'child:sidebar', 'child:panel'));
gulp.task('build', gulp.series('clean','copy:chromefiles', 'build:sidebar', 'child:sidebar'));

// build without running child npm
gulp.task('dev:build', gulp.series('clean','copy:chromefiles', 'child:sidebar'));

gulp.task('default', gulp.series('build'));

/************
 * Watch
 ************/
gulp.task('watch', function () {
    gulp.watch(['sidebar/build/**/*.js', 'sidebar/build/index.html'], ['child:sidebar']);
    gulp.watch(['panel/build/**/*.js', 'panel/build/index.html'], ['child:panel']);
    gulp.watch(['manifest.json', 'chrome*/**/*.*'], ['copy:chromefiles']);
});