<template>
  <div class="tab-bar-global">
    <div class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item"
        :class="{active: tab.path == currentTab.path}"
      >
        <div class="title" v-on:click="selectTab(tab)">{{tab.name}}</div>
        <div class="tab-close">
          <div class="close-button" @click="removeTab(tab)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["tabs", "currentTab"],
  methods: {
    selectTab: function(tab) {
      this.$store.dispatch(
        "setPrairieEventHandler",
        this.$store.state.Tabs.tabsContent[
          tab.name
        ]
      );
      this.$store.dispatch("setCurrentTab", tab);
    },
    removeTab: function(tab) {
      this.$store.dispatch("closeWS", tab);
      this.$store.dispatch("removeTab", tab);
      this.$store.dispatch("setClose", tab.path);
    }
  }
};
</script>

<style lang="scss" scoped>
$UI-background-focus-color: #ffffff;
$UI-font-color: rgb(40, 40, 40);
// $UI-background-color: #fafafa;
$UI-background-color: #f7f7f7;
$UI-color-active: #5b91ff;
$UI-border-color: #e7e7e7;
$UI-border-width: 1px;
$UI-border: $UI-border-width solid;

@import "../style/prairie-colors.scss";

@font-face {
  font-family: "octicons730";
  src: url("../assets/octicons730.ttf");
}

.tab-bar-global {
  width: 100%;
}

.tab-bar {
  position: relative;
  flex-direction: row;
  display: flex;
  flex: 1;
  background: darken($UI-background-color, 3%);
  border-radius: 0;
  border-bottom: $UI-border $UI-border-color;
  overflow-y: hidden;
  // min-width: 100%;
  min-height: 30px;
    width: 100%;
}

.tab-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: $UI-background-color;
  position: relative;
  text-align: left;
  line-height: 2em;
  height: 36px;
  min-width: 100px;
  // border-top: 3px solid $UI-background-color;
  color: $UI-border-color;
  user-select: none;
  border-right: $UI-border $UI-border-color;
  // border-bottom: 5px solid white;
  margin-bottom: -4px;
}

.tab-item.active {
  // border-top: 3px solid $UI-color-active;
  background-color: $UI-background-color;
}

.tab-item .title {
  display: inline-block;
  font-family: system-ui;
  font-size: 12px;
  color: lighten($UI-font-color, 40%);
  margin-left: 25px;
  margin-right: 10px;
  vertical-align: middle;
  cursor: default;
  user-select: none;
}

.tab-item .tab-close {
  display: inline-block;
  width: 20px;
}

.tab-item .tab-close .close-button {
  display: none;
  user-select: none;
  color: $UI-font-color;
  font-weight: 400;
  cursor: pointer;
}

.tab-item:hover .tab-close .close-button {
  display: inline-block;
  font-family: "octicons730", sans-serif;
}

.close-button:before {
  content: "\e9af";
  font-size: 13px;
}

.tab-item.active .title {
  color: lighten($UI-font-color, 10%);
}

.tab-item.active:before {
  color: lighten($UI-font-color, 10%);
}
</style>