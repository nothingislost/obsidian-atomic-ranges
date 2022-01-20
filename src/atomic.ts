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
import { editorViewField, Plugin as ObsidianPlugin } from "obsidian";

class atomicRangePluginClass implements PluginValue {
  ranges: DecorationSet;
  stateField: StateField<any>;

  constructor(view: EditorView, plugin: ObsidianPlugin) {
    let mdView = view.state.field(editorViewField);
    this.stateField = (mdView as any).editMode?.livePreviewPlugin?.find(
      (plugin: unknown) => plugin instanceof StateField
    );
    this.ranges = this.buildRanges(view);
  }
  update(update: ViewUpdate) {
    this.ranges = this.buildRanges(update.view);
  }

  buildRanges(view: EditorView) {
    const { from, to } = view.viewport;
    let range = new RangeSetBuilder<Decoration>();
    view.state.field(this.stateField).between(from, to, (from: number, to: number, value: Decoration) => {
      let lineFrom = view.lineBlockAt(from);
      let lineTo = view.lineBlockAt(to);
      if (lineFrom.from === from && lineTo.to === to) {
        range.add(from - 1, to + 1, value);
      }
    });
    return range.finish();
  }
}

export function atomicRangePlugin(plugin: ObsidianPlugin): Extension {
  return ViewPlugin.define(view => new atomicRangePluginClass(view, plugin), atomicPluginProvides);
}

const atomicPluginProvides: PluginSpec<atomicRangePluginClass> = {
  provide: [PluginField.atomicRanges.from(plugin => plugin.ranges)],
};
