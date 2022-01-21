import { RangeSetBuilder } from "@codemirror/rangeset";
import { Extension, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  PluginField,
  PluginSpec,
  PluginValue,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { editorLivePreviewField, editorViewField, Plugin as ObsidianPlugin } from "obsidian";

class atomicRangePluginClass implements PluginValue {
  ranges: DecorationSet;
  stateField: StateField<any>;

  constructor(view: EditorView, plugin: ObsidianPlugin) {
    if (!this.isLivePreview) {
      this.ranges = Decoration.none;
      return;
    }
    this.scavengeStateField(view);
    this.ranges = this.buildRanges(view);
  }

  get isLivePreview() {
    return document.body.querySelector("div.markdown-source-view.is-live-preview") ? true : false;
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged) {
      if (!this.isLivePreview) {
        this.ranges = Decoration.none;
        return;
      }
      this.ranges = this.buildRanges(update.view);
    }
  }

  scavengeStateField(view: EditorView) {
    let mdView = view.state.field(editorViewField);
    this.stateField = (mdView as any).editMode?.livePreviewPlugin?.find(
      (plugin: unknown) => plugin instanceof StateField
    );
  }

  buildRanges(view: EditorView) {
    const { from, to } = view.viewport;
    let range = new RangeSetBuilder<Decoration>();
    if (!this.stateField) this.scavengeStateField(view);
    if (this.stateField) {
      view.state.field(this.stateField).between(from, to, (from: number, to: number, value: Decoration) => {
        let lineFrom = view.lineBlockAt(from);
        let lineTo = view.lineBlockAt(to);
        if (lineFrom.from === from && lineTo.to === to) {
          range.add(from - 1, to + 1, value);
        }
      });
    }
    return range.finish();
  }
}

export function atomicRangePlugin(plugin: ObsidianPlugin): Extension {
  return ViewPlugin.define(view => new atomicRangePluginClass(view, plugin), atomicPluginProvides);
}

const atomicPluginProvides: PluginSpec<atomicRangePluginClass> = {
  provide: [PluginField.atomicRanges.from(plugin => plugin.ranges)],
};
