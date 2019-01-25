const _ = require('underscore-plus')
const util = require('./util')

// TBDeleted
class FunctionBlockWebSocket {
  constructor(port, blockModel) {
    // if type of block is functional, we assign a webSocket to the block at the
    // following adress: ws://localhost:PORT/block_id
    this.ws = new WebSocket('ws://localhost:' + port + '/' + blockModel.id);
    this.model = blockModel;
    this.script_path = this.model.script;
    this.function_name = this.model.name;
    this.args = undefined;
    this.kwargs = undefined;
    this.inputs = undefined;
  }

  // TBDeleted
  updateModel(block_model) {
    this.model = block_model
  }

  // TBDeleted
  updateConnections(block_model, global_model_connections) {
    this.updateModel(block_model)
    let connections_id = _.flatten(_.map(this.model.nodes.out, (node) => {
      if (node.connections.length > 0) {
        return node.connections
      }
    }));

    let connections_list = _.map(connections_id, (connection) => {
      return global_model_connections[connection]
    })

    this.ws.send(JSON.stringify({
      header: 'update',
      id: this.model.id,
      connections: _.compact(connections_list),
      model: this.model
    }));
  }

  // TBDeleted
  run() {
    // this.updateModel();
    if (this.model.type === 'input') {
      // this.inputAssignment();
      // this.assignInput()
      // this.assignOutput() // TODO not don yet (stoped it the 14/09 at 22:48)
    }
    let inputs = _.pluck(this.model.nodes.in, 'id')
    let returns = _.pluck(this.model.nodes.out, 'id')

    this.ws.send(JSON.stringify({
      header: 'run',
      id: this.model.id,
      function_name: this.function_name,
      script_path: this.script_path,
      args: inputs || [],
      kwargs: this.kwargs || [],
      returns: returns
    }));
  }

  runDone() {
    console.log('done')
  }
}


// function PrairieWebSocket(port, id, controller) {
//   this.ws = new WebSocket('ws://localhost:' + port + '/' + id)
//   this.ws.model = id;
//   this.ws.controller = controller;
//   this.ws.current_WS_creation = undefined;
// }

// PrairieWebSocket.prototype.createBlockServerWS = (function (block_model) {
//   util.waitForSocketConnection(this, () => {
//     this.current_WS_creation = block_model
//     this.send(JSON.stringify({
//       header: 'create_WS',
//       id: block_model.id,
//       model: block_model
//     }));
//     this.controller.WScreation = this.current_WS_creation;
//   })
// }).bind(PrairieWebSocket.ws)

// PrairieWebSocket.prototype.updateServerModel = (function (model, model_connections) {
//   this.send(JSON.stringify({
//     header: 'update',
//     model: model,
//     model_connections: model_connections
//   }));
// }).bind(PrairieWebSocket.ws)


// function MyWebSocket(url) {
//      this.ws = new WebSocket(url);

// }

// MyWebSocket.prototype.test = (function() { 
//    // this = MyWebSocket.ws, i.e. a plain WebSocket obj
// }).bind(MyWebSocket.ws);


class PrairieWebSocket {
  constructor(port, id){
    // if type of block is functional, we assign a webSocket to the block at the
    // following adress: ws://localhost:PORT/block_id
    this.ws = new WebSocket('ws://localhost:' + port + '/' + id);
    this.model = id;
    this.current_WS_creation = undefined;
  }

  createBlockServerWS(block_model){
    util.waitForSocketConnection(this.ws, () => {
      this.current_WS_creation = block_model
      this.ws.send(JSON.stringify({
        header: 'create_WS',
        id: block_model.id,
        model: block_model
      }));
      return this.current_WS_creation;
    })
  }

  updateServerModel(model, model_connections){
    this.ws.send(JSON.stringify({
      header: 'update',
      model: model,
      model_connections: model_connections
    }));
  }
}

export { PrairieWebSocket, FunctionBlockWebSocket };
