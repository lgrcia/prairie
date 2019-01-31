const _ = require('underscore-plus')
const shapes = require('./shapes.js')
const htmlShapes = require('./htmlShapes.js')


const plotly = require('plotly.js-dist')
const CodeMirror = require('CodeMirror')
const syntaxer = require("../lib/codemirror_python.js")
const katex = require('katex');

syntaxer.python_syntax(CodeMirror)

class NodeView {
  constructor(block, attrs, prairie) {
    this.attrs = attrs
    this.connected = false
    this.name = attrs.name
    this.type = attrs.type
    this.show_name = attrs.show_name || false
    this.show_name = false
    this.prairie = prairie
    this.id = attrs.id;
    this.h = 24;
    this.w = 10;
    this.block = block

    this.node_group = new htmlShapes.BlockHtmlShape(block.block.block_group.el, 'node-group')
    this.node_group.width(htmlShapes.NODE_OUT_R * 2)
    this.node_group.height(htmlShapes.NODE_OUT_R * 2)

    this.node_background = new htmlShapes.BlockHtmlShape(this.node_group.el, 'node-background')
    this.node_background.width(htmlShapes.NODE_OUT_R * 2)
    this.node_background.height(htmlShapes.NODE_OUT_R * 2)

    this.node = new htmlShapes.BlockHtmlShape(this.node_group.el, 'node')
    this.node.width(htmlShapes.NODE_IN_R * 2)
    this.node.height(htmlShapes.NODE_IN_R * 2)
    this.node.center(this.node_group)

    this.set_connected(false)

    this.name_tip = new htmlShapes.BlockHtmlShape(this.node_group.el, 'tip')
    this.name_tip.text(this.name)

    this.positionNameTip()

    // TBM rename node-background as node-target
    this.node_background.on('dblclick', (e) => {
      e.stopPropagation()
      this.prairie.addBlockInputOrOutput(this)
    })

    this.node_background.on('mousedown', (e) => {
      e.stopPropagation()
      this.prairie.node_mouse_down(this)
    })
    this.node_background.on('mouseup', () => this.prairie.node_mouse_up(this))
  }

  prairieX() { return this.block.x() + this.x() + this.width() / 2 }
  prairieY() { return this.block.y() + this.y() + this.height() / 2 }

  positionNameTip() {
    let node_offset = 10
    let background_offset_x = 6
    let background_offset_y = 6

    let w = this.name_tip.width()
    let h = this.name_tip.height()

    this.name_tip.move(
      (this.type === 'in') ? (- w - node_offset) : (node_offset + this.node_group.width()),
      this.node_group.height() / 2 - h / 2);
  }

  positionNameTag() {
    let node_offset = 6
    let w = this.name_tag.width()
    let h = this.name_tag.height()

    this.name_tag.move(
      (this.type === 'in' ? node_offset + w : - node_offset - w),
      this.node.height() / 2 - h / 2);
  }

  x() {
    return this.node_group.x()
  }

  y() {
    return this.node_group.y()
  }

  height() {
    return this.node.height()
  }

  width() {
    return this.node.width()
  }

  set_connected(bool) {
    this.connected = bool;
    if (bool) {
      this.node.removeClass('unconnected')
      this.node.addClass('connected')
    }
    else {
      this.node.removeClass('connected')
      this.node.addClass('unconnected')
    }
  }
}


class BlockView {
  constructor({ prairie, id, shape_options, attr }) {
    this.id = id,
      this.nodes = []
    this.connections = []
    this.prairie = prairie
    shape_options.svg = prairie.prairie_element
    this.block = new htmlShapes.BlockShape(shape_options)
    this.blockshape_group = this.block.block_group

    this.GUI_editor_x = attr.GUI_editor_x || 0
    this.GUI_editor_y = attr.GUI_editor_y || 0

    this.shown_in_GUI_editor = (attr.shown_in_GUI_editor === undefined ? false : attr.shown_in_GUI_editor)

    this.editor_x = undefined
    this.editor_y = undefined

    this.selected = false

    this.block.block_group.draggable(true)

    // event trigger to Prairie that will then handle the block updating process
    this.block.block_group.on('mousedown', () => this.prairie.block_mouse_down(this))
    this.block.block_group.on('mousemove', () => this.update_connections())
    this.block.block_group.on('dblclick', () => this.prairie.block_dblclicked(this))
    this.block.block_group.on('contextmenu', () => this.prairie.openContextMenu(this))

  }

  create_nodes(nodes, functional_type, attr = undefined) {
    if (this.block) {
      if (functional_type === 'in') {
        _.each(nodes.in, (node, i) => {
          var new_node = new NodeView(this, node, this.prairie);
          this.nodes.push(new_node);
          htmlShapes.position_node(this.block, new_node.node_group, i, false, this.block.header)
          this.prairie.nodes.push(new_node)
        })
      }

      else if (functional_type === 'out') {
        _.each(nodes.out, (node, i) => {
          var new_node = new NodeView(this, node, this.prairie);
          this.nodes.push(new_node);
          htmlShapes.position_node(this.block, new_node.node_group, i, true, this.block.header)
          this.prairie.nodes.push(new_node)
        })
      }
    }
  }

  update() {
    this.redraw_nodes()
    this.update_connections()
  }

  update_connections() {
    for (let connection of this.connections) {
      connection.update_from_nodes()
    }
  }

  raw_name() {
    if (this.block) {
      return this.block.raw_name
    }
  }

  x() {
    if (this.block) {
      return this.block.block_group.x()
    }
  }

  y() {
    if (this.block) {
      return this.block.block_group.y()
    }
  }

  redraw_nodes() {
    let nodes_in = _.where(this.nodes, { type: 'in' })
    let nodes_out = _.where(this.nodes, { type: 'out' })
    if (nodes_in.length) {
      _.each(nodes_in, (node, i) => { htmlShapes.position_node(this.block, node.node_group, i, false, this.block.header) })
    }
    if (nodes_out.length) {
      _.each(nodes_out, (node, i) => { htmlShapes.position_node(this.block, node.node_group, i, true, this.block.header) })
    }
  }

  has_error(bool) {
    if (bool) {
      this.block.block_group.addClass('error')
    } else {
      this.block.block_group.removeClass('error')
    }
  }

  hide() {
    // this.block.block_group.hide()
  }

  show() {
    // this.block.block_group.show()
  }

  setSelected(bool) {
    this.selected = bool
    if (bool) {
      this.block.block_group.addClass('selected')
      this.block.block_group.removeClass('unselected')
    } else {
      this.block.block_group.removeClass('selected')
      this.block.block_group.addClass('unselected')
    }
  }
}

class FunctionBlockView extends BlockView {
  constructor({ name, prairie, id, nodes, attr }) {
    super({
      prairie: prairie, id: id, nodes: nodes,
      shape_options: {
        svg: prairie.svg,
        nodes_in: nodes.in.length,
        nodes_out: nodes.out.length,
        name: name,
        header: false,
        icon: true,
        icon_svg: attr.svg_path,
        icon_text: attr.icon_text,
        x: attr.x,
        y: attr.y
      },
      attr: { ...attr }
    })

    this.create_nodes(nodes, 'in')
    this.create_nodes(nodes, 'out')
  }
}

class WidgetBlockView extends BlockView {
  constructor({ w, h, prairie, id, name, shape_options, attr = {} }) {
    super({
      name: name,
      prairie: prairie,
      node_cover_in: true,
      node_cover_out: true,
      id: id,
      shape_options: shape_options,
      attr: { ...attr }
    });

    this.f_obj_id = 'fobj-' + this.name
    this.fobj = new htmlShapes.BlockHtmlShape(this.block.block_group.el)
    this.fobj.el.setAttribute('id', this.f_obj_id)
    this.fobj.addClass('fobj')
    this.fobj.on('mousedown', (e) => e.stopPropagation())
    this.fobj.on('scroll', (e) => e.stopPropagation())

    this.fobj.appendChild = (type, attr) => {
      let new_el = document.createElement(type)
      _.each(attr, (value, key) => {
        new_el.setAttribute(key, value)
      })
      this.fobj.el.appendChild(new_el)
    }

    this.x_offset = 0
    this.y_offset = 3

    this.update()

    this.shown_in_GUI_editor = (attr.shown_in_GUI_editor === undefined ? true : attr.shown_in_GUI_editor)
  }

  update_fobj_position() {
    this.fobj.x(this.x_offset + this.block.node_cover_in);
    this.fobj.y(this.y_offset);
  }

  setzindex() {
    document.getElementById(this.f_obj_id).children[0].style.zIndex = this.block.position().toString()
    for (let child of document.getElementById(this.f_obj_id).children[0].children) {
      child.style.zIndex = 'inherit'
    }
  }

  setTransformation(scale = 1) {
    document.getElementById(this.f_obj_id).children[0].style.transformOrigin = '0';
    document.getElementById(this.f_obj_id).children[0].style.transform = `scale(${scale})`;
  }

  update() {
    this.update_fobj_position()
    this.update_connections()
  }

  setSelected(bool) {
    super.setSelected(bool)
    // if (bool) {
    //   this.fobj.addClass('selected')
    //   this.fobj.removeClass('unselected')
    // } else {
    //   this.fobj.removeClass('selected')
    //   this.fobj.addClass('unselected')
    // }
  }

  show() {
    super.show()
    this.fobj.show()
  }

  hide() {
    super.hide()
    this.fobj.hide()
  }

}


class CodeCodeBlockView extends WidgetBlockView {
  constructor({ name,
    prairie,
    nodes,
    id: id,
    init_w: init_w = 10,
    init_h: init_h = 80,
    tools: tools = [],
    attr: attr = {} }) {

    super({
      name: name,
      w: init_w,
      h: init_h,
      prairie: prairie,
      id: id,
      tools: tools,
      attr: attr,
      shape_options: {
        svg: prairie.svg,
        nodes_in: nodes.in.length,
        nodes_out: nodes.out.length,
        name: name,
        header: false,
        node_cover_out: nodes.out.length ? 25 : 0,
        node_cover_in: nodes.in.length ? 25 : 0,
        style: 'input-block',
        x: attr.x,
        y: attr.y
      },
      attr: { ...attr }
    })

    this.create_nodes(nodes, 'in')
    this.create_nodes(nodes, 'out')

    this.initial_w = init_w
    this.initial_h = init_h

    this.letter_w = 7
    this.letter_h = 3
    this.line_h = 19
    this.el_id = this.prairie.name + this.id
    this.fobj.appendChild("textarea", { id: this.el_id, name: 'code' })

    this.editor = CodeMirror.fromTextArea(document.getElementById(this.el_id), {
      mode: 'python',
      theme: attr.theme || 'github-light',
      styleActiveLine: true,
      lineNumbers: false,
      lineWrapping: false,
      height: 'auto',
    });

    this.editor.setValue(attr.value)

    this.setFobjXOffset()
    this.y_offset = 5
    this.max_height = 200

    this.update_block()
    this.editor.on("change", () => this.update_block())
  }

  update_block() {

    let new_w = Math.max(this.editor.display.maxLineLength * this.letter_w + this.initial_w, this.block.min_content_width() - this.x_offset) + 10
    let new_h = Math.min(this.editor.lineCount() * this.line_h + 20, this.max_height) //+ 2 * this.y_offset)

    this.block.resize_content(new_w, new_h)

    this.w = this.block.content_w
    this.h = this.block.block_group.height()
    this.editor.setSize(new_w, new_h - 2 * this.y_offset)
    this.fobj.size(new_w, new_h);
    this.redraw_nodes()
    this.update()
  }

  setFobjXOffset() {
    this.x_offset = 5 + this.block.node_cover_in
  }

  getValue() {
    return this.editor.getValue();
  }

  setValue(value) {
    this.editor.setValue(value.toString());
  }


  //TBM
  changeBlockandStyle(shape_options) {
    this.block.block_group.remove()
    this.block = new shapes.BlockShape(shape_options)
    this.blockshape_group = this.block.block_group
    this.block.block_group.mousedown(() => this.prairie.block_mouse_down(this))

    _.each(this.nodes, (node) => {
      node.block = this
      this.block.block_group.add(node.node_group)
    })

    this.update()
    this.redraw_nodes()
    this.update_block()
  }

  updateBlockShapeAndNodes(model) {
    function maxNameLength(nodes) {
      return Math.max(..._.map(nodes, (node) => {
        return node.name.length * 8 + 15
      }))
    }

    _.each(this.nodes, (node, i) => {
      node.node_group.remove()
      // this.prairie.nodes.slice(_.indexOf(this.prairie.nodes, node),1)
    })

    this.block.n_nodes_in = model.nodes.in.length
    this.block.n_nodes_out = model.nodes.out.length
    // this.block.node_cover_in = this.block.n_nodes_in ? 25 : 0
    // this.block.node_cover_out =  this.block.n_nodes_out ? 25 : 0
    this.block.node_cover_in = this.block.n_nodes_in ? maxNameLength(model.nodes.in) : 0
    this.block.node_cover_out = this.block.n_nodes_out ? maxNameLength(model.nodes.out) : 0
    this.block.resize()

    this.nodes = []

    this.create_nodes(model.nodes, 'in')
    this.create_nodes(model.nodes, 'out')

    this.setFobjXOffset()
    this.update()
    this.update_block()

    this.redraw_nodes()
  }
}

class CodeBlockView extends WidgetBlockView {
  constructor({ name,
    prairie,
    nodes,
    id: id,
    init_w: init_w = 10,
    init_h: init_h = 80,
    tools: tools = [],
    attr: attr = {} }) {

    super({
      name: name,
      w: init_w,
      h: init_h,
      prairie: prairie,
      id: id,
      tools: tools,
      attr: attr,
      shape_options: {
        svg: prairie.svg,
        nodes_in: 0,
        nodes_out: 1,
        name: name,
        header: false,
        node_cover_out: 20,
        style: 'input-block',
        x: attr.x,
        y: attr.y
      },
      attr: { ...attr }
    })

    this.create_nodes(nodes, 'out')

    this.initial_w = init_w
    this.initial_h = init_h

    this.letter_w = 7
    this.letter_h = 3
    this.line_h = 19
    this.el_id = this.prairie.name + this.id
    this.fobj.appendChild("textarea", { id: this.el_id, name: 'code' })

    this.editor = CodeMirror.fromTextArea(document.getElementById(this.el_id), {
      mode: 'python',
      theme: attr.theme || 'github-light',
      styleActiveLine: true,
      lineNumbers: false,
      lineWrapping: false,
      height: 'auto',
    });

    this.edtior_wrapper = this.editor.getWrapperElement()
    this.edtior_wrapper.addEventListener('mousedown', (e) => {
      e.stopPropagation()
    })

    this.editor.setValue(attr.value)

    this.x_offset = 5
    this.y_offset = 4
    this.max_height = 200

    this.update_block()
    this.editor.on("changes", () => {
      this.update_block()
    })
  }

  update_block() {

    let new_w = Math.max(this.edtior_wrapper.offsetWidth + 2 * this.x_offset, this.block.min_content_width() - this.x_offset)
    let new_h = Math.min(this.edtior_wrapper.offsetHeight + 2 * this.y_offset, this.max_height) //+ 2 * this.y_offset)

    this.block.resize_content(new_w, new_h)

    this.w = this.block.content_w
    this.h = this.block.block_group.height()
    this.redraw_nodes()
    this.update()
  }


  getValue() {
    return this.editor.getValue();
  }

  setValue(value) {
    this.editor.setValue(value.toString());
  }

  // TBM
  changeBlockandStyle(shape_options) {
    this.block.block_group.remove()
    this.block = new shapes.BlockShape(shape_options)
    this.blockshape_group = this.block.block_group
    this.block.block_group.mousedown(() => this.prairie.block_mouse_down(this))

    _.each(this.nodes, (node) => {
      node.block = this
      this.block.block_group.add(node.node_group)
    })

    this.update()
    this.redraw_nodes()
    this.update_block()
  }
}

class VariableBlockView extends CodeBlockView {
  constructor({
    name,
    prairie,
    nodes,
    id: id,
    tools: tools = [],
    attr: attr = {} }) {

    super({
      name,
      prairie,
      nodes,
      id: id,
      init_w: 10,
      init_h: 80,
      tools: tools || [],
      attr: attr || {}
    })

    this.rename_when_connect = true

    // this.changeBlockandStyle({
    //   svg: prairie.svg,
    //   nodes_in: 0,
    //   nodes_out: 1,
    //   name: name,
    //   solid_header: false,
    //   header: true,
    //   node_cover_out: 20,
    //   style: 'input-block',
    //   x: attr.x,
    //   y: attr.y
    // })
  }

  rename(name) {
    this.name = name
    if (this.block.block_group.name) {
      this.block.block_group.name.text(name)
    }
  }
}

class StaticCodeBlockView extends CodeBlockView {
  constructor({
    name,
    prairie,
    nodes,
    id: id,
    tools: tools = [],
    attr: attr = {} }) {

    super({
      name,
      prairie,
      nodes,
      id: id,
      init_w: 100,
      init_h: 80,
      tools: tools || [],
      attr: attr || {}
    })

    this.rename_when_connect = true
    this.shown_in_GUI_editor = false
    this.max_height = 1000000

    this.changeBlockandStyle({
      svg: prairie.svg,
      nodes_in: 0,
      nodes_out: 1,
      name: name,
      header: false,
      node_cover_out: 0,
      style: 'static-code-block',
      x: attr.x,
      y: attr.y
    })

    this.editor.setOption('lineNumbers', true)
    this.block.block_group('mousedown', (e) => { e.preventDefault() })
    this.blockshape_group.draggable(false)

  }
}

class OutputCodeBlockView extends WidgetBlockView {
  constructor({ name,
    prairie,
    nodes,
    id: id,
    init_w: init_w = 10,
    init_h: init_h = 80,
    tools: tools = [],
    attr: attr = {} }) {

    super({
      name: name,
      w: init_w,
      h: init_h,
      prairie: prairie,
      id: id,
      tools: tools,
      attr: attr,
      shape_options: {
        svg: prairie.svg,
        nodes_in: 1,
        nodes_out: 0,
        name: name,
        header: false,
        node_cover_in: 20,
        style: 'output-block',
        x: attr.x,
        y: attr.y
      },
      attr: { ...attr }
    })

    this.create_nodes(nodes, 'in')

    this.initial_w = init_w
    this.initial_h = init_h

    this.max_height = 300

    this.el_id = this.prairie.name + this.id
    this.fobj.appendChild("textarea", { id: this.el_id, name: 'code' })

    this.editor = CodeMirror.fromTextArea(document.getElementById(this.el_id), {
      mode: 'python',
      theme: 'prairieoutput',
      styleActiveLine: true,
      lineNumbers: false,
      lineWrapping: false,
      readOnly: 'nocursor',
      height: 'auto',
    });

    this.edtior_wrapper = this.editor.getWrapperElement()
    this.edtior_wrapper.addEventListener('mousedown', (e) => {
      e.stopPropagation()
    })

    this.editor.setValue(attr.value)

    this.x_offset = 5
    this.y_offset = 4

    this.update_block()
    this.editor.on("changes", () => {
      this.update_block()
    })

  }

  update_block() {
    let new_w = Math.max(this.edtior_wrapper.offsetWidth + 2 * this.x_offset, this.block.min_content_width() - this.x_offset)
    let new_h = Math.min(this.edtior_wrapper.offsetHeight + 2 * this.y_offset, this.max_height) //+ 2 * this.y_offset)

    this.block.resize_content(new_w, new_h)

    this.w = this.block.content_w
    this.h = this.block.block_group.height()
    this.redraw_nodes()
  }

  getValue() {
    return this.editor.getValue();
  }

  setValue(value) {
    this.editor.setValue(value.toString());
  }
}

class PlotBlockView extends WidgetBlockView {

  constructor({ name,
    prairie,
    nodes,
    id: id,
    init_w: init_w = 350,
    init_h: init_h = 100,
    tools: tools = [],
    attr: attr = {} }) {

    super({
      name: name,
      w: init_w,
      h: init_h,
      prairie: prairie,
      id: id,
      tools: tools,
      attr: attr,
      shape_options: {
        svg: prairie.svg,
        nodes_in: 2,
        nodes_out: 0,
        name: name,
        header: false,
        node_cover_in: 20,
        style: 'block',
        x: attr.x,
        y: attr.y
      },
      attr: { ...attr }
    })

    // NODES
    this.create_nodes(nodes, 'in')

    // GEOMETRY
    this.initial_w = init_w
    this.initial_h = init_h

    this.margin_w = 3
    this.margin_h = 8

    this.x_offset = this.margin_w
    this.y_offset = this.margin_h

    this.bokeh_tools_icon_size = 30;

    this.h = this.initial_h
    this.w = this.initial_w

    // PLOT
    this.el_id = this.prairie.name + this.id

    this.fobj.appendChild("div", { id: this.el_id })

    this.min_h = 200;
    this.min_w = 300;

    document.getElementById(this.el_id).width = this.min_w
    document.getElementById(this.el_id).height = this.min_h

    this.update()
    this.update_block()
  }

  update_block() {
    this.w = Math.max(this.w, this.min_w)
    this.h = Math.max(this.h, this.min_h)

    this.block.resize_content(this.w, this.h)
    this.update_plot_size()
    this.redraw_nodes()
  }

  update_plot_size() {
    let new_w = this.w - 2 * this.margin_w
    let new_h = this.h - 2 * this.margin_h

    if (new_w > 0 && new_h > 0)
      this.fobj.size(new_w, new_h);
    // this.p.document.resize()
  }

  update() {
    super.update()
    this.update_plot_size()
  }

  plot(x, y) {
    var trace1 = {
      x: x,
      y: y,
      type: 'line',
      line: { width: 1 },
      hoverinfo: 'none'
    };

    var layout = {
      autosize: false,
      width: this.min_w + 40,
      height: this.min_h - 20,
      margin: {
        l: 35,
        r: 30,
        b: 25,
        t: 10,
        pad: 0
      },
      xaxis: {
        zeroline: false,
        showline: true,
        mirror: 'axe',
        linecolor: 'lightgrey',
        ticks: 'outside',
        tickcolor: 'grey'
      },
      yaxis: {
        zeroline: false,
        showline: true,
        mirror: 'axe',
        linecolor: 'lightgrey',
        ticks: 'outside',
        tickcolor: 'grey'
      },
      font: {
        family: 'Roboto Mono',
        size: 10,
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      modebar: { orientation: 'v', bgcolor: 'white' }
    };

    plotly.newPlot(this.el_id, [trace1], layout,
      {
        modeBarButtonsToRemove: [
          'sendDataToCloud',
          'hoverCompareCartesian',
          'hoverClosestCartesian',
          'zoomIn2d',
          'zoomOut2d',
          'toggleSpikelines'],
        // scrollZoom: true,
        displayModeBar: true,
        displaylogo: false,
      });

  }

}

class ImageBlockView extends WidgetBlockView {

  constructor({ name,
    prairie,
    nodes,
    id: id,
    init_w: init_w = 350,
    init_h: init_h = 100,
    tools: tools = [],
    attr: attr = {} }) {

    super({
      name: name,
      w: init_w,
      h: init_h,
      prairie: prairie,
      id: id,
      tools: tools,
      attr: attr,
      shape_options: {
        svg: prairie.svg,
        nodes_in: 1,
        nodes_out: 0,
        name: name,
        header: false,
        node_cover_in: 20,
        style: 'block',
        x: attr.x,
        y: attr.y
      },
      attr: { ...attr }
    })

    // NODES
    this.create_nodes(nodes, 'in')

    // GEOMETRY
    this.initial_w = init_w
    this.initial_h = init_h

    this.margin_w = 6
    this.margin_h = 12

    this.x_offset = this.margin_w
    this.y_offset = this.margin_h

    this.bokeh_tools_icon_size = 30;

    this.h = this.initial_h
    this.w = this.initial_w

    // PLOT
    this.el_id = this.prairie.name + this.id
    this.fobj.appendChild("div", { id: this.el_id })

    this.min_h = 300;
    this.min_w = 300;

    document.getElementById(this.el_id).width = this.min_w
    document.getElementById(this.el_id).height = this.min_h

    this.value = undefined

    this.update()
    this.update_block()
  }

  update_block() {
    this.w = Math.max(this.w, this.min_w)
    this.h = Math.max(this.h, this.min_h)

    this.block.resize_content(this.w, this.h)
    this.update_plot_size()
    this.redraw_nodes()
  }

  update_plot_size() {
    let new_w = this.w - 2 * this.margin_w
    let new_h = this.h - 2 * this.margin_h

    if (new_w > 0 && new_h > 0)
      this.fobj.size(new_w, new_h);
    // this.p.document.resize()
  }

  update() {
    super.update()
    this.update_plot_size()
  }

  plot(d) {
    var data = [
      {
        z: d,
        type: 'heatmap',
        colorscale: 'Viridis',
        colorbar: {
          thickness: 15
        },
      }
    ];

    var layout = {
      autosize: false,
      width: this.min_w + 30,
      height: this.min_h - 30,
      margin: {
        l: 35,
        r: 35,
        b: 25,
        t: 10,
        pad: 0
      },
      xaxis: {
        zeroline: false,
        showline: true,
        mirror: 'axe',
        linecolor: 'lightgrey',
        ticks: 'outside',
        tickcolor: 'grey'
      },
      yaxis: {
        zeroline: false,
        showline: true,
        mirror: 'axe',
        linecolor: 'lightgrey',
        ticks: 'outside',
        tickcolor: 'grey'
      },
      font: {
        family: 'Roboto Mono',
        size: 10,
      },
    };

    plotly.newPlot(this.el_id, data, layout,
      {
        modeBarButtonsToRemove: [
          'sendDataToCloud',
          'hoverCompareCartesian',
          'hoverClosestCartesian',
          'zoomIn2d',
          'zoomOut2d',
          'toggleSpikelines'],
        scrollZoom: true,
      });

    // this.value = d
  }

  getValue() {
    return this.value
  }
}

class MatrixBlockView extends WidgetBlockView {
  constructor({ name,
    prairie,
    nodes,
    id: id,
    init_w: init_w = 10,
    init_h: init_h = 80,
    tools: tools = [],
    attr: attr = {} }) {

    super({
      name: name,
      w: init_w,
      h: init_h,
      prairie: prairie,
      id: id,
      tools: tools,
      attr: attr,
      shape_options: {
        svg: prairie.svg,
        nodes_in: 1,
        nodes_out: 0,
        name: name,
        header: false,
        node_cover_in: 20,
        style: 'block',
        x: attr.x,
        y: attr.y
      },
      attr: { ...attr }
    })

    this.create_nodes(nodes, 'in')

    this.initial_w = init_w
    this.initial_h = init_h

    // this.max_height = 300

    this.el_id = this.prairie.name + this.id

    this.x_offset = 8
    this.y_offset = 4

    this.setValue('\LateX')
  }

  update_block() {
    let new_w = Math.max(this.fobj.el.offsetWidth + 2 * this.x_offset) //, this.block.min_content_width() - this.x_offset)
    let new_h = Math.max(this.fobj.el.offsetHeight + 2 * this.y_offset, this.max_height || 0) //+ 2 * this.y_offset)

    this.block.resize_content(new_w, new_h)

    this.w = this.block.content_w
    this.h = this.block.block_group.height()
    this.redraw_nodes()
  }

  getValue() {
    // return this.editor.getValue();
    return 0
  }

  setValue(value) {
    // this.editor.setValue(value.toString());
    this.value = value
    console.log(value)
    katex.render(value, this.fobj.el, {
      throwOnError: false,
      // displayMode: true,
    });
    this.update_block()
    this.update()
  }
}



export {
  BlockView,
  NodeView,
  WidgetBlockView,
  CodeBlockView,
  PlotBlockView,
  FunctionBlockView,
  OutputCodeBlockView,
  ImageBlockView,
  VariableBlockView,
  StaticCodeBlockView,
  CodeCodeBlockView,
  WidgetHtmlBlockView,
  MatrixBlockView
}
