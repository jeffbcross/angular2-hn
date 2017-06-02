// Most of this copied from this PR: https://github.com/angular/angular-cli/pull/2320
import { spawnSync } from 'child_process';
import * as path from 'path';
import {cleantmp} from 'webpack-util-cleantmp';
import { take } from 'rxjs/operator/take';

export interface ShellConfig {
  template: string;
  output: string;
  route: string;
}

export interface IWebpackPrerender {
  main: string;
  shells: ShellConfig[];
  moduleName: string;
  appRoot: string;
}

export class RenderShellPlugin {
  constructor(private options: IWebpackPrerender) {}

  apply(compiler: any) {
    compiler.plugin('emit', (compilation: any, callback: Function) => {
      /**
       * This is a utility I made for the webpack critical plugin, which creates
       * a temporary directory, and copies assets to/from compilation.assets,
       * so scripts that require filesystem access can work out of the box.
       *
       * Automatically deletes the tmp directory when the subscription is
       * disposed.
       */
      console.log(Object.keys(compilation.assets));
      // take.call(
        cleantmp({
        assets: compilation.assets,
        globToDisk: '**/*.+(js|html|css)',
        globFromDisk: '**/*.html',
      })
      // , 1)
      .subscribe((tmpDir: string) => {
        console.log('tmpDir created', tmpDir);
        this.options.shells.forEach((shell) => {
          console.log('spawning node process', this.options);
          console.log([
            path.resolve(__dirname, 'renderer.js'),
            // i.e. appModule.bundle.js
            path.resolve(tmpDir, this.options.main),
            // i.e. AppServerModule
            this.options.moduleName,
            // i.e. index.html
            // path.resolve(tmpDir, shell.template),
            // special case, providing absolute path.
            shell.template,
            // i.e. root-shell.html
            path.resolve(tmpDir, shell.output),
            // i.e. /shell
            path.resolve(tmpDir, shell.route),
            // i.e. app-root for <app-root>
            this.options.appRoot
          ])
          let proc = spawnSync('node', [
            path.resolve(__dirname, 'renderer.js'),
            // i.e. appModule.bundle.js
            path.resolve(tmpDir, this.options.main),
            // i.e. AppServerModule
            this.options.moduleName,
            // i.e. index.html
            // path.resolve(tmpDir, shell.template),
            // special case, providing absolute path.
            shell.template,
            // i.e. root-shell.html
            path.resolve(tmpDir, shell.output),
            // i.e. /shell
            path.resolve(tmpDir, shell.route),
            // i.e. app-root for <app-root>
            this.options.appRoot
          ],
          {
            cwd: tmpDir
          });
          if (proc.stderr.toString()) {
            return callback(proc.stderr.toString());
          }
          console.log('process done');
          // callback();
        });
      });
    });
  }
}
