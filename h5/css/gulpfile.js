﻿var gulp = require("gulp"),
    minifycss = require('gulp-minify-css'),
    //concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync');

//编译less到css
gulp.task('less',function(){
    gulp.src(['./src/css.less'])
        .pipe(less())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(minifycss())
        .pipe(gulp.dest("./"));
});


// 浏览器自动刷新
gulp.task('browserSync', function(){
    browserSync({
        server:{
            baseDir: ''
        }
    })
})

//默认任务
gulp.task('default', ['browserSync'], function() {
    gulp.run('less');

    gulp.watch('../*.css', browserSync.reload);

    //gulp.watch('../js/*.js', browserSync.reload);

    // gulp.watch('html/*/*.html', browserSync.reload);

    //监听css文件变化
    gulp.watch(['./src/*.less','./src/*/*.less'], ['less']);

    //监听js文件变化
    //gulp.watch('./js/*.js', ['concatjs']);

});
