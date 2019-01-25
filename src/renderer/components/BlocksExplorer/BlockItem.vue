<template>
  <div class="block-item" v-on:dragstart="dragstart">
    <svg viewBox="0 0 30 25" width="34" height="34">
      <path :d="svg_path"></path>
      <path
        d="M21.913,2.889c2.72,0.051 5.154,2.446 5.206,5.206c0.023,3.584 0.067,7.17 -0.001,10.754c-0.086,2.7 -2.473,5.086 -5.205,5.138c-4.631,0.029 -9.264,0.087 -13.894,-0.001c-2.701,-0.086 -5.086,-2.473 -5.138,-5.205c-0.023,-3.585 -0.067,-7.17 0.001,-10.754c0.086,-2.701 2.473,-5.086 5.205,-5.138c4.609,-0.03 9.217,-0.03 13.826,0Zm-13.754,1.442c-2.005,0.013 -3.8,1.764 -3.836,3.78c-0.016,3.583 -0.109,7.169 0.003,10.75c0.087,1.947 1.813,3.646 3.779,3.683c4.613,0.029 9.227,0.086 13.84,-0.001c1.967,-0.063 3.696,-1.796 3.732,-3.782c0.031,-3.566 0.062,-7.133 -0.001,-10.699c-0.062,-1.962 -1.797,-3.693 -3.781,-3.731c-4.579,-0.029 -9.157,0 -13.736,0Z"
      ></path>
    </svg>
    <div class="title-cont">
      <div class="title" :class="{small: name.length>1000}">{{name}}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    name: String,
    svg_path: String,
    path: String,
    icon_text: String,
  },
  methods: {
    dragstart: function(event) {
      event.dataTransfer.setData(
        "text",
        JSON.stringify({
          type: this.title,
          model: {
            file_path: this.path,
            function_name: this.name,
            svg_path: this.svg_path,
            icon_text: this.icon_text
          }
        })
      );
    }
  }
};
</script>

<style lang="scss" scoped>
$UI-border-width: 1px;
$UI-background-focus-color: #ffffff;
$UI-font-color: rgb(40, 40, 40);

$UI-border-color: #e7e7e7;
$UI-background-color: #fafafa;
$UI-color-active: #5b91ff;

$UI-button-color: #8b8b8b;
$UI-button-hover-color: lighten($UI-button-color, 10%);
$UI-button-clicked-color: darken($UI-button-color, 20%);

$UI-border: $UI-border-width solid;

$block-icon-color: $UI-button-color;
$block-icon-hover-color: darken($UI-button-hover-color, 20%);
$block-icon-text-color: $block-icon-color;
$block-icon-text-background-color: lighten($UI-button-hover-color, 20%);
$block-libraries-header-color: #5e5e5e;

$file-tree-font-color: #777777;

$svg-background-color: #ffffff;

@font-face {
  font-family: "Roboto Mono";
  src: url("../../assets/RobotoMono-Regular.ttf") format("truetype");
  font-weight: 300;
  font-style: normal;
}

.block-item {
  // display: block;
  display: flex;
  flex-direction: row;
  width: 100%;
  svg path {
    fill: lighten($block-icon-color, 5%);
    stroke-width: 0.15px;
    stroke: lighten($block-icon-color, 5%);
  }
}

.title-cont {
  margin-top: -4px;
}

.title {
  // font-family: "menlo", monospace;
  font-family: "Roboto Mono";
  font-weight: 800;
  color: darken($block-icon-text-color, 5%);
  font-size: 11.7px;
  user-select: none;
  padding-left: 5px;
  padding-right: 5px;
  padding-top: 3px;
  padding-bottom: 3px;
  border-radius: 4px;
  display: inline-block;
  user-select: none;
  flex-grow: 1;
  cursor: default;
  //   margin: auto;
}

.title-cont {
  margin-top: auto;
  margin-bottom: auto;
  margin-left: 5px;
}

.title.small {
  font-size: 10px;
  font-weight: 900;
}

.block-item:hover svg path {
  fill: $block-icon-hover-color;
}

.block-item:hover .title {
  color: darken($UI-font-color, 50%);
  background-color: $block-icon-text-background-color;
}
</style>