var HEADER_H = 33
var UNIT_BLOCK_H = 20
var NODE_OUT_R = 8
var NODE_IN_R = 3
var BLOCK_R = 5
var BLOCK_MIN_W = 15
var L_OFFSET = 15

function position_node(block, node, n, out, header) {
    node.move(
        (out ? + block.block_group.width() - 3 - node.width() : 3),
        UNIT_BLOCK_H / 2 - NODE_OUT_R + n * UNIT_BLOCK_H)
}

class BlockHtmlShape {
    constructor(parent, style) {
        this.parent = parent
        this.el = document.createElement('div')
        this.el.style.position = 'absolute'
        this.parent.appendChild(this.el)
        this.addClass(style)
        this._draggable = false

        // attributes for dragging
        this.xi = 0; this.yi = 0
        this.xf = 0; this.yf = 0

        this.draggable(this._draggable, 'this')
    }

    // Units utilty used when retrieving parameters
    pixel(str) { return Number(str.replace('px', '')) }
    unit(n, _unit) { return n + _unit || 'px' }

    addClass(_class) { this.el.classList.add(_class); return this }
    removeClass(_class) { this.el.classList.remove(_class); return this }
    x(x = undefined, unit = 'px') { if (x === undefined) { return this.pixel(this.el.style.left) } else { this.el.style.left = this.unit(x, unit); return this } }
    y(y = undefined, unit = 'px') { if (y === undefined) { return this.pixel(this.el.style.top) } else { this.el.style.top = this.unit(y, unit); return this } }
    move(x, y) {
        this.x(x); this.y(y);
        return this
    }
    width(w = undefined, unit = 'px') {
        if (w === undefined && this.el.innerHTML) {
            if (this.el.innerHTML[0] != '<') {
                return this.el.offsetWidth
            } else {
                return this.pixel(this.el.style.width)
            }
        } else if (w === undefined) {
            return this.pixel(this.el.style.width)
        } else {
            this.el.style.width = this.unit(w, unit); return this
        }
    }
    height(h = undefined, unit = 'px') {
        if (h === undefined && this.el.innerHTML) {
            if (this.el.innerHTML[0] != '<') {
                return this.el.offsetHeight
            } else {
                return this.pixel(this.el.style.height)
            }
        } else if (h === undefined) {
            return this.pixel(this.el.style.height)
        } else {
            this.el.style.height = this.unit(h, unit); return this
        }
    }
    center(x, y) {
        if (x instanceof BlockHtmlShape) {
            this.move(x.x() + x.width() / 2 - this.width() / 2, x.y() + x.height() / 2 - this.height() / 2)
        } else if (x != undefined && y != undefined) {
            this.move(x - this.width() / 2);
            this.move(y - this.height() / 2); return this
        } else {
            return [this.width() / 3, this.height() / 2]
        }
    }
    size(w, h) { this.width(w); this.height(h); return this }
    draggable(bool) {
        if (bool) {
            this.on('mousedown', (e) => {
                this.dragMouseDown(e)
            })
        } else {
            this.closeDragElement()
        }
    }
    text(str) { this.el.innerHTML = str; return this }
    on(_event, callback) { this.el.addEventListener(_event, callback) }

    // methods for dragging
    dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        this.xf = e.clientX;
        this.yf = e.clientY;
        document.onmouseup = this.closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = (e) => { this.elementDrag(e) };
    }

    elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        this.xi = this.xf - e.clientX;
        this.yi = this.yf - e.clientY;
        this.xf = e.clientX;
        this.yf = e.clientY;
        // set the element's new position:
        this.el.style.top = (this.el.offsetTop - this.yi) + "px";
        this.el.style.left = (this.el.offsetLeft - this.xi) + "px";
    }

    closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }

    appendChild(type, attrs) {
        let el = document.createElement(type)
        for (let key of Object.keys(attrs)) {
            el.setAttribute(key, attrs[key])
        }
        this.el.appendChild(el)
    }

    remove(){
        this.parent.removeChild(this.el)
    }
}

class CircleShape {
    constructor({
        svg,
        icon_text: icon_text = undefined,
        icon_svg: icon_svg = false,
        style: style = 'block',
        x: x = 0,
        y: y = 0,
    }) {

        this.block_diam = 60

        this.svg = svg
        this.icon_svg = icon_svg
        this.icon_text = icon_text

        let block = this.svg.circle(this.block_diam)
        let node_in_1 = this.svg.circle(NODE_OUT_R * 2).center(5, this.block_diam / 2 - 15)
        let node_in_2 = this.svg.circle(NODE_OUT_R * 2).center(5, this.block_diam / 2 + 15)
        let node_out = this.svg.circle(NODE_OUT_R * 2).center(this.block_diam, this.block_diam / 2)

        this.block_path = this.svg.clip().add(block).add(node_in_1).add(node_in_2).add(node_out)


        this.block_path.addClass(style)

        this.block_path = this.svg.circle(60).addClass('block-stroke')

        this.block_group = this.svg.group().add(this.block_path).addClass('block-group')
    }
}

class BlockShape {
    constructor({
        svg,
        nodes_in: nodes_in = 2,
        nodes_out: nodes_out = 1,
        name: name = 'Unnamed',
        header: header = false,
        center_header: center_header = false,
        icon: icon = false,
        icon_text: icon_text = undefined,
        icon_svg: icon_svg = false,
        node_cover_in: node_cover_in = false,
        node_cover_out: node_cover_out = false,
        content_w: content_w = 100,
        content_h: content_h = 50,
        style: style = 'block',
        x: x = 0,
        y: y = 0,
    }) {

        this.svg = svg
        this.raw_name = name
        this.n_nodes_in = nodes_in
        this.n_nodes_out = nodes_out
        this.header = header
        this.nameAsIcon = icon
        this.icon_svg = icon_svg
        this.icon_text = icon_text
        this.center_header = center_header

        this.content_w = content_w
        this.content_h = content_h

        this.node_cover_in = node_cover_in
        this.node_cover_out = node_cover_out

        this.block_group = new BlockHtmlShape(svg, style)
        this.block_group.addClass('block')

        // this.icon_svg = "src/blocks/operations/icons/rand.svg"

        if (this.nameAsIcon) {
            this.name = this.add_name()
            // this.name.move(
            //     - this.name.width() / 2 + this.block_group.width() / 2,
            //     - this.name.height() / 2 + this.block_group.height() / 2
            // )
            // this.name.center(this.block_group)
            // this.icon = this.add_icon()
        }

        if (node_cover_in || node_cover_out) {
            this.cover_in = undefined
            this.cover_out = undefined
            this.add_node_cover()
        }

        this.resize()

        this.block_group.move(x, y)
    }

    add_header() {
        if (this.header_background) {
            this.header_background.remove()
        }
        let block_mask = this.svg.mask().add(this.block_mask_path)
        var header_background = this.svg.rect(
            this.rect_w + 8 * NODE_OUT_R,
            HEADER_H + 8).move(- 4 * NODE_OUT_R, -8).addClass('header')
        header_background.maskWith(block_mask)
        return this.block_group.put(header_background)
    }

    add_name() {
        let name = new BlockHtmlShape(this.block_group.el, 'header-font')
        name.text(this.raw_name)
        name.y(-(name.height() + 5))
        return name

    }

    add_name_icon() {
        // if (this.name) {
        //     this.name.remove()
        // }
        // this.name = 
        let name = new BlockHtmlShape(this.block_group.el, 'header').text(this.name)
        name.y(-(name.height() + 5))
        return name
        // return this.block_group.put(this.svg.text(this.icon_text || this.raw_name).move(L_OFFSET + NODE_OUT_R, Math.max(Math.max(this.n_nodes_in, this.n_nodes_out)) * UNIT_BLOCK_H / 2 - 10).addClass('header-font'))
    }

    add_icon() {
        let icon = new BlockHtmlShape(this.block_group.el, 'block-icon')
        icon.appendChild('img', {
            src: this.icon_svg,
            style: 'width:100%;height:100%'
        })
        icon.size(34, 34)
        return icon
    }

    add_shadow() {
        this.block_path.filter(function (add) {
            var blur = add.offset(-1, 1).in(add.sourceAlpha).gaussianBlur(2).componentTransfer({
                a: {
                    type: "linear", slope: "0.1"
                }
            })
            add.blend(add.source, blur)
        })
    }

    add_node_cover() {
        if (this.node_cover_in) {
            this.cover_in = new BlockHtmlShape(this.block_group.el, 'cover-in')
            this.cover_in.width(this.node_cover_in)
            this.cover_in.height(100, '%')
        }
        if (this.node_cover_out) {
            this.cover_out = new BlockHtmlShape(this.block_group.el, 'cover-out')
            this.cover_out.width(this.node_cover_out)
            this.cover_out.height(100, '%')
            this.cover_out.x(this.content_w + this.node_in_offset())
        }
    }

    add_nodes() {

    }

    min_content_width() {
        if (this.header) {
            return Math.max(this.name.width() + 2 * L_OFFSET, BLOCK_MIN_W)
        }
        if (this.nameAsIcon && !this.icon_svg) {
            return Math.max(this.name.width() + 2 * L_OFFSET, BLOCK_MIN_W)
        } else if (this.icon) {
            if (Math.max(this.n_nodes_in, this.n_nodes_out) === 1) {
                return this.icon.width() + L_OFFSET
            } else {
                return UNIT_BLOCK_H + 2 * L_OFFSET
            }
        } else {
            return 10
        }
    }


    min_content_height() {
        if (this.icon) {
            if (Math.max(this.n_nodes_in, this.n_nodes_out) === 1) {
                return this.icon.height() + 2 * L_OFFSET
            } else {
                return Math.max(Math.max(this.n_nodes_in, this.n_nodes_out) * UNIT_BLOCK_H, this.icon.height() + 2 * L_OFFSET)
            }
        }
        return (Math.max(this.n_nodes_in, this.n_nodes_out)) * UNIT_BLOCK_H
    }

    resize_node_cover(in_or_out, w) { }

    node_in_offset() {
        if (this.node_cover_in) {
            return this.node_cover_in
        } else if (this.n_nodes_in) {
            return NODE_OUT_R / 2 + 8
        } else {
            return 0
        }
    }

    node_out_offset() {
        if (this.node_cover_out) {
            return this.node_cover_out
        } else if (this.n_nodes_out) {
            return NODE_OUT_R / 2 + 8
        } else {
            return 0
        }
    }

    resize_content(w, h) {

        this.content_h = Math.max(this.min_content_height(), h)
        this.content_w = Math.max(this.min_content_width(), w)

        // if (this.header) {
        //     this.header_background.width(this.content_w + 8 * NODE_OUT_R + this.node_cover_in + this.node_cover_out)
        //     this.block_mask_path.plot(block_path(
        //         this.n_nodes_in,
        //         this.n_nodes_out,
        //         this.header,
        //         this.content_h, this.content_w, this.node_cover_in, this.node_cover_out))
        // } else if (this.solid_header && this.block_mask_path) {
        //     this.block_mask_path.remove()
        // } else if (this.nameAsIcon && !this.icon_svg) {
        //     this.name.center(this.content_w/2 + NODE_OUT_R/2, this.content_h/2)
        // } else if (this.icon_svg) {
        //     this.icon.center(this.content_w / 2 + L_OFFSET / 2, this.content_h / 2)
        // }
        this.block_group.size(this.content_w + this.node_in_offset() + this.node_out_offset(), this.content_h)

        if (this.node_cover_in || this.node_cover_out) {
            if (this.node_cover_in) { }
            if (this.node_cover_out) {
                this.cover_out.x(this.node_in_offset() + this.content_w)
            }
        }

        if (this.nameAsIcon && !this.icon_svg) {
            this.name.center(this.block_group)
        } else if (this.icon) {
            this.icon.center(this.block_group)
        }

        return this
    }


    resize() {
        this.resize_content(0, 0)
    }

    rename(name) {
        this.raw_name = name
        this.name.text(name)
    }

    addClass(style_class) {
        this.block_group.addClass(style_class)
    }

    removeClass(style_class) {
        this.block_group.removeClass(style_class)
    }

    move(x, y) {
        this.block_group.move(x, y)
        return this
    }
}

export {
    position_node,
    HEADER_H,
    UNIT_BLOCK_H,
    NODE_OUT_R,
    NODE_IN_R,
    BLOCK_R,
    BlockShape,
    BlockHtmlShape
};