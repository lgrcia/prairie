<template>
  <div class="block-edit-pannel">
        <div class="header">
      <div class="title">{{$store.state.PrairieUI.selectedBlock.name}}</div>
      <div class="explore-button" @click="selectFolder()"></div>
    </div>
    <code-block-options></code-block-options>
  </div>
</template>

<script>
import CodeBlockOptions from "./CodeBlockOptions/CodeBlockOptions.vue";

export default {
  props: ["blockModel"],
  components: {
    CodeBlockOptions
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

$explorer-height: 400px;

.block-edit-pannel {
  width: 200px;
  // height: 100px;
  // position: absolute;
  // border: $UI-border $UI-border-color;
  // background-color: $UI-background-color;
  // top: 55px;
  // right: 15px;
  z-index: 1000;
      padding: 0px 10px 0px 10px;
  // padding:10px;
  // border-top: 5px solid lighten($UI-button-color, 20%);
}

.header {
  font-family: system-ui;
    // padding: 0px 10px 0px 10px;
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

.header .title {
  font-family: system-ui;
  font-weight: 600;
  font-size: 13px;
  color: darken($file-tree-font-color, 10%);
  // margin-left: 10px;
  user-select: none;
  cursor: default;
}

.header .explore-button {
  // width: 1px;
  font-family: "octicons730";
  // margin-right: 5px;
}

.header .explore-button::before {
  // font-family: "octicons730";
  font-family: "fontawesome";
  content: "\f0c8";
  font-size:14px;
  color: $file-tree-font-color;
  cursor: pointer;
} 
</style>