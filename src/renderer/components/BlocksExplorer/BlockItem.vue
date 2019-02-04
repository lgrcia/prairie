<template>
  <div class="block-item" v-on:dragstart="dragstart" v-on:dblclick="dblclick">
    <img class="block-icon" :src="svgSource" ref="block-icon">
    <div class="title-cont">
      <div class="title" :class="{small: this.cName>1000}">{{cName}}</div>
    </div>
  </div>
</template>

<script>
const path = require("path");
const fs = require("fs");

export default {
  data() {
    return {
      spath: 0
    };
  },
  props: {
    name: String,
    path: String,
    icon_text: String
  },
  computed: {
    svgSource: function() {
      let svgPath_block = path.join(
        "src/blocks",
        path.basename(this.path, ".py"),
        "icons",
        this.cName + ".svg"
      );
      let svgPath_lib = path.join(
        "src/blocks",
        path.basename(this.path, ".py"),
        this.cName + ".svg"
      );
      if (fs.existsSync(svgPath_block)) {
        return svgPath_block;
      } else if (fs.existsSync(svgPath_lib)) {
        return svgPath_lib;
      } else {
        return "src/blocks/default.svg";
      }
    },
    svgPath: function() {
      let svgPath_block = path.join(
        "src/blocks",
        path.basename(this.path, ".py"),
        "icons",
        this.cName + ".svg"
      );
      let svgPath_lib = path.join(
        "src/blocks",
        path.basename(this.path, ".py"),
        this.cName + ".svg"
      );
      if (fs.existsSync(svgPath_block)) {
        return svgPath_block;
      } else if (fs.existsSync(svgPath_lib)) {
        return svgPath_lib;
      } else {
        return "src/blocks/default.svg";
      }
    },
    cName: function() {
      return this.name || path.basename(this.path);
    }
  },
  created: function() {
    let svgPath = path.join(
      path.dirname(this.path),
      "icons",
      this.cName + ".svg"
    );
    if (fs.existsSync(svgPath)) {
      this.spath = svgPath;
    } else {
      this.spath = "/Users/lgr/Code/prairie-vue/src/blocks/default.svg";
    }
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
            icon_svg_img: this.spath
          }
        })
      );
      var img = this.$refs["block-icon"];
      event.dataTransfer.setDragImage(img, 0, 0);
    },
    dblclick: function(event) {
      console.log('clicked')
      this.$store.dispatch("eventToPrairie", {
          name: "addBlockLeftTop",
          data: {
            type: this.title,
            model: {
              file_path: this.path,
              function_name: this.name,
              icon_svg_img: this.spath
            }
          }
        }
      );
    },
    getSource: function(path) {
      return require(path);
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
    stroke-width: 0px;
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

.block-item:hover .block-icon {
  opacity: 1;
}

.block-item:hover .title {
  color: darken($UI-font-color, 50%);
  background-color: $block-icon-text-background-color;
}

.block-icon {
  height: 34px;
  width: 34px;
  opacity: 0.7;
}
</style>