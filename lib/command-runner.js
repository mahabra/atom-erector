'use babel';

import createErector, { pwd, configure } from 'erector';
import Events from 'events';
import babelCore from 'babel-core';
import path from 'path';
import { spawn } from 'child_process';

export default class CommandRunner extends Events {
  run(command, {
    cwd,
    target,
  }) {
    this.emit('command', command);
    const erector = createErector();
    erector.use(pwd(cwd));
    erector.use(configure(({
      babel
    }) => ({
      babel: {
        ...babel,
        extensions: ['.es'],
      }
    })));
    // Unlock .js property (because babel makes hook on it)
    Object.defineProperty(require.extensions, '.js', {
      writable: true,
      value: require.extensions['.js'],
    });
    erector.run(path.resolve(__dirname, './test.es'))
    .then((result) => {
      this.emit('data', result);
    })
    .catch((e) => {
      this.emit('error', e.message);
    });

    // this.childProcess = spawn('erect', [command], {
    //   cwd,
    // });

    // this.childProcess.stderr.on('data', (chunk) => {
    //   this.emit('error', chunk.toString());
    // });
  }
  kill() {
    // this.emit('kill');
    // if (this.childProcess) {
    //   this.childProcess.stdin.pause();
    //   this.childProcess.stdin.kill();
    // }
  }
  on(event, handler) {
    super.on(event, handler);
    return () => {
      this.removeListener(event, handler);
    }
  }
}
