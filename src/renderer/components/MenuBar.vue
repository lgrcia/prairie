<template>
  <div class="menu-tab">
    <component class="pannel" v-if="isPannelActive($store.state.Tabs.menuCurrentButton)" :is="componentName"></component>
    <div class="buttons">
      <div
        class="menu-button"
        :class="{active: isActive(button, value), 'top-rounded': !$store.state.Tabs.menuCurrentButton}"
        v-for="value, button in buttons"
        :key="button.id"
        v-on:click="buttonClick(button, value)"
      >
        <i class="explorer-button button" :class="[{grayed: !isClickable(value)}, value.icon]"></i>
      </div>
      <div class="empty"></div>
    </div>
  </div>
</template>

<script>
import FilesExplorer from "./FilesExplorer.vue";
import BlocksExplorer from "./BlocksExplorer/BlocksExplorer.vue";
import BlockOptionsExplorer from "./BlockOptions/BlockOptionsPannel.vue";

export default {
  data() {
    return {
      buttons: {
        files: {
          icon: "folder",
          selectedBlock: false
        },
        blocks: {
          icon: "blocks",
          selectedBlock: false
        },
        "block-options": {
          icon: "nodes",
          selectedBlock: true
        }
      },
      test: this.$store.state.Files.tree
    };
  },
  computed: {
    componentName: function() {
      return this.$store.state.Tabs.menuCurrentButton + "-explorer";
    }
  },
  components: {
    FilesExplorer,
    BlocksExplorer,
    BlockOptionsExplorer
  },
  methods: {
    isClickable: function(value) {
      return value.selectedBlock
        ? this.$store.state.PrairieUI.selectedBlock
        : true;
    },
    buttonClick: function(button, value) {
      if (this.isClickable(value)) {
        this.$store.dispatch(
          "setMenuCurrentButton",
          this.$store.state.Tabs.menuCurrentButton == button
            ? undefined
            : button
        );
      }
    },
    isActive: function(button, value) {
      return (
        this.$store.state.Tabs.menuCurrentButton == button &&
        this.isClickable(value)
      );
    },
    isPannelActive: function(button) {
      return button && this.isClickable(this.buttons[button]);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../style/prairie-icons-solid.scss";
@import "../style/prairie-colors.scss";

$width: 220px;

.menu-tab {
  display: flex;
  flex-direction: column;
  background-color: $UI-background-color;
  width: $width;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  border-bottom-left-radius: 5px;
  border-right: 1px solid $UI-border-color;
  opacity: 0.9;
  height:100%;

  // gif production css
  position: absolute;
  bottom: 15px;
  left: 15px;
  height:450px;
  border-radius: 6px;
  box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.1);
  //

}

.buttons {
  display: flex;
  flex-direction: row;
  margin-bottom: 3px;
}
.empty {
  background-color: $UI-background-contrast;
  flex-grow: 1;
}

.pannel {
  width: $width;
  height: 100%;
}

.menu-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: center;
  height: 40px;
  width: 40px;
  text-align: center;
  background-color: $UI-background-contrast;
  border-bottom: 3px solid $UI-background-contrast;
  padding-top: 3px;
}

.menu-button.active {
  background-color: $UI-background-color;
  border-bottom: 3px solid $UI-color-active;
}

.menu-button.top-rounded:first-of-type {
  border-top-left-radius: 5px;
}

.explorer-button {
  display: table-cell;
  font-size: 18px;
  user-select: none;
  color: $UI-button-color;
  margin: auto;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.menu-button:hover .explorer-button {
  color: $UI-button-hover-color;
}

.explorer-button.active {
  color: $UI-color-active;
}

.menu-button .explorer-button.grayed,
.menu-button:hover .explorer-button.grayed {
  color: lighten($UI-button-color, 40%);
}

.explorer-button::before {
  font-family: $icon-font-family;
  font-style: normal;
}

.folder:before {
  @include menu-icon($open-directory);
}

.blocks:before {
  @include menu-icon($function);
}

.nodes:before {
  @include menu-icon($node);
}

.menu-button {  
  border:none;
  margin-bottom: 3px;
  }
</style>