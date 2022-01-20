import { Plugin } from "obsidian";
import { atomicRangePlugin } from "./atomic";

export default class NewPlugin extends Plugin {
  async onload() {
    this.registerEditorExtension(atomicRangePlugin(this));
  }
}
