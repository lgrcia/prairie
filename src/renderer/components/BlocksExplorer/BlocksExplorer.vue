<template>
  <div id="file-explorer-pane">
    <div class="pane-header">
      <div
        class="back-button"
        :class="{enabled: vtype === 'libraries'}"
        v-on:click="vtype = 'libraries'"
      ></div>
      <input class="search-input" placeholder="search">
    </div>
    <div class="library-explorer">
      <div class="header">
        <!-- <div class="title" :class="[vtype]">{{library_name}}</div> -->
        <div class="title" :class="[vtype]" v-if="vtype === 'library'">{{library_name}}</div>
        <div class="title library" v-else>all</div>
        <!-- <div class="title" :class="[vtype]" v-else></div> -->
        <div class="separator-bar"></div>
      </div>
      <div class="blocks-container" v-if="vtype === 'library'">
        <block-item
          v-for="block in functionBlocks"
          :key="block.id"
          v-bind="block"
          draggable="true"
          class="block"
        ></block-item>
      </div>
      <div class="blocks-container" v-else>
        <block-item
          v-for="block in functionBlocks"
          :key="block.id"
          :svg_path="block.svg_path"
          v-bind="block"
          class="block"
          v-on:dblclick.native="open(block)"
        ></block-item>
      </div>
    </div>
  </div>
</template>

<script>
import BlockItem from "./BlockItem.vue";
import { get_function_blocks } from "../../../prairie/python_parser.js";
import { libraries } from "../../../blocks/libraries.js";

export default {
  props: {
    file_path: String
  },
  data() {
    return {
      vtype: "libraries",
      selected_library_path: "",
      library_name: "",
      test: 0
    };
  },
  components: {
    BlockItem
  },
  computed: {
    functionBlocks: function() {
      if (this.vtype === "library") {
        this.test = get_function_blocks(this.selected_library_path)
        return get_function_blocks(this.selected_library_path);
      } else if (this.vtype === "libraries") {
        return libraries;
      }
    }
  },
  methods: {
    open: function(block) {
      this.vtype = "library";
      this.selected_library_path = block.library_path;
      this.library_name = block.name;
    },
  }
};
</script>

<style lang="scss" scoped>
$UI-background-focus-color: #ffffff;
$UI-font-color: rgb(40, 40, 40);
$UI-background-color: #fafafa;
$UI-color-active: #5b91ff;
$UI-border-color: #e7e7e7;
$UI-border-width: 1px;
$UI-border: $UI-border-width solid;
$UI-button-color: #8b8b8b;
$file-tree-font-color: #777777;
$UI-button-hover-color: lighten($UI-button-color, 10%);
$UI-button-clicked-color: darken($UI-button-color, 20%);

$explorer-height: 350px;
$block-item-width: 100px;
$header-height: 40px;
$menu-height: 40px;

@font-face {
  font-family: "Roboto Mono";
  src: url("../../assets/RobotoMono-Regular.ttf") format("truetype");
  font-weight: 300;
  font-style: normal;
}

@font-face {
  font-family: "octicons730";
  src: url("../../assets/octicons730.ttf");
}

#file-explorer-pane {
  padding: 0px 10px 0px 10px;
  // width:200px;
}

// .block {
//   display: inline-block;
//   width: $block-item-width;
// }

.block {
  margin-bottom: 3px;
}

.back-button {
  margin-top: 3px;
}

.back-button.enabled::before {
  color: rgba($UI-button-color, 0.3);
}

.back-button::before {
  content: "\e917";
  font-family: "octicons730";
  margin-right: 8px;
  font-size: 18px;
  color: $file-tree-font-color;
  cursor: pointer;
}

.search-input {
  width: 100%;
  height: 18px;
  font-family: system-ui;
  background-color: white;
  font-size: 12px;
  border: 0px;
  padding: 2px;
  border-radius: 4px;
  color: $UI-font-color;
  padding-left: 4px;
  // margin-right: 10px;
  border: $UI-border $UI-border-color;
}
.search-input:focus {
  outline: none;
}

.search-input::placeholder {
  font-family: system-ui;
  font-size: 11px;
  user-select: none;
}

#file-explorer-pane {
  width: 200px;
  // height: $explorer-height;
  text-align: center;
}

.explorer-pane {
  // display:flex;
  // flex-direction: column;
  // align-items: center;
  // align-content: flex-start;
  position: absolute;
  // border: $UI-border $UI-border-color;
  // background-color: $UI-background-color;
  bottom: 40px;
  left: -$UI-border-width;
}

.library-explorer {
  overflow-y: scroll;
  // padding: 0 5px 0 5px;
  // height: $explorer-height - $menu-height;
}

.blocks-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  padding-top: 10px;
  margin: auto;
  // width: 3 * $block-item-width;
}
.explorer-pane.visible {
  display: inline-block;
}

.pane-header {
  display: flex;
  flex-direction: row;
  font-family: system-ui;
  justify-items: center;
  width: 100%;
  height: $header-height;
  // background-color: $UI-border-color;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  // border: $UI-border $UI-border-color;
  // background-color: $UI-background-color;
  margin: -1px -1px 0px -1px;
}

.header {
  display: flex;
  flex-direction: row;
  position: relative;
  align-items: baseline;
  margin-top: 5px;
}

.header .title {
  display: inline-block;
  font-family: "Roboto Mono", monospace;
  // font-family: system-ui;
  font-weight: 600;
  font-size: 14px;
  // margin-left: 25px;
  user-select: none;
  color: darken($file-tree-font-color, 10%);
  -webkit-font-smoothing: antialiased;
  // text-rendering: optimizeLegibility;
}

.header .title::before {
  font-family: "octicons730", monospace;
  font-size: 25px;
  font-weight: normal;
  color: $file-tree-font-color;
  margin-right: 2px;
  margin-left: 2px;
  vertical-align: top;
}

// .header .title.library::before {
//     content: "\e989";
// }

// .header .title.libraries::before {
//     content: "\e989";
// }

.separator-bar {
  display: inline-block;
  position: relative;
  background-color: darken($file-tree-font-color, 10%);
  height: 2px;
  vertical-align: bottom;
  width: 100%;
  border-radius: 3px;
  margin-left: 10px;
  margin-right: 5px;
}
</style>