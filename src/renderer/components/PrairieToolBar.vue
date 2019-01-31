<template>
  <div class="prairie-tool-bar">
    <div class="buttons">
      <div
        class="menu-button top-rounded"
        v-for="button, value in buttons"
        :key="value.id"
        v-on:click="click(value)"
      >
        <i class="explorer-button fas button" :class="[button]"></i>
      </div>
      <div class="empty top-rounded"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      buttons: {
        play: "play",
        gui_editor: "gui-editor",
        zoom: "zoom"
      },
      test: 0
    };
  },
  computed: {},
  components: {},
  methods: {
    click: function(button) {
      this.test = button;
      if (button == "play") {
        this.$store.dispatch("eventToPrairie", {
          name: "updateModelAndRun"
        });
      } else if (button == "gui_editor") {
        this.$store.dispatch("eventToPrairie", {
          name: "setGUIEditorMode"
        });
      } else if (button == "zoom") {
        this.$store.dispatch("eventToPrairie", {
          name: "zoom",
          data: {
            factor: 0.7
          }
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../style/prairie-icons-solid.scss";
@import "../style/prairie-colors.scss";

$width: 220px;

.prairie-tool-bar {
  position: absolute;
  right: 15px;
  top: 50px;
  background-color: $UI-background-color;
  // width: $width;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.1);
  opacity: 0.9;
}

.prairie-tool-bar .buttons {
  display: flex;
  flex-direction: row;
}

.prairie-tool-bar .empty {
  background-color: $UI-background-contrast;
  flex-grow: 1;
  border-bottom-right-radius: 5px;
  border-top-right-radius: 5px;
}

.prairie-tool-bar .menu-button {
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

.prairie-tool-bar .menu-button.active {
  background-color: $UI-background-color;
  border-bottom: 3px solid $UI-color-active;
}

.prairie-tool-bar .menu-button:first-of-type {
  border-bottom-left-radius: 5px;
  border-top-left-radius: 5px;
}

.prairie-tool-bar .explorer-button {
  display: table-cell;
  font-size: 17px;
  user-select: none;
  color: $UI-button-color;
  margin: auto;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.prairie-tool-bar .menu-button:hover .explorer-button {
  color: $UI-button-hover-color;
}

.prairie-tool-bar .explorer-button.active {
  color: $UI-color-active;
}

.explorer-button::before {
  font-family: $icon-font-family;
  font-style: normal;
}

.play::before {
  @include menu-icon($play);
}

.gui-editor:before {
  @include menu-icon($gui-editor);
}

.zoom:before {
  @include menu-icon($zoom);
}
</style>