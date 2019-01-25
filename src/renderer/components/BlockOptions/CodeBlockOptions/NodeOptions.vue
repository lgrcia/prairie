<template>
  <div class="node-options">
    <div class="name">
      <div class="node"></div>
      <input
        class="name-input"
        ref="valueInput"
        :value="nodeModel.name.replace(' ', '')"
        type="text"
        readonly="true"
        v-on:dblclick="setValueReadOnly(false)"
        v-on:blur="setValueReadOnly(true)"
      >
    </div>
    <div class="tools">
      <!-- <div class="edit tool" v-on:click="setValueReadOnly(true)"></div> -->
      <div class="delete tool" v-if="nodeModel.editable"></div>
      <div></div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["nodeModel", "index"],
  methods: {
    setValueReadOnly: function(bool) {
      this.$refs["valueInput"].readOnly = bool;
      if (bool) {
        this.$store.dispatch("updateEditableBlockNodeName", {
          index: this.index,
          model: this.nodeModel,
          name: this.$refs["valueInput"].value
        });

        // this.$store.dispatch("eventToPrairie", {
        //   name: "updateEditableBlock",
        //   data: this.$store.state.PrairieUI.selectedBlock
        // });
        //Update model in PrairieUI (that will itself update the vue thing)
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@font-face {
  font-family: "octicons730";
  src: url("../../../assets/octicons730.ttf");
}
.node-options {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.node::before {
  font-family: "octicons730";
  color: silver;
  opacity: 0.8;
  font-size: 14px;
  content: "\e97c";
  //   content: "\e979";
}

.node {
  line-height: 18px;
  vertical-align: top;
  margin-right: 7px;
  margin-left: 8px;
}

input[type="text"] {
  background: none;
  border: none;
  font-family: system-ui;
  font-size: 12px;
  color: darken(grey, 20%);
  line-height: 4px;
}
input[type="text"]:focus {
  outline: none;
}

.tools {
  height: 15px;
}

.tool {
  display: inline-block;
}

.name {
  display: flex;
  flex-direction: row;
}

.tool::before {
  font-family: "octicons730";
  color: silver;
  opacity: 0.5;
  font-size: 12px;
}

.tool.edit::before {
  content: "\e976";
}

.tool.delete::before {
  content: "\e9af";
  font-size: 12px;
}
</style>