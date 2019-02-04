<template>
  <li :class="{active: isActive}">
    <div
      class="tree-item"
      :class="{collapsable: isCollapsable, collapsed: !open, expanded: open, 'open-tab': isOpenable && model.open}"
      :style="{'padding-left': 10 * (depth+1) - (isActive ? 3 : 0) + 'px'}"
      @click="clicked"
    >
      <div
        :class="[model.type, model.extension]"
        :draggable="(model.type == 'function')? 'true' : 'false'"
        class="tree-item-title"
        @dblclick="openFile(model)"
        v-on:dragstart="dragstart(model, $event)"
      >{{model.name}}</div>
    </div>
    <ul v-show="open" v-if="isCollapsable">
      <file-tree
        class="item"
        v-for="(model_i, index) in model.children"
        :key="index"
        :model="model_i"
        :selected="selected"
        :depth="depthCopy + 1"
        @toggle-parent="toggleParent()"
      ></file-tree>
    </ul>
  </li>
</template>

<script>
import { PrairieController } from "../../prairie/prairie_controller.js";
const log = require("electron-log");

export default {
  name: "file-tree",
  data: function() {
    return {
      open: false,
      test: 0
    };
  },
  props: {
    model: Object,
    selected: Object,
    depth: Number
  },
  computed: {
    isFolder: function() {
      return this.model.type == "directory";
    },
    depthCopy: function() {
      var copy = this.depth;
      return copy;
    },
    isActive: function() {
      return this.selected.path == this.model.path;
    },
    isOpenable: function() {
      return this.model.type != "directory" && this.model.type != "function";
    },
    isCollapsable: function() {
      return (
        this.model.type == "directory" ||
        (this.model.type == "file" && this.model.extension == "py")
      );
    },
    isSelectable: function() {
      return (
        (this.model.type == "file" && this.model.open) ||
        this.model.type == "function"
      );
    }
  },
  watch: {
    selected: function(tab) {
      if (tab.path == this.model.path && !this.open) {
        this.toggleParent();
      }
    }
  },
  methods: {
    toggle: function() {
      if (this.isCollapsable) {
        this.open = !this.open;
        this.$store.dispatch("appendPath", {
          path: this.model.path,
          type: this.model.extension || this.model.type
        });
      }
    },
    clicked: function() {
      if (this.model.type == "directory") {
        this.toggle();
      } else if (this.model.type == "file" && this.model.extension == "py") {
        this.toggle();
      } else if (this.isSelectable) {
        if (this.model.type === "file") {
          this.openFile(this.model);
        } else if (this.model.type === "function") {
          this.displayFunctionInfo();
        }
      }
    },
    displayFunctionInfo: function() {
      // this.$store.dispatch("select");
    },
    openFile: function(model) {
      if (this.isOpenable) {
        // this.$store.dispatch("select");
        if (this.model.extension == "pr") {
          let new_prairie = new PrairieController(
            "prairie",
            model.name,
            this.$store.state.Tabs.prairie_n
          );
          new_prairie.loadModel(model.path, () => {
            this.$store.dispatch("addTab", {
              model: model,
              content: new_prairie.eventTarget
            });
          });
          // this.$store.dispatch(
          //   "setPrairieEventHandler",
          //   this.$store.state.Tabs.tabsContent[model.name]
          // );
          // this.test = new_prairie;
          new_prairie.eventTarget.addEventListener("block-selected", e => {
            this.$store.dispatch("blockSelected", e.detail);
            if (e.detail) {
              this.$store.dispatch("setMenuCurrentButton", "block-options");
            }
          });
        } else {
          this.$store.dispatch("addTab", { model: model });
        }
        this.$store.dispatch("setOpen", model.path);
        this.$emit("toggle-parent");
      }
    },
    toggleParent: function() {
      if (!this.open) {
        this.toggle();
        this.$emit("toggle-parent");
      }
    },
    dragstart: function(model, event) {
      event.dataTransfer.setData(
        "text",
        JSON.stringify({
          type: "function",
          model: {
            file_path: model.path,
            function_name: model.name
          }
        })
      );
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../style/prairie-colors.scss";
@import "../style/prairie-icons-solid.scss";

.item {
  position: relative;
  display: block;
  margin-bottom: 4px;
}

li {
  list-style-type: none;
  text-align: left;
  padding-left: 0px;
}

ul {
  text-align: left;
  display: block;
  list-style-type: none;
  padding-left: 0px;
  margin: 0px;
}

div:before {
  font-family: $icon-font-family;
  color: $icon-color;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.tree-item {
  white-space:nowrap;
}

.open-tab .tree-item-title:before {
  color: darken($UI-color-active, 10%);
}

.open-tab .tree-item-title {
  color: darken($UI-color-active, 10%);
}

div.tree-item-title {
  display: inline-block;
  font-family: system-ui;
  /* font-family: 'Roboto Mono', monospace;
  font-weight: 400; */
  font-size: 12px;
  user-select: none;
  cursor: pointer;
  color: darken($file-tree-font-color, 30%);
}
div.collapsable.collapsed:before {
  // content: "\e918";
  content: $right-arrow;
  // padding-right: 8px;
  padding-right: 8px;
  font-size: 12px;
  font-size: 10px;
  color: $file-tree-font-color;
}
div.collapsable.expanded:before {
  // content: "\e916";
    content: $down-arrow;
  // padding-right: 7px;
  padding-right: 6px;
  font-size: 12px;
  font-size: 10px;
  color: $file-tree-font-color;
}
div.collapsed div.tree-item-title.directory:before {
  // content: "\e936";
  content: $directory;
  // padding-right: 6px;
  padding-right: 5px;
  font-size: 16px;
  font-size: 14px;
}
div.expanded div.tree-item-title.directory:before {
  // content: "\e936";
  content: $open-directory;
  // padding-right: 6px;
  padding-right: 5px;
  font-size: 16px;
  font-size: 14px;
}
div.file.py:before {
  // content: "\e935";
  content: $python-file;
  padding-left: 0px;
  padding-right: 6px;
  // font-size: 16px;
  font-size: 15px;
}
div.file:before {
  // content: "\e93d";
  content: $file;
  padding-left: 15px;
  padding-right: 5px;
  // font-size: 16px;
  font-size: 15px;
}
div.function:before {
  // content: "\e90a";
  content: $function;
  padding-left: 15px;
  padding-right: 6px;
  font-size: 14px;
  // margin-top: 2px;
  color: $UI-color-active;
  vertical-align: center;
}
div.pr:before {
  content: $prairie-file;
  padding-left: 15px;
  padding-right: 5px;
  font-size: 14px;
  color: $UI-color-active;
}
.active {
  background-color: lighten($file-tree-font-color, 46%);
  border-left: 3px solid $file-tree-font-color;
  padding-left: -3px;
}

.active .tree-item-title {
  color: lighten($file-tree-font-color, 0%);
}
.active .tree-item-title:before {
  color: lighten($file-tree-font-color, 20%);
}
</style>