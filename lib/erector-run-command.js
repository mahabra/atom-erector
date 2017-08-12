'use babel';

import { CompositeDisposable, Disposable } from 'atom';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import runCommandView from './view/run-command-view.js';
import outputView from './view/output-view.js';
import CommandRunner from './command-runner.js';

class Main {
  modalPanel = null;
  subscriptions = null;
  activate(state) {
    this.runner = new CommandRunner();
    this.runCommandView = new runCommandView(this.runner);
    this.outputView = new outputView(this.runner);
    this.subscriptions = atom.commands.add('atom-workspace', {
      'run-erector-command:run': () => {
        this.run();
      },
      'run-erector-command:stop': () => {
        this.stop();
      },
      'run-erector-command:toggle-panel': () => {
        this.togglePanel();
      },
      'run-erector-command:kill-last-command': () => {
        this.killLastCommand();
      },
    });
  }
  deactivate() {
    this.commandOutputView.destroy();
  }
  dispose() {
    return this.subscriptions.dispose();
  }
  run() {
    // Try to get active panel
    const item = global.atom.workspace.getActivePaneItem();
    let target = item && item.buffer && item.buffer.file;
    let cwd = target && path.dirname(item.buffer.file);

    const atom = global.atom;
    const basePaths = atom.project.getPaths()
    const listTree = document.querySelector('.tree-view');
    const selected = listTree.querySelectorAll('.selected > .header > span, .selected > span');
    if (selected.length > 1 || selected.length === 0) {
      // Ignore
    } else {
      const dcwd = selected[0].dataset.path;
      const stats = fs.lstatSync(dcwd);
      if (stats.isDirectory()) {
        cwd = dcwd;
      } else {
        cwd = path.dirname(dcwd);
        target = path.basename(dcwd);
      }
    }
    let commands = [];
    // Get allowed commands
    exec('erect ls', {
      cwd: cwd,
    }, (error, stdout, stderr) => {
      if (!error) {
        commands = stdout.trim().split(' ').filter(Boolean);
      }
      this.runCommandView.show({
        cwd,
        target,
        commands,
      })
    });
  }
  stop() {
    this.runCommandView.hide();
  }
  togglePanel() {
    console.log('togglePanel is not supported yet');
  }
  killLastCommand() {
    console.log('killLastCommand is not supported yet');
  }
}

export default new Main;
