"use strict";

import path from "path";
import gulp from "gulp";
import { plugins, args, config, taskTarget, browserSync } from "../utils";

let dirs = config.directories;
let dest = path.join(dirs.assets, dirs.api.replace(/^_/, ""));
dest = path.join(taskTarget, dest);

// Copy
gulp.task("copyApi", () => {
  return gulp
    .src(["**/*", "!{**/_*,**/_*/**,*.md}"], {
      cwd: path.join(dirs.source, dirs.api)
    })
    .pipe(plugins.changed(dest))
    .pipe(gulp.dest(dest));
});
