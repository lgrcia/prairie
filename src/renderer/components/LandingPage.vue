<template>
  <div id="app">
    <title-bar></title-bar>
    <div class="workspace">
      <menu-bar></menu-bar>
      <div class="tabs-bar-content">
        <tab-bar
          :tabs="$store.state.Tabs.tabs"
          :currentTab="$store.state.Tabs.currentTab"
          v-if="$store.state.Tabs.tabs.length"
        ></tab-bar>
        <div class="content" id="prairie"></div>
      </div>
    </div>
    <!-- <block-options-pannel v-if="$store.state.PrairieUI.selectedBlock" :blockModel="$store.state.PrairieUI.selectedBlock"></block-options-pannel> -->
    <!-- <prairie-tool-bar></prairie-tool-bar> -->
  </div>
</template>

<script>
import TabBar from "./TabBar.vue";
import TitleBar from "./TitleBar.vue";
import MenuBar from "./MenuBar.vue";
import PrairieToolBar from "./PrairieToolBar.vue";
import BlockOptionsPannel from "./BlockOptions/BlockOptionsPannel.vue";
import { PrairieController } from "../../prairie/prairie_controller.js";
const _ = require("underscore");

export default {
  name: "app",
  data() {
    return {
      tabs: [""],
      currentTab: [],
      prairie_ctr: 0
    };
  },
  components: {
    TabBar,
    MenuBar,
    BlockOptionsPannel,
    PrairieToolBar,
    TitleBar
  },
  mounted: function() {
    // let model = {
    //   name: 'test_gui_save_2.pr',
    //   path: '/Users/lgr/Code/prairie-vue/src/prairie/tests/test_gui_save_2.pr'
    // }
    // let new_prairie = new PrairieController(
    //   "prairie",
    //   model.name,
    //   this.$store.state.Tabs.prairie_n
    // );
    // new_prairie.loadModel(model.path, () => {
    //   this.$store.dispatch("addTab", {
    //     model: model,
    //     content: new_prairie.eventTarget
    //   });
    // });

    document.addEventListener("keydown", event => {
      const keyName = event.key;
      // console.log(keyName);
      if (event.shiftKey) {
        if (keyName === "Enter") {
          // console.log("run");
          this.$store.dispatch("eventToPrairie", {
            name: "updateModelAndRun"
          });
        } else if (keyName == "M") {
          // console.log("move");
          this.prairie_ctr.setGUIEditorMode();
        } else if (keyName == "E") {
          let zoom = 0.8;
          // console.log("zoom");
          let svg = this.prairie_ctr.view.svg;
          svg.zoom(zoom);
          svg.viewbox(0, 0, svg.viewbox().width, svg.viewbox().height);
        } else if (keyName == "S") {
          this.$store.dispatch("eventToPrairie", {
            name: "saveModel",
            data: {
              filename: "test_gui_save.pr",
              fpath: "/Users/lgr/Code/prairie-vue/src/prairie"
            }
          });
        }
      }
    });

    // this.addPrairieTab();
  },
  methods: {
    addPrairieTab: function() {
      this.$store.dispatch("addTab", {
        model: {
          name: "unamed.pr",
          open: false,
          saved: false,
          extension: "pr",
          path: "unamed.pr"
        }
      });

      // this.prairie_ctr = new PrairieController("prairie", "DEF");
      // this.$store.dispatch(
      //   "setPrairieEventHandler",
      //   this.prairie_ctr.eventTarget
      // );
      // // this.prairie_ctr.addBlock("code", {
      // //   file_path: "/Users/lgr/Code/prairie-vue/src/blocks/basics.py",
      // //   id: "test_el"
      // // });
      // this.prairie_ctr.eventTarget.addEventListener("block-selected", e => {
      //   this.$store.dispatch("blockSelected", e.detail);
      // });
      // let block_model = this.prairie_ctr.getBlockModelById("test_el");
      // let new_bm = _.clone(block_model);
      // new_bm.nodes.in.push({
      //   name: "n",
      //   id: "node-test",
      //   value: NaN,
      //   type: "in",
      //   connections: [],
      //   connected: false,
      //   ready: false,
      //   show_name: true
      // });
      // new_bm.nodes.out.push({
      //   name: "i",
      //   id: "node-tesut",
      //   value: NaN,
      //   type: "out",
      //   connections: [],
      //   connected: false,
      //   ready: false,
      //   show_name: true
      // });
      // this.$store.dispatch("eventToPrairie", {
      //   name: "updateBlockShapeAndNodes",
      //   data: {
      //     model: new_bm
      //   }
      // });
    }
  },
  computed: {
    SelectedBlock: function() {
      return this.$store.state.Tabs.selectedBlock;
    }
  },
  mounted: function() {
    // this.addPrairieTab()
  }
};
</script>

<style lang="scss" scoped>
@import url("../../prairie/style/elements-style-light.scss");
@import "../style/prairie-colors.scss";
@import "../style/prairie-UI.scss";

html,
body  {
  margin: 0 !important;
  padding: 0 !important;
  width: 100%;
  height: 100%;
}

#app {
  // position:relative;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  color: #2c3e50;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content {
  height: 100%;
  width: 100%;
  // width: 100%;
  // background-color: rgb(221, 208, 190);
  overflow: hidden;
}

.block-options {
  width: 200px;
  height: 100px;
  position: absolute;
  border: $UI-border $UI-border-color;
  background-color: $UI-background-color;
  top: 55px;
  right: 15px;
  z-index: 1000;
  // left: -$UI-border-width;
}

.workspace {
  height: 100%;
  width:100%;
  // align-items: stretch;
  display: flex;
  flex-direction: row;
}

.tabs-bar-content {
  height: 100%;
    width: 100%;
  // align-items: stretch;
  display: flex;
  flex-direction: column;
}
</style>
