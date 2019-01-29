import { walkDir, buildDir, findDeep } from '../../../scripts/utils.js'
import { parse } from '../../../prairie/python_parser.js'
const _ = require('underscore')

// write mthods to fille an object like :
// {path1 : {path1.1: {name:, path:, open:, type:,}}
const state = {
  base: './src',
  tree: buildDir('/Users/lgr/Code/prairie-vue')
}

const mutations = {
  setOpen(state, path) {
    findDeep(state.tree, 'path', path)[0].open = true
  },
  setClose(state, path) {
    findDeep(state.tree, 'path', path)[0].open = false
  },
  appendPath(state, path) {
    var found = findDeep(state.tree, 'path', path.path)[0]
    if (!found.children) {
      if (path.type === 'py') {
        found.children = _.object(_.map(parse(path.path), (f) => {
          return [f.name, {
            name: f.name,
            extension: undefined,
            open: false,
            saved: false,
            type: "function",
            path: path.path
          }]
        }))
    } else {
      found.children = walkDir(path.path)
    }
  }
},
  setBase(state, base){
    state.tree = buildDir(base)
  }
}

const actions = {
  someAsyncTask({ commit }) {
    // do something async
    commit('INCREMENT_MAIN_COUNTER')
  },
  setOpen(context, path) {
    context.commit('setOpen', path)
  },
  setClose(context, path) {
    context.commit('setClose', path)
  },
  appendPath(context, path) {
    context.commit('appendPath', path)
  },
  setBase(context, base) {
    context.commit('setBase', base)
  }
}

export default {
  state,
  mutations,
  actions
}
