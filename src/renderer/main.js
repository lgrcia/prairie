import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import { PrairieController } from "../prairie/prairie_controller.js";
import { WidgetHtmlBlockView } from "../prairie/blocks/blockViews";

// Building vue instance
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
var v = new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')


// Building app Menu
const {remote} = require('electron')
const {Menu, dialog} = remote

const template = [
  {
    label: 'Prairie',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { role: 'reload' }
    ]
  },
  {
    label: 'File',
    submenu: [
      {
        label: 'New File',
        accelerator: 'Cmd+N'
      },
      {
        label: 'New Diagram',
        accelerator: 'Cmd+Shift+D', 
        click() {
          v.$store.dispatch("addTab", {
            model: {
              name: "unnamed.pr",
              open: false,
              saved: false,
              extension: "pr",
              path: "unnamed.pr"
            }
          });
    
          var prairie_ctr = new PrairieController("prairie", "unnamed.pr", store.state.Tabs.prairie_n);
          v.$store.dispatch(
            "setPrairieEventHandler",
            prairie_ctr.eventTarget,
          );
          
          // let f = new WidgetHtmlBlockView({
          //   id:'test-html-block', 
          //   name:'test', 
          //   prairie:prairie_ctr.view,
          //   shape_options : {
          //     svg: prairie_ctr.view.svg,
          //     nodes_in: 1,
          //     nodes_out: 1,
          //     name: name,
          //     header: false,
          //     style: 'input-block',
          //     x: 300,
          //     y:200,
          //   }
          // })
        }
      },

      { type: 'separator' },
      { 
        label: 'Open File',
        accelerator: 'Cmd+O',
        click () {}
      },
      {
        label: 'Save file',
        accelerator: 'Cmd+s',
        id: 'savefile',
        click() {
          let tab = tab_container.tabBar.getActiveTab()
          if (fs.existsSync(tab.path)){
            tab_container.getController(tab.id).saveModel(path.basename(tab.path), path.dirname(tab.path))
          } else {
            fpath = dialog.showSaveDialog({title: 'Save file'})
            if (fpath){
              tab_container.getController(tab.id).saveModel(path.basename(fpath), path.dirname(fpath))
              tab.setTitle(path.basename(fpath))
              tab.path = fpath
            }

          }
        }
      },
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Learn more',
        click() { require('electron').shell.openExternal('https://github.com/LionelGarcia/Prairie') }
      },
      { role: 'toggledevtools' },
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)



