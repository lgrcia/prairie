const _ = require("underscore")

const state = {
  tabs: [],
  currentTab: {},
  tabsContent: {},
  menuCurrentButton: '',
  prairie_n: 0
}

const mutations = {
  addTab(state, newTab) {
    state.tabs.push(newTab)
    state.prairie_n = state.prairie_n + 1
  },
  setDisplayedContent(state, tab) {
    _.each(state.tabsContent, function(content, id) {
      let el = document.getElementById(id)
      if (el){  
        if (tab.name === id){
          el.style.display = "block"
        } else {
          el.style.display = "none"
        }
      } 
    })
  },
  setCurrentTab(state, currentTab) {
    state.currentTab = currentTab
  },
  removeTab(state, tab) {
    state.tabs.splice(state.tabs.indexOf(tab), 1);
  },
  addTabContent(state, content) {
    state.tabsContent[content.id] = content.tab_content
  },
  setMenuCurrentButton(state, button) {
    state.menuCurrentButton = button
  }
}

const actions = {
  someAsyncTask({ commit }) {
    // do something async
    // commit('INCREMENT_MAIN_COUNTER')
  },
  addTab(context, tabAndContent) {
    if (context.state.tabs.indexOf(tabAndContent.model) == -1) {
      context.commit('addTab', tabAndContent.model)
      if (tabAndContent.content){
        context.commit('addTabContent', {
          id: tabAndContent.model.name,
          tab_content: tabAndContent.content
        })
      }
    }
    context.commit('setCurrentTab', tabAndContent.model)
    context.commit('setDisplayedContent', tabAndContent.model)
  },
  setCurrentTab(context, tab) {
    context.commit('setCurrentTab', tab)
    context.commit('setDisplayedContent', tab)
  },
  removeTab(context, tab) {
    var tab_idx = context.state.tabs.indexOf(tab)
    var tabs_length = context.state.tabs.length
    context.commit('removeTab', tab)
    if (context.state.currentTab == tab) {
      if (tab_idx == tabs_length - 1) {
        context.commit('setCurrentTab', context.state.tabs[tab_idx - 1])
      } else if (tabs_length > 0) {
        context.commit('setCurrentTab', context.state.tabs[tab_idx])
      } else {
        context.commit('setCurrentTab', {})
      }
    }
    if (tabs_length === 1) {
      context.commit('setCurrentTab', {})
    }
  },
  setMenuCurrentButton(context, button){
    context.commit('setMenuCurrentButton', button)
  }
}

const getters = {
  currentTabContent: function(state){
    return 0
    // return state.tabsContent[state.currentTab.name]
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
