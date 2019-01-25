const uuid = require('uuid/v4')
const _ = require('underscore')

function createNode(type, name, value = NaN) {
  return {
      name: name,
      id: uuid(),
      value: value,
      type: type,
      connections: [],
      connected: false,
      ready: false,
      editable: true,
      show_name: true
  }
}

const state = {
  selectedBlock: null,
  prairieEventHandler: 0,
  running: false,
  gui_editor_mode: false,
} 

const mutations = {
  blockSelected(state, block){
    state.selectedBlock = block
  },
  addNodeToSelectedBlock(state, type){
    if(state.selectedBlock){
      state.selectedBlock.nodes[type].push(createNode(type, 'unamed'))
      state.prairieEventHandler.dispatchEvent(new CustomEvent('updateEditableBlock', {detail: state.selectedBlock}))
    }
  },
  setPrairieEventHandler(state, handler){
    state.prairieEventHandler = handler
  },
  eventToPrairie(state, event){
    state.prairieEventHandler.dispatchEvent(new CustomEvent(event.name, {detail: event.data}))
  },
  updateEditableBlockNodeName(state, ModelAndName){
    state.selectedBlock.nodes[ModelAndName.model.type][ModelAndName.index].name = ModelAndName.name
    state.prairieEventHandler.dispatchEvent(new CustomEvent('updateEditableBlock', {detail: state.selectedBlock}))
  },
  closeWS(state, tab){
    state.prairieEventHandler.dispatchEvent(new Event('closeMainWS'))
  }
}

const actions = {
  blockSelected(context, block){
    context.commit('blockSelected', _.clone(block))
  },
  addNodeToSelectedBlock(context, type){
    context.commit('addNodeToSelectedBlock', type)
  },
  setPrairieEventHandler(context, handler){
    context.commit('setPrairieEventHandler', handler)
  },
  eventToPrairie(context, event){
    context.commit('eventToPrairie', event)
  },
  updateEditableBlockNodeName(context, ModelAndName){
    context.commit('updateEditableBlockNodeName', ModelAndName)
  },
  closeWS(context, tab){
    context.commit('closeWS', tab)
  }
}

export default {
  state,
  mutations,
  actions,
}
