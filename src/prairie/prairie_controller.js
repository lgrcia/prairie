const uuid = require('uuid/v4')
const view = require('./blocks/blockViews')
const pythonParser = require('./python_parser')
const _ = require('underscore-plus')
const prairie = require('./prairie')
const util = require('./util')
const fs = require('fs')
const path = require('path')
const blockWS = require('./block_web_sockets')
const cp = require("child_process")
const blocks2 = require("./blocks/global")
const blocks = blocks2.blocks

const { remote } = require('electron')
const { Menu, MenuItem, dialog } = remote

class EventTarget {
  constructor() {
    this.target = document.createTextNode(null);
    this.addEventListener = this.target.addEventListener.bind(this.target);
    this.removeEventListener = this.target.removeEventListener.bind(this.target);
    this.dispatchEvent = this.target.dispatchEvent.bind(this.target);
  }
}

function apply(type, method, ...attr) {
  if (blocks[type]) {
    if (blocks[type][method]) {
      return blocks[type][method](...attr)
    } else if (blocks.function[method]) {
      return blocks.function[method](...attr)
    }
  } else if (blocks.function[method]) {
    return blocks.function[method](...attr)
  }
}

class PrairieController {
  constructor(view_id, name, i, model = undefined) {

    this.server_network = name + uuid()
    this.port = 12300 + i

    this.startServer()

    this.view = new prairie.Prairie(view_id, name);
    this.block_view_proxys = [];
    this.eventTarget = new EventTarget();
    this.webSockets = {};
    this.model = model;
    this.setup_model();

    this.controller_model = {
      selected_block: undefined
    }

    this.WScreation = undefined

    this.view.svg.on('connection-creation', (e) => { this.createConnection(e.detail) })

    this.view.eventTarget.addEventListener('node-catched', (e) => {
      this.removeConnection(this.getNodeModelbyId(
        e.detail.block_id,
        e.detail.node_id).connections[0])
    });

    this.view.eventTarget.addEventListener('block-creation', (e) => {
      console.log('block-created')
      this.addBlock(e.detail.type, e.detail.model)
    });

    this.view.svg.on('block-selected', (e) => {
      if (e.detail.block) {
        this.eventTarget.dispatchEvent(new CustomEvent('block-selected', { detail: this.getBlockModelById(e.detail.block.id) }))
      } else {
        this.eventTarget.dispatchEvent(new CustomEvent('block-selected', { detail: undefined }))
      }
    })

    this.view.eventTarget.addEventListener('addBlockInputOrOutput', (e) => {
      this.addBlockInputOrOutput(e.detail)
    })

    this.eventTarget.addEventListener('updateModelAndRun', () => {
      this.updateModelAndRun()
    })

    this.eventTarget.addEventListener('setGUIEditorMode', () => {
      this.setGUIEditorMode()
    })

    this.eventTarget.addEventListener('saveModel', (e) => {
      this.saveModel(e.detail.filename, e.detail.fpath)
    })

    this.eventTarget.addEventListener('addBlockLeftTop', (e) => {
      console.log('err')
      let data = e.detail
      data.model.model_view = {
        x: 10 + this.view.prairie_element.scrollLeft,
        y: 10 + this.view.prairie_element.scrollTop,
    }
      this.view.eventTarget.dispatchEvent(new CustomEvent('block-creation', {
        detail: {
          ...data
        }
      }))
    })

    this.eventTarget.addEventListener('updateBlockShapeAndNodes', (e) => {
    let block = this.getBlockViewById(e.detail.model.id)
    block.updateBlockShapeAndNodes(e.detail.model)
  })

this.eventTarget.addEventListener('updateEditableBlock', (e) => {
  this.updateEditableBlock(e.detail)
})

this.view.svg.on('openContextMenu', (e) => {
  this.openContextMenu(e.detail)
})

this.eventTarget.addEventListener('closeMainWS', (e) => {
  this.closeMainWS()
  this.view.svg.doc().remove()
})

this.eventTarget.addEventListener('zoom', (e) => {
  this.view.zoom(e.detail.factor)
})

  }

startServer(manual = false){

  if (!manual) {
    this.process = cp.spawn('pipenv', ['run', 'python', './main.py', this.server_network, this.port], { cwd: path.join(__dirname, 'backend') })
    console.log(this.process)

    this.process.on('error', (err) => {
      console.log('Failed to start subprocess.');
      console.log(err)
    });

    this.process.stdout.on('data', (data) => {
      // console.log("STDOUT:", data.toString());
      if (data.toString() === 'WS ' + this.server_network + ' ready\n') {
        console.log('JS: ' + data.toString());
        this.mainWS = new blockWS.PrairieWebSocket(this.port, this.server_network);
        this.mainWS.ws.onmessage = (event) => {
          this.mainWSMessageReceived(event)
        };
      }
    });
  } else {
    this.port = manual[0]
    this.server_network = manual[1]
    this.mainWS = new blockWS.PrairieWebSocket(this.port, this.server_network);
    this.mainWS.ws.onmessage = (event) => {
      this.mainWSMessageReceived(event)
    };
  }
}
// Global Model manipulation
//////////////////////////////////////////////////////////////////////////////

setup_model() {
  //set up a model if it does not exists
  if (this.model === undefined) {
    this.model = {
      model: {},
      model_view: {},
      model_connections: {},
    }
  }
}

addBlockFromModel(model, model_view) {
  this.createBlockViewfromModel(
    model, model_view);
}

addBlock(type, attr = {}) {
  let block_model = undefined;

  block_model = this.createBlockModelFromScript(attr.function_name || type, attr.file_path, attr)

  this.createBlockViewfromModel(
    block_model, {
      name: attr.name || attr.function_name,
      // svg_path: attr.svg_path,
      icon_text: attr.icon_text,
      ...attr.model_view
    });

  return block_model
}

saveModel(filename, fpath) {

  let save = () => {
    this.updateBlockModelsFromBlockViews();
    this.cleanModelView()
    // this.updateModelConnectionFromView();
    fs.writeFile(path.join(fpath, filename), JSON.stringify(this.model, null, 2), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
  }

  if (this.view._GUI_editor_mode) {
    this.setGUIEditorMode(save)
  } else {
    save()
  }

}

loadModel(fpath, callback) {
  this.waitForMainWS(() => {
    if (fpath === 'untitled.pr') {

    }
    ///
    else {
      fs.readFile(fpath, (err, data) => {
        if (err) throw err;
        this.model = JSON.parse(data)
        _.each(this.model.model, (value, key) => {
          let block_view = this.createBlockViewfromModel(
            value, this.model.model_view[key]);
        });
        _.each(this.model.model_connections, (value, key) => {
          this.createConnectionViewfromModel(key, value)
        });
        this.updateAllNodesStates()
        if (callback) { callback() }
      });
    }
  });
}

updateModelFromBlockModel(block_model) {
  // update the inner (global) model with the updated block model
  this.model.model[block_model.id] = block_model;
}

updateModelViewFromBlockView(block_view) {
  // update the inner (global) model view with the updated block view
  // View -> Controller -> Model
  this.model.model_view[block_view.id] = {
    name: block_view.raw_name(),
    x: block_view.editor_x || block_view.x(),
    y: block_view.editor_y || block_view.y(),
    shown_in_GUI_editor: block_view.shown_in_GUI_editor || false,
    GUI_editor_x: block_view.GUI_editor_x,
    GUI_editor_y: block_view.GUI_editor_y,
    icon_text: block_view.block.icon_text,
  };
  block_view.update()
}

removeBlock(id) {
  let connections = _.chain(this.model.model[id].nodes.in.concat(this.model.model[id].nodes.out))
    .map(function (node) { return node.connections })
    .flatten()
    .each((id) => { this.removeConnection(id) })
  this.removeBlockModel(id)
  this.view.removeBlock(id)
}

// Block Model maipulation
//////////////////////////////////////////////////////////////////////////////

removeBlockModel(id) {
  delete this.model.model[id]
}

createBlockModelFromScript(function_name, file_path, attr = {}) { //, standard_block = false, attr = {}) {
  /**
  * Create a blok model from any given python function
  *
  * @param {string} function_name name of the function which represents the blocks
  * @param {string} file_path path of the python module/file containing the function
  * @param {boolean} standard_block true if block is standard_block
  * @param {object} attr special attributes hold by the blocks
  * @returns {object} block model which represents the blocks
  */

  let python_prototype = _.findWhere(pythonParser.parse(file_path), { name: function_name })
  let model = {
    id: attr.id || uuid(),
    name: function_name,
    script: file_path,
    value: NaN,
    nodes: {
      in: _.map(python_prototype.parameters, function (e) {
        return {
          name: e,
          id: uuid(),
          value: NaN,
          type: 'in',
          connections: [],
          connected: false,
          ready: false
        }
      }),
      out: _.map(python_prototype.returns, function (e) {
        return {
          name: e,
          id: uuid(),
          value: NaN,
          type: 'out',
          connections: [],
          connected: false,
          ready: false
        }
      })
    },
    connected_in: false,
    connected_out: false,
  };

  apply(function_name, 'initialize_model', model, attr)

  return model;
}

getBlockModelById(id) {
  // returns the block model with the requested id
  return _.where(this.model.model, { id: id })[0];
}

updateBlockModelFromBlockView(block_view) {
  // update the inner (global) model with the updated block view
  // View -> Controller -> Model
  let model = this.model.model[block_view.id]
  // model.server_model = Object.assign({}, model.nodes)

  apply(model.type, 'updateBlockModelFromBlockView', model, block_view)
}

linkModeltoView(id) {
  // link the model and view of a block with the requested id
  let block_view = this.getBlockViewById(id)
  util.after(block_view.block, 'x', () => {
    this.updateModelViewFromBlockView(block_view)
  })
}

isBlockModelReadyAndConnected(id) {
  /**
  * Return (boolean) if a block (identified by its id) is ready and connected to be
  * run (i.e if all its input nodes are ready and all its output nodes are connected)
  *
  * @param {uuid} id id of the block to check
  * @returns {boolean} is block ready
  */

  let model = this.getBlockModelById(id);

  if (model.type === 'static_code') {
    return true;
  } else {
    return _.every(model.nodes.in, function (node) {
      return node.ready
    }) &&
      _.every(model.nodes.out, function (node) {
        return node.connected;
      })
  }
}

getBlockModelsReadyAndConnected() {
  /**
  * Get all the block models that are ready to be ran
  *
  * @returns {list(BlockView)} block models ready to be ran.
  */

  // we consider only input blocks
  let blocks = _.where(this.model, { type: 'input' }).concat(_.where(this.model, { type: 'variable' }))
  return _.filter(blocks, (block) => { this.isBlockModelReadyAndConnected(block) })
}

updateBlockModelsFromBlockViews() {
  _.each(this.view.blocks, (block_view) => {
    this.updateBlockModelFromBlockView(block_view);
    this.updateModelViewFromBlockView(block_view);
  });
}

cleanModelView() {
  _.each(this.model.model_view, (modelview, id) => {
    if (!(id in this.model.model)) {
      delete this.model.model_view[id]
    }
  })
}

getBlockModelsReady() {
  return _.filter(this.model.model, (block, id) => { return this.isBlockModelReadyAndConnected(id) })
}

updateEditableBlock(model) {
  this.updateModelFromBlockModel(model)
  let block_view = this.getBlockViewById(model.id)
  block_view.updateBlockShapeAndNodes(model)
}
// Block View manipulation
//////////////////////////////////////////////////////////////////////////////

createBlockViewfromModel(model, model_view) {
  // create a block view from a block model

  let block_view = apply(model.type, 'blockView', {
    id: model.id,
    name: model_view.name || 'unnamed',
    prairie: this.view,
    nodes: model.nodes,
    attr: {
      value: model.value || '',
      ...model_view, svg: document.getElementById('prairie')
    }
  })

  this.waitForMainWS(() => { this.WScreation = this.mainWS.createBlockServerWS(model) })
  this.view.blocks.push(block_view)
  this.updateModelFromBlockModel(model)
  this.updateModelViewFromBlockView(block_view)
  this.linkModeltoView(model.id)
}

getBlockViewById(id) {
  // returns the block view with the requested id
  return _.findWhere(this.view.blocks, { id: id });
}

// Node View manipulation
//////////////////////////////////////////////////////////////////////////////

getNodeViewbyId(id) {
  return _.findWhere(this.view.nodes, { id: id })
}

// Node Model manipulation
//////////////////////////////////////////////////////////////////////////////

getNodeModelbyId(block_id, node_id) {
  let model = this.getBlockModelById(block_id)
  return _.findWhere([...model.nodes.in, ...model.nodes.out], { id: node_id })
}

// Connection and connection states manipulations
//////////////////////////////////////////////////////////////////////////////

getConnectionViewById(id) {
  return _.findWhere(this.view.connections, { id: id });
}

getConnectionModelFromConnectionView(id) {

}

createConnection(connection) {
  let node_out = _.findWhere(
    this.model.model[connection.node_in.block.id].nodes[connection.node_in.type],
    { id: connection.node_in.id })

  let node_in = _.findWhere(
    this.model.model[connection.node_out.block.id].nodes[connection.node_out.type],
    { id: connection.node_out.id })

  if ((node_out.type === 'out' && node_in.type === 'in' && !(node_in.connected))) {
    if (!connection.id) {
      connection.id = uuid();
    }
    let block_in = connection.node_out.block.id
    let block_out = connection.node_in.block.id
    this.createConnectionModel(
      connection.id,
      connection.node_out.id,
      connection.node_in.id,
      block_in,
      block_out);
    this.createConnectionView(
      connection.id,
      connection.node_in,
      connection.node_out);
    let node_in_model = _.findWhere(
      this.model.model[block_in].nodes.in,
      { id: connection.node_out.id })
    // node_in_model.connected = true;
    node_in_model.connections.push(connection.id)
    let node_out_model = _.findWhere(
      this.model.model[block_out].nodes.out,
      { id: connection.node_in.id })
    // node_out_model.connected = true;
    node_out_model.connections.push(connection.id);
    this.updateBlockConnections(block_in);
    this.updateBlockConnections(block_out);
    this.updateNodesStateFromConnectionId(connection.id)
  }
}

updateBlockConnectionStates(id) {
  let model = this.getBlockModelById(id)
  _.each([...model.nodes.in, ...model.nodes.out], (node) => {
    node.connected = (node.connections.length > 0)
  })
  model.connected_in = _.every(model.nodes.in, (node) => {
    return node.connected
  })
  model.connected_out = _.every(model.nodes.out, (node) => {
    return node.connected
  })
}

createConnectionView(id, node_in, node_out) {
  var new_connection = new prairie.ConnectionView(this.view.svg, node_out, node_in, id);
  node_in.block.connections.push(new_connection);
  node_out.block.connections.push(new_connection);
  this.view.connections.push(new_connection);
  new_connection.update_from_nodes();
}

createConnectionModel(id, node_in, node_out, block_in, block_out) {
  this.model.model_connections[id] = {
    block_in: block_in,
    node_in: node_in,
    node_out: node_out,
    block_out: block_out,
  }
}

createConnectionViewfromModel(id, connection_model) {
  let node_in = this.getNodeViewbyId(
    connection_model.node_in
  )
  let node_out = this.getNodeViewbyId(
    connection_model.node_out
  )
  this.createConnectionView(id, node_in, node_out)
}

updateBlockConnections(id) {
  this.updateBlockConnectionStates(id);
}

updateNodesStateFromConnectionId(connection_id) {
  let connection = this.model.model_connections[connection_id]
  let node_in_model = this.getNodeModelbyId(connection.block_in, connection.node_in)
  let node_out_model = this.getNodeModelbyId(connection.block_out, connection.node_out)
  let node_in_view = this.getNodeViewbyId(connection.node_in)
  let node_out_view = this.getNodeViewbyId(connection.node_out)
  node_in_view.set_connected(node_in_model.connections.length > 0)
  node_out_view.set_connected(node_out_model.connections.length > 0)
  if (node_out_view.block instanceof view.VariableBlockView) {
    if (node_out_view.block.rename_when_connect) {
      node_out_view.block.rename(node_in_view.name)
    }
  }
}

updateAllNodesStates() {
  _.each(this.model.model_connections, (connection, id) => {
    this.updateNodesStateFromConnectionId(id)
  })
}

updateAllBlocksConnectionsAndNodesStates() {
  _.each(this.model.model, (value, key) => {
    this.updateBlockConnections(key)
  })
}

removeConnection(id) {
  let connection_view = this.getConnectionViewById(id)
  connection_view.remove()
  this.view.connections = _.without(this.view.connections, connection_view)

  let connection = this.model.model_connections[id]
  let node_in = this.getNodeModelbyId(connection.block_in, connection.node_in)
  let node_out = this.getNodeModelbyId(connection.block_out, connection.node_out)
  node_in.connections = _.without(node_in.connections, id);
  node_out.connections = _.without(node_out.connections, id);
  delete this.model.model_connections[id];

  this.updateBlockConnectionStates(connection.block_in)
  this.updateBlockConnectionStates(connection.block_out)

  this.view._last_item_clicked = this.getNodeViewbyId(connection.node_out)
  let node_in_view = this.getNodeViewbyId(connection.node_in)
  node_in_view.set_connected(false)

  if (!node_out.connected) {
    this.view._last_item_clicked.set_connected(false)
  }
}

// Block running
//////////////////////////////////////////////////////////////////////////////

runBlockModelById(id) {
  if (this.isBlockModelReadyAndConnected(id)) {
    this.webSockets[id].run()
  }
}

updateModelAndRun() {
  /**
   * Update the model before running. Update consists of: 
   *  1- initialization of input to ready mode (nodes in)
   *  2- get values from widgets and update the model
   *  3- inject the model values into the server model
   *  (server side) - when update is done 'run_ready' message is sent back from the server, 
   *  hence running runModel() (see )
   */

  this.resetInputsReadyState();
  this.updateBlockModelsFromBlockViews();
  this.updateServerModel()
}

runModel() {
  /**
  * Run the model
  */
  //  this.runBlockModelById(this.static_code_id)
  console.log('model starts running');
  _.each(this.model.model, (block) => { this.runBlockModelById(block.id) })
}

// WS manipulation
//////////////////////////////////////////////////////////////////////////////

closeMainWS(){
  this.mainWS.ws.close()
}

getNetwork() {
  return this.webSockets;
}

mainWSMessageReceived(event) {
  let message = JSON.parse(event.data)
  switch (message.header) {
    case 'BlockClientWS_creation':
      let model = this.getBlockModelById(message.id)
      this.webSockets[model.id] = new blockWS.FunctionBlockWebSocket(
        this.port, model);
      this.webSockets[model.id].ws.onmessage = (event) => this.blockWSMessageReceived(event)
      break;
    case 'update_done_run_model':
      this.runModel()
      break;
  }
}

blockWSMessageReceived(event) {
  let message = JSON.parse(event.data)
  console.log('SERVERCOM: ' + message.header);
  switch (message.header) {
    case 'run_started':
      break;
    case 'run_done':
      // console.log(message.id + ' done');
      let model = this.getBlockModelById(message.id)
      let block_view = this.getBlockViewById(model.id)
      block_view.has_error(false)
      this.model.model[message.id].error_message = undefined
      apply(model.type, 'blockWSMessageReceived', block_view, message)
      break;
    case 'run_error':
      {
        // console.log('backend ERROR!')
        let block_view = this.getBlockViewById(message.id)
        this.model.model[message.id].error_message = message.error_message
        block_view.has_error(true)
        console.log(message.error_message)
      }
      break;
    // case 'update_done_run_model':
    //   this.runModel()
    //   break;
  }
}

// TBDeleted
updateAllSeverBlockConnections() {
  _.each(this.model.model, (block, id) => {
    this.webSockets[id].updateConnections(block, this.model.model_connections)
  })
}

updateServerModel() {
  this.mainWS.updateServerModel(this.model.model, this.model.model_connections)
}

resetInputsReadyState() {
  _.each(this.model.model, (model, id) => {
    apply(model.type, 'beforePrairieRun', model)
  })
}

waitForMainWS(callback) {
  setTimeout(
    () => {
      if (this.mainWS) {
        if (this.mainWS.ws) {
          if (this.mainWS.ws.readyState === 1) {
            if (callback != null) {
              callback();
            }
            return;
          } else {
            console.log("wait for connection...")
            this.waitForMainWS(callback);
          }

        }
      } else {
        console.log("wait for connection...")
        this.waitForMainWS(callback);
      }
    }, 1000);
}

// GUI editor
//////////////////////////////////////////////////////////////////////////////

setGUIEditorMode(callback) {
  this.view._GUI_editor_mode = !this.view._GUI_editor_mode
  this.view.setGUIEditorMode(this.view._GUI_editor_mode, callback)

}

addBlockInputOrOutput(nodeView) {
  let model_view = {
    x: nodeView.prairieX() + (nodeView.type == 'in' ? - 120 : 50),
    y: nodeView.block.block.block_group.y()//nodeView.block.block.block_group.height()
  }
  let new_block = this.addBlock(nodeView.type == 'in' ? 'input' : 'output', {
    file_path: '/Users/lgr/Code/prairie-vue/src/blocks/basics/basics.py',
    model_view: model_view
  })
  this.createConnection({
    node_in: (new_block.type == 'output' ? nodeView : this.getBlockViewById(new_block.id).nodes[0]),
    node_out: (new_block.type == 'input' ? nodeView : this.getBlockViewById(new_block.id).nodes[0])
  })
}

openContextMenu(blockView) {
  let menu = new Menu()
  menu.append(new MenuItem({
    label: 'delete',
    click: () => {
      this.removeBlock(blockView.id)
    }
  }))
  menu.append(new MenuItem({
    label: 'show in GUI',
    type: 'checkbox',
    checked: blockView.shown_in_GUI_editor,
    click: (item, window) => {
      blockView.shown_in_GUI_editor = !blockView.shown_in_GUI_editor
      item.checked = blockView.shown_in_GUI_editor
      if (this.view._GUI_editor_mode && !blockView.shown_in_GUI_editor) {
        blockView.hide()
      }
    }
  }))
  menu.append(new MenuItem({
    label: 'edit nodes',
    click: () => {
      this.view.block_dblclicked(blockView)
    }
  }))
  menu.popup(remote.getCurrentWindow())
}

}

export { PrairieController }
