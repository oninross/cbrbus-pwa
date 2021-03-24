"use strict";

import gulp from "gulp";
import { plugins, args, config, taskTarget, browserSync } from "../utils";

let dirs = config.directories;

// Watch task
gulp.task("watch", done => {
  if (!args.production) {
    // Styles
    gulp.watch(
      [
        `${dirs.source}/${dirs.css}/**/*.{scss,sass}`,
        `${dirs.source}/${dirs.modules}/**/*.{scss,sass}`
      ],
      gulp.series("sass")
    );

    // Pug Templates
    gulp.watch(
      [
        `${dirs.source}/**/*.pug`,
        `${dirs.source}/${dirs.data}/**/*.{json,yaml,yml}`
      ],
      gulp.series("pug")
    );

    // Copy
    gulp.watch(
      [
        `${dirs.source}/**/*`,
        `!${dirs.source}/{**/\_*,**/\_*/**}`,
        `!${dirs.source}/**/*.pug`
      ],
      gulp.series("copy")
    );

    // Images
    gulp.watch(
      [`${dirs.source}/${dirs.images}/**/*.{jpg,jpeg,gif,svg,png}`],
      gulp.series("imagemin")
    );

    // All other files
    gulp
      .watch([
        `${dirs.temporary}/**/*`,
        `!${dirs.temporary}/**/*.{css,map,html,js}`
      ])
      .on("change", browserSync.reload);
  }
  done();
});
