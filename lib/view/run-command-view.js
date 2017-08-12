'use babel';

import { View, TextEditorView, $ } from 'atom-space-pen-views';
import { CLASS_PREFIX } from '../constants';

export default class AtomCommander extends View {
  static content = function () {
    return this.div({},
      () => {
        this.div({
          "class": `${CLASS_PREFIX}-stats`,
        }, () => {
          this.div({
            "class": "settings-view",
          }, () => {
            this.div({
              "class": 'setting-title',
            }, 'cwd');
            this.div({
              "class": `${CLASS_PREFIX}-stats-cwd setting-description`,
            }, '...');
          });
          this.div({
            "class": "settings-view",
          }, () => {
            this.div({
              "class": 'setting-title',
            }, 'file');
            this.div({
              "class": `${CLASS_PREFIX}-stats-target setting-description`,
            }, '...');
          });
        });
        this.subview('commandEntryView', new TextEditorView({
          mini: true,
          placeholderText: 'Erect...',
        }));
        this.div({
          "class": "settings-view"
        }, () => {
          this.span({
            "class": `${CLASS_PREFIX}-stats-commands text`,
          }, '');
        });
      }
    );
  }

  stats = {
    cwd: void 0,
    target: void 0,
  };

  initialize(runner) {
    this.panel = atom.workspace.addModalPanel({
      item: this,
      visible: false
    });
    this.runner = runner;
    this.subscriptions = atom.commands.add(this.commandEntryView.element, {
      'core:confirm': () => {
        this.confirm();
        return event.stopPropagation();
      },
      'core:cancel': () => {
        this.cancel();
        return event.stopPropagation();
      },
    });
    return this.commandEntryView.on('blur', () => {
      this.cancel();
    });
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  show({
    cwd,
    target,
    commands,
  }) {
    // Enable stats
    $(this.element).find(`.${CLASS_PREFIX}-stats-cwd`).html(cwd);
    $(this.element).find(`.${CLASS_PREFIX}-stats-target`).html(target);
    $(this.element).find(`.${CLASS_PREFIX}-stats-commands`).html(commands.join(' '));
    this.stats.cwd = cwd;
    this.stats.target = target;
    this.panel.show();
    this.storeFocusedElement();
    this.commandEntryView.focus();
    const editor = this.commandEntryView.getModel();
    return editor.setSelectedBufferRange(editor.getBuffer().getRange());
  }

  hide() {
    this.panel.hide();
  }

  isVisible() {
    return this.panel.isVisible();
  }

  confirm() {
    if (this.getCommand()) {
      this.runner.run(this.getCommand(), this.stats);
    }
    return this.cancel();
  }

  getCommand() {
    const command = this.commandEntryView.getModel().getText();
    if (command) {
      return command;
    }
  }

  cancel() {
    this.restoreFocusedElement();
    return this.hide();
  }

  storeFocusedElement() {
    return this.previouslyFocused = $(document.activeElement);
  };

  restoreFocusedElement() {
    return this.previouslyFocused != null ? (
      typeof this.previouslyFocused.focus === "function"
        ? this.previouslyFocused.focus()
        : undefined
    ) : undefined;
  }

  // Tear down any state and detach
  destroy() {
    return this.subscriptions.destroy();
  }

  getElement() {
    return this.element;
  }

}
