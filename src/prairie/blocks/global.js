const view = require('./blockViews.js')
const testView = require('./test/testBlocks.js')
const _ = require('underscore')
//DEV
const uuid = require('uuid/v4')
function createNode(type, name, value = NaN) {
    return {
        name: name,
        id: uuid(),
        value: value,
        type: type,
        connections: [],
        connected: false,
        ready: false
    }
}
////

var blocks = {
    function: {
        initialize_model: function (model, attr) {
            model.type = 'function'
        },
        blockView: function (attr) {
            return new view.FunctionBlockView(attr)
        },
    },

    input: {
        initialize_model: function (model, attr) {
            model.type = 'input'
            model.value = attr.value || '';
            _.each(model.nodes.in, function (node) { node.ready = true })
            _.each(model.nodes.in, function (node) { node.connected = true })
        },
        updateBlockModelFromBlockView: function (model, block_view) {
            model.value = block_view.getValue();
        },
        beforePrairieRun: function (model) {
            _.each(model.nodes.in, function (node) { node.ready = true })
        },
        blockView: function (attr) {
            return new view.CodeBlockView(attr)
        }
    },

    output: {
        initialize_model: function (model, attr) {
            model.type = 'output'
            model.value = attr.value || '';
            _.each(model.nodes.out, function (node) { node.connected = true })
        },
        updateBlockModelFromBlockView: function (model, block_view) {
            model.value = block_view.getValue();
        },
        blockWSMessageReceived: function (block_view, message) {
            block_view.setValue(message.value)
        },
        blockView: function (attr) {
            return new view.OutputCodeBlockView(attr)
        }
    },

    variable: {
        initialize_model: function (model, attr) {
            model.type = 'variable'
            model.value = attr.value || '';
            _.each(model.nodes.in, function (node) { node.ready = true })
            _.each(model.nodes.in, function (node) { node.connected = true })
        },
        updateBlockModelFromBlockView: function (model, block_view) {
            model.value = block_view.getValue();
        },
        beforePrairieRun: function (model) {
            _.each(model.nodes.in, function (node) { node.ready = true })
        },
        blockView: function (attr) {
            attr.solid_header = false;
            return new view.VariableBlockView(attr)
        }
    },

    plot: {
        initialize_model: function (model, attr) {
            model.type = 'plot'
            _.each(model.nodes.out, function (node) { node.connected = true })
        },
        blockWSMessageReceived: function (block_view, message) {
            block_view.plot(message.value.x, message.value.y)
        },
        blockView: function (attr) {
            return new view.PlotBlockView(attr)
        }
    },

    image: {
        initialize_model: function (model, attr) {
            model.type = 'image'
            _.each(model.nodes.out, function (node) { node.connected = true })
        },
        blockWSMessageReceived: function (block_view, message) {
            block_view.plot(message.value.d)
        },
        blockView: function (attr) {
            return new view.ImageBlockView(attr)
        }
    },

    code: {
        initialize_model: function (model, attr) {
            model.type = 'code'
            model.editable = true
            model.nodes = {
                'in': [
                    // createNode('in', 'a'),
                    // createNode('in', 'b'),
                    // createNode('in', 'c'),
                    // createNode('in', 'x'),
                ], 'out': [
                    createNode('out', 'x'),
                    // createNode('out', 'd'),
                ]
            }
        },
        updateBlockModelFromBlockView: function (model, block_view) {
            model.value = block_view.getValue();
        },
        // updateBlockModelFromBlockView: function (model, block_view) {
        //     model.server_model = {
        //         'in': [
        //             createNode('in', 'script', model.value),
        //             createNode('in', 'outputs', _.each(model.nodes.out, (node) => {
        //                 return node.name
        //             })),
        //             createNode('in', 'kwargs', model.value),
        //         ], 'out': [
        //             createNode('out', 'output'),
        //         ]
        //     }
        // },
        blockView: function (attr) {
            _.each([...attr.nodes.in, ...attr.nodes.out], (node) => {
                node.show_name = true
                node.editable = true
            })
            return new view.CodeCodeBlockView(attr)
        },
        updateBlockView: function (attr) {
            
        }
    },

    matrix: {
        initialize_model: function (model, attr) {
            model.type = 'matrix'
            model.value = attr.value || '';
            _.each(model.nodes.out, function (node) { node.connected = true })
        },
        updateBlockModelFromBlockView: function (model, block_view) {
            model.value = block_view.getValue();
        },
        blockWSMessageReceived: function (block_view, message) {
            block_view.setValue(message.value)
        },
        blockView: function (attr) {
            return new view.MatrixBlockView(attr)
        }
    },

    scan: {
        initialize_model: function (model, attr) {
            model.type = 'scan'
        },
        updateBlockModelFromBlockView: function (model, block_view) {
            model.value = block_view.getValue();
        },
        blockWSMessageReceived: function (block_view, message) {
            block_view.setValue()
        },
        blockView: function (attr) {
            return new testView.ScanBlock3D(attr)
        }
    }

    // static_code: {
    //     blockView: function () {
    //         attr.name = 'unnamed',
    //             attr.nodes = { 'in': {}, 'out': {} },
    //             attr.attr = {
    //                 value: '', x: 20, y: 60,
    //             }
    //         return view.OutputCodeBlockView(...attr)
    //     }
    // }
}

export {
    blocks
}
