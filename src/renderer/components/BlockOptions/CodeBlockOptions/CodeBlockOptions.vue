<template>
  <div>
    <div class="header">
      <div class="title">inputs</div>
      <div class="add button" v-on:click="addNode('in')" v-if="blockModel.editable"></div>
    </div>
    <node-options
      v-for="(node, i) in blockModel.nodes.in"
      :key="node.id"
      :index="i"
      :nodeModel="node"
    ></node-options>
    <div class="header">
      <div class="title">outputs</div>
      <div class="add button" v-on:click="addNode('out')" v-if="blockModel.editable"></div>
    </div>
    <node-options
      v-for="(node, i) in blockModel.nodes.out"
      :key="node.id"
      :index="i"
      :nodeModel="node"
    ></node-options>
    <div class="header" v-if="blockModel.error_message">
      <div class="title">ERROR</div>
    </div>
    <div class="error" v-if="blockModel.error_message">{{blockModel.error_message}}</div>
  </div>
</template>

<script>
import NodeOptions from "./NodeOptions.vue";
export default {
  components: {
    NodeOptions
  },
  computed: {
    blockModel: function() {
      return this.$store.state.PrairieUI.selectedBlock;
    }
  },
  methods: {
    addNode: function(type) {
      this.$store.dispatch("addNodeToSelectedBlock", type);
    }
  }
};
</script>

<style lang="scss" scoped>
@font-face {
  font-family: "octicons730";
  src: url("../../../assets/octicons730.ttf");
}

$UI-font-color: rgb(40, 40, 40);

.title {
  font-family: system-ui;
  color: $UI-font-color;
  font-weight: 600;
  font-size: 10px;
  text-transform: uppercase;
}

.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  align-content: center;
  margin-bottom: 4px;
}

.button {
  height: 12px;
}

.button::before {
  font-family: "octicons730";
  color: $UI-font-color;
  font-size: 11px;
  vertical-align: top;
}

.button.add::before {
  content: "\e97b";
}

// .header:not(:first-of-type) {
//   margin-top: 7px;
// }

.header {
  margin-top: 7px;
}

.error {
  padding: 5px;
  font-family: menlo;
  font-weight: 600;
  font-size: 10px;
  background-color: rgb(31, 31, 31);
  border-radius: 3px;
  color:rgb(228, 117, 97);
}
</style>