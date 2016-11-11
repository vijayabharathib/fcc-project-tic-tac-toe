var gulp=require('gulp');
var sass=require('gulp-sass');
var autoprefixer=require('gulp-autoprefixer');
var browserSync=require('browser-sync').create();
var gulpIf=require('gulp-if');
var nano=require('gulp-cssnano');
var uglify=require('gulp-uglify');
//var htmlmin=require('gulp-htmlmin');
var haml=require('gulp-haml');
var sourcemaps=require('gulp-sourcemaps');
gulp.task('style',function() {
	gulp.src('./app/styles/**/*.scss') //take all .scss files from styles folder
		.pipe(sass().on('error',sass.logError)) //convert them from sass to css
		.pipe(autoprefixer()) //apply vendor prefixes
		.pipe(nano()) //minify the css
		.pipe(gulp.dest('./public/styles/')) //write to styles folder
		.pipe(browserSync.reload({ //reload browser
			stream:true
		}));
});

gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: '.'
		}
	});
});

gulp.task('scramble',function(){
	gulp.src('./app/scripts/main.js')
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./public/scripts/'));
});

gulp.task('minify',function(){
	gulp.src('./*.html')
		//.pipe(htmlmin({collapseWhitespace:true}))
		.pipe(gulp.dest('./'))
});

gulp.task('hamldown',function(){
	gulp.src('./app/*.haml')
		.pipe(haml({ext:'.html'}))
		.pipe(gulp.dest('./'));
});

gulp.task('default',['browserSync','style','scramble','minify','hamldown'],function(){
	gulp.watch('./app/styles/**/*.scss',['style']);
	gulp.watch('./app/scripts/**/*.js',['scramble']);
	gulp.watch('./*.html',['minify']);
	gulp.watch('./app/*.haml',['hamldown']);
	gulp.watch("app/*.haml").on('change', browserSync.reload);
});
