<template>
  <div id="file-explorer-pane" class="explorer-pane">
    <div class="project-header">
      <div class="title">{{$store.state.Files.tree.name}}</div>
      <div class="explore-button" @click="selectFolder()"></div>
    </div>
    <div class="explorer">
    <file-tree
      :selected="$store.state.Tabs.currentTab"
      class="main-root"
      id="tree-view-container"
      :model="$store.state.Files.tree"
      :depth="0"
    ></file-tree>
  </div>
  </div>
</template>

<script>
import FileTree from "./FileTree.vue";
const dirTree = require("directory-tree");
const { dialog } = require("electron").remote;

export default {
  components: {
    FileTree
  },
  methods: {
    selectFolder: function() {
      this.$store.dispatch('setBase', dialog.showOpenDialog({ properties: ["openDirectory"]})[0]);
    }
  }
};
</script>


<style lang="scss" scoped>
@font-face {
  font-family: "octicons730";
  src: url("../assets/octicons730.ttf");
}

@import "../style/prairie-colors.scss";
@import "../style/prairie-UI.scss";


@font-face {
  font-family: "fontawesome";
  src: url("../assets/fontawesome-free-5.6.3-web/webfonts/fa-solid-900.ttf");
}

#file-explorer-pane {
     display:flex;
  flex-direction: column;
  // padding: 0px 10px 0px 10px;
  height:100%;
}


.explorer-pane.visible {
  display: inline-block;
  height: 100%;
}

#tree-view-container {
  // display:flex;
  // flex-direction: column;
  // height: $explorer-height - 36px;
  // background: $UI-background-color;
  overflow-y: scroll;
  overflow-x: scroll;
}

.explorer {
  overflow-y: scroll;
  overflow-x: scroll;
}

.project-header {
  font-family: system-ui;
    padding: 0px 10px 0px 10px;
  // width: 100%;
  height: 40px;
  // background-color: $UI-border-color;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  // border: $UI-border $UI-border-color;
  // background-color: $UI-background-color;
  // margin: -1px -1px 0px -1px;
}

.project-header .title {
  font-family: system-ui;
  font-weight: 600;
  font-size: 13px;
  color: darken($file-tree-font-color, 10%);
  // margin-left: 10px;
  user-select: none;
  cursor: default;
}

.project-header .explore-button {
  // width: 1px;
  font-family: "octicons730";
  // margin-right: 5px;
}

.project-header .explore-button::before {
  // font-family: "octicons730";
  font-family: "fontawesome";
  content: "\f07c";
  font-size:14px;
  color: $file-tree-font-color;
  cursor: pointer;
}
</style>