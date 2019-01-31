const SVG = require('svg.js')
const _ = require('underscore-plus')
require('./lib/svg.draggable.js')
require('./lib/svg.foreignobject.js')
require('./lib/svg.panzoom.js')
require('./lib/svg.filter.js')

const blocks = require('./blocks/blockViews')

const BLUEPRINT_BACKGROUND_OFFSET = 20;
const BLUEPRINT_TEXT_H_MARGIN = 40;
const BLUEPRINT_TEXT_V_MARGIN = 0;

class EventTarget {
  constructor() {
    this.target = document.createTextNode(null);
    this.addEventListener = this.target.addEventListener.bind(this.target);
    this.removeEventListener = this.target.removeEventListener.bind(this.target);
    this.dispatchEvent = this.target.dispatchEvent.bind(this.target);
  }
}

var connectionDoneEvent = new Event('connection_done');

class ConnectionView {
  constructor(prairie, node_out, node_in = undefined, id = 0, style = "connection") {

    this.prairie = prairie,
      this.id = id,
      this.connection = this.prairie.polyline([]).attr({
        class: style
      });
    this.connection.back()
    this.node_in = node_in
    this.node_out = node_out
    this.connected = false
    this.dim = false
  }

  update_from_nodes() {
    //node out group position
    let g_out_x = this.node_out.block.block.block_group.x()
    let g_out_y = this.node_out.block.block.block_group.y()
    // node in group position
    let g_in_x = this.node_in.block.block.block_group.x()
    let g_in_y = this.node_in.block.block.block_group.y()

    // node out center position
    let center_out_x = g_out_x + this.node_out.node_group.x() + this.node_out.node.x() + this.node_out.height() / 2
    let center_out_y = g_out_y + this.node_out.node_group.y() + this.node_out.node.y() + this.node_out.height() / 2
    //node in center position
    let center_in_x = g_in_x + this.node_in.node_group.x() + this.node_in.node.x() + this.node_in.width() / 2
    let center_in_y = g_in_y + this.node_in.node_group.y() + this.node_in.node.y() + this.node_in.width() / 2

    let x1 = center_out_x + (center_in_x - center_out_x) / 2

    this.connection.plot([
      center_out_x, center_out_y,
      x1, center_out_y,
      x1, center_in_y,
      center_in_x, center_in_y])
  }

  update_from_event(event) {
    let gx = this.node_out.block.block.block_group.x()
    let gy = this.node_out.block.block.block_group.y()

    // mouse position
    let prairie_global = this.prairie.rbox()
    let x = event.clientX - prairie_global.x;
    let y = event.clientY - prairie_global.y;

    let x0 = gx + this.node_out.node.x() + this.node_out.node.width() / 2
    let x1 = x0 + (x - x0) / 2
    let y0 = gy + this.node_out.node.y() + this.node_out.node.height() / 2

    this.connection.plot([
      x0, y0,
      x1, y0,
      x1, y,
      x, y])
  }

  remove() {
    if (!this.connected) {
      this.connection.remove()
    }
  }

  hide() {
    this.connection.hide()
    // this.connection.animate(400, '<>').attr({'opacity': 0}).afterAll(() => this.connection.hide())
  }

  show() {
    this.connection.show()
    // this.connection.animate(400, '<>').attr({'opacity': 1}).afterAll(() => this.connection.show())
  }

  setDim(bool) {
    this.dim = bool;
    if (bool) {
      this.connection.removeClass('unselected')
      this.connection.addClass('selected')
    }
    else {
      this.connection.removeClass('selected')
      this.connection.addClass('unselected')
    }
  }
}

class Prairie {
  constructor(id, name) {
    this.svg = SVG(id).size(3000, 3000).attr({ id: name })//.panZoom({zoomMin: 0.2, zoomMax: 1});

    this.eventTarget = new EventTarget();

    this.offsetTop = document.getElementById(id).offsetTop
    this.offsetLeft = document.getElementById(id).offsetLeft

    this.prairie_element = document.getElementById(id)
    this.prairie_element.style.position = 'relative'

    this.current_zoom = 1
    this.min_zoom = 0.65
    this.max_zoom = 1

    this.prairie_element.style.zoom = this.zoom

    this.prairie_element.addEventListener('scroll', () => {
      this.offsetTop = this.prairie_element.offsetTop - this.prairie_element.scrollTop
      this.offsetLeft = this.prairie_element.offsetLeft - this.prairie_element.scrollLeft
    })

    this.name = name || 'untitled.pr'

    this.blueprint = this.svg.group()

    this.drawBlueprint();

    this._connection_creation_mode = false;
    this._snapping = false;
    this._resizing_mode = false;
    this._edit_mode = true;
    this._wheel_busy = false;

    this._GUI_editor_mode = false;
    this._editor_mode_changing = false;

    this.navigation_mode = false;
    this.multiple_selection_mode = false;

    this._last_item_clicked = undefined;
    this._connection_preview = undefined;
    this._block_preview = undefined;
    this.blocks = []
    this.nodes = []
    this.connections = []

    this.prairie_element.addEventListener('mouseup', () => this.mouse_up());
    this.prairie_element.addEventListener('mousemove', event => this.mouse_move(event));

    this.prairie_element.addEventListener('dragover', (event) => {
      event.preventDefault()
    })

    this.prairie_element.addEventListener('drop', (event) => {
      console.log('drop')
      let data = JSON.parse(event.dataTransfer.getData("text"));
      data.model.model_view = {
        x: event.clientX - this.offsetLeft,
        y: event.clientY - this.offsetTop,
      }
      this.eventTarget.dispatchEvent(new CustomEvent('block-creation', {
        detail: {
          ...data
        }
      }))
    })

    this.prairie_element.addEventListener('wheel', (e) => {
      e.preventDefault()
      this.prairie_element.scrollTop += e.deltaY
      this.prairie_element.scrollLeft += e.deltaX

    })


    // this.prairie.on('zoom', () => {
    //   for (let block of this.getWidgetBlocks()){
    //     block.setTransformation(this.prairie.zoom())
    //   };
    // })

    // this.prairie.on('connection', function(){console.log('salut');})

    // this.all_blocks_draggable(false);

    //   this.static_code_editor = undefined
    //   new blocks.StaticCodeBlockView({
    //     id: 'static-code',
    //     name: 'unnamed',
    //     prairie: this,
    //     nodes: {'in': {}, 'out': {}},
    //     attr: { 
    //       value: '', x:20, y:60}
    //   })
  }

  drawBlueprint() {
    let blueprint_background = this.svg.rect(
      this.svg.width() - 2 * BLUEPRINT_BACKGROUND_OFFSET,
      this.svg.height() - 2 * BLUEPRINT_BACKGROUND_OFFSET).attr({
        class: "blueprint-frame-normal"
      });

    let blueprint_file_name = this.svg.text(this.name.toUpperCase()).attr({
      class: "blueprint-text"
    })
    let blueprint_file_name_frame = this.svg.rect(
      blueprint_file_name.bbox().width + 2 * BLUEPRINT_TEXT_H_MARGIN,
      blueprint_file_name.bbox().height + 2 * BLUEPRINT_TEXT_V_MARGIN,
    ).attr({
      class: "blueprint-frame-normal"
    });

    // let includes = this.prairie.text(function(add) {
    //   add.tspan('import numpy as np'.toUpperCase()).newLine()
    //   add.tspan('import pandas'.toUpperCase()).newLine()
    //   add.tspan('import os'.toUpperCase()).newLine()
    // }).attr({
    //   class: "blueprint-text-small"})
    // includes.move(BLUEPRINT_TEXT_V_MARGIN, blueprint_file_name_frame.height())

    this.blueprint.add(blueprint_background)
    this.blueprint.add(blueprint_file_name_frame)
    this.blueprint.add(blueprint_file_name)
    blueprint_file_name.move(BLUEPRINT_TEXT_H_MARGIN, BLUEPRINT_TEXT_V_MARGIN)
    // this.blueprint.add(includes)
    this.blueprint.move(BLUEPRINT_BACKGROUND_OFFSET, BLUEPRINT_BACKGROUND_OFFSET);
  }

  all_blocks_draggable(bool) {
    for (let blockview of this.blocks) {
      blockview.block.block_group.draggable(bool)
    }
  }

  node_mouse_down(node) {
    this._last_item_clicked = node;
    // MODIFIYNG
    this._connection_creation_mode = true;
    if (node.type === 'in') {
      this.eventTarget.dispatchEvent(new CustomEvent('node-catched', {
        detail: {
          block_id: node.block.id,
          node_id: node.id
        }
      }))
    }

    this.all_blocks_draggable(false);
    this.draw_connection_preview();
  }

  zoom(factor = undefined) {
    if (this.current_zoom === 1) {
      this.current_zoom = this.min_zoom
    } else {
      this.current_zoom = 1
    }

    this.prairie_element.style.zoom = this.current_zoom
  }

  node_mouse_up(node) {
    if (this._last_item_clicked instanceof blocks.NodeView && node instanceof blocks.NodeView) {
      this.svg.fire('connection-creation', {
        node_in: this._last_item_clicked,
        node_out: node,
      });
    }

    this.undraw_connection_preview()
    this._connection_creation_mode = false;
  }

  mouse_up() {
    if (this._snapping) {
      this.node_mouse_up(this._snapping)
    }
    this._snapping = undefined
    this.undraw_connection_preview()
    this._connection_creation_mode = false;
    this.all_blocks_draggable(true);
    this._resizing_mode = false;
    this.unselectAllBlocks(false)
    this.dimAllConnections(false)
    this.svg.fire('block-selected', { block: undefined })

    if (this._last_item_clicked instanceof blocks.WidgetBlockView) {
      this._last_item_clicked.update_fobj_position()
      this._last_item_clicked.update_connections()
      this._last_item_clicked = undefined;
    }
  }

  block_dblclicked(block) {
    this.unselectAllBlocks()
    this.dimAllConnections()
    block.setSelected(true)
    this.svg.fire('block-selected', { block: block })
  }

  unselectAllBlocks(bool = true) {
    for (let block of this.blocks) {
      block.setSelected(!bool)
    }
    // this.svg.fire('block-selected', undefined)
  }

  dimAllConnections(bool = true) {
    for (let connection of this.connections) {
      connection.setDim(!bool)
    }
  }

  mouse_move(event) {
    event.preventDefault()
    if (this._connection_creation_mode) {
      this._snapping = this.getClosestNode(event);
      if (this._snapping) {
        this._connection_preview.node_in = this._snapping;
        this._connection_preview.update_from_nodes(event);
      }
      else {
        this._connection_preview.update_from_event(event);
      }
    }
    if (this._last_item_clicked instanceof blocks.BlockView) {
      this._last_item_clicked.update();
    }
  }

  draw_connection_preview() {
    this._connection_preview = new ConnectionView(
      this.svg,
      this._last_item_clicked)
  }

  undraw_connection_preview() {
    if (this._connection_preview instanceof ConnectionView) {
      this._connection_preview.remove()
      this._connection_preview = undefined
    }
  }

  block_mouse_down(block) {
    if (!this._connection_creation_mode) {
      this._last_item_clicked = block;
      this._last_item_clicked.blockshape_group.draggable()
    }
  }

  // blocktool_mouse_down(tool) {
  //   if (tool.type == 'resize') {
  //     this.all_blocks_draggable(false);
  //     this._resizing_mode = true
  //     this._last_item_clicked = tool
  //   }
  // }

  getClosestNode(e, radius = 40) {
    // TODO: optimize
    function distance(e, node, offset_x, offset_y) {
      let x = (e.clientX - offset_x) - node.prairieX()
      let y = (e.clientY - offset_y) - node.prairieY()
      return Math.sqrt(x * x + y * y)
    }

    let closestNode = _.sortBy(this.nodes, (node) => { return distance(e, node, this.offsetLeft, this.offsetTop) })[0]

    if (distance(e, closestNode, this.offsetLeft, this.offsetTop) < radius) {
      return closestNode;
    }
    else {
      return undefined;
    }
  }

  getWidgetBlocks() {
    return _.filter(this.blocks, function (block) { return block instanceof blocks.WidgetBlockView })
  }

  setGUIEditorMode(bool, callback = function () { }) {
    if (bool) {
      _.each(this.blocks, (block) => {
        if (!block.shown_in_GUI_editor) {
          block.hide()
        }
      })
      _.each(this.connections, (connection) => {
        connection.hide()
      })
      // this.static_code_editor.hide()
      this.animateBlockToGUIEditorPositions(callback)
    } else {
      this.animateBlockToEditorPositions(callback)
    }
  }

  animateBlockToGUIEditorPositions(callback = function () { }) {
    this._editor_mode_changing = true
    _.each(this.blocks, (block) => {
      if (block.shown_in_GUI_editor) {
        if (!block.GUI_editor_x && !block.GUI_editor_y) {
          block.GUI_editor_x = block.block.block_group.x()
          block.GUI_editor_y = block.block.block_group.y()
        }
        block.editor_x = block.block.block_group.x()
        block.editor_y = block.block.block_group.y()
        block.block.block_group.animate(300, '<>').move(block.GUI_editor_x, block.GUI_editor_y).during(() => { block.update() }).afterAll(() => { block.update() }).afterAll(() => {
          this._editor_mode_changing = false
          callback()
        })
      }
    })
  }

  animateBlockToEditorPositions(callback = function () { }) {
    this._editor_mode_changing = true
    _.each(this.blocks, (block) => {
      if (block.shown_in_GUI_editor) {
        if (!block.editor_x && !block.editor_y) {
          block.editor_x = block.block.block_group.x()
          block.editor_y = block.block.block_group.y()
        }
        block.GUI_editor_x = block.block.block_group.x()
        block.GUI_editor_y = block.block.block_group.y()
        block.block.block_group.animate(300, '<>').move(block.editor_x, block.editor_y).during(() => { block.update() }).afterAll(() => {
          block.update()
        }).afterAll(() => {
          _.each(this.connections, (connection) => {
            connection.show()
          })
        }).afterAll(() => {
          _.each(this.blocks, (block) => {
            block.show()
          })
        }).afterAll(() => {
          this._editor_mode_changing = false
          callback()
          //   this.static_code_editor.show()})
        })
      }
    })
  }

  updateAllWidgets() {
    _.each(this.blocks, (block) => {
      if (!(block instanceof blocks.WidgetBlockView)) {
        block.update()
      }
    })
  }

  addBlockInputOrOutput(node) {
    this.svg.fire('addBlockInputOrOutput', node)
  }

  openContextMenu(blockView) {
    this.svg.fire('openContextMenu', blockView)
  }

  removeBlock(id) {
    let blockView = _.findWhere(this.blocks, { id: id })
    blockView.block.block_group.remove()
    if (blockView.fobj) { blockView.fobj.remove() }
    this.blocks = _.without(this.blocks, blockView)
    _.each(blockView.nodes, (node) => {
      this.nodes = _.without(this.nodes, node)
    })
    // delete blockView
  }

}

export {
  Prairie,
  ConnectionView
}
