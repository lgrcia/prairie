var HEADER_H = 33
var UNIT_BLOCK_H = 35
// var UNIT_BLOCK_H = 35
var NODE_OUT_R = 8
var NODE_IN_R = 3.5
var BLOCK_R = 5
var BLOCK_MIN_W = 15
var L_OFFSET = 15


function position_node(block, node, n, out, header) {
    node.move(
        (out ? block.content_w + 2*BLOCK_R + (block.node_cover_in ? block.node_cover_in - BLOCK_R : 0 ) + (block.node_cover_out ? block.node_cover_out - BLOCK_R : 0 ) : 0) - NODE_IN_R,
        (!(!block.solid_header == block.header) ? HEADER_H : 0) + UNIT_BLOCK_H / 2 - NODE_IN_R + n * UNIT_BLOCK_H)
    node.front()
}

function block_path(
    node_in,
    node_out,
    header,
    h = 0,
    w = 0,
    node_in_offset = BLOCK_R,
    node_out_offset = BLOCK_R) {

    node_in_offset = Math.max(node_in_offset, BLOCK_R)
    node_out_offset = Math.max(node_out_offset, BLOCK_R)
    h = Math.max(h - Math.max(node_in, node_out) * UNIT_BLOCK_H, 0)

    var path_string = `
    m ${BLOCK_R} 0 
    a ${BLOCK_R} ${BLOCK_R} 0 0 0 ${-BLOCK_R} ${BLOCK_R}`;

    if (header) {
        path_string += `
        l 0 ${HEADER_H - BLOCK_R}`;
    }
    
    if (node_in){
        path_string += `l 0 ${UNIT_BLOCK_H / 2 - NODE_OUT_R - (header ? 0 : BLOCK_R)}`;
    }
    
    for (var i = 0; i < node_in; i++) {
        path_string += `a ${NODE_OUT_R} ${NODE_OUT_R} 0 0 0 0 ${2 * NODE_OUT_R}`;
        if (i != node_in - 1) {
            path_string += `l 0 ${UNIT_BLOCK_H - 2 * NODE_OUT_R}`;
        } else {
            path_string += `l 0 ${UNIT_BLOCK_H / 2 - NODE_OUT_R - BLOCK_R}`; //+ (node_in < node_out ? (node_out - node_in) * UNIT_BLOCK_H / 2 : 0)}`
        }
    };

    if (node_in) {
        path_string += `
        l 0 ${(node_out > node_in ? (node_out - node_in) * UNIT_BLOCK_H : 0)}`;
    } else {
        path_string += `
        l 0 ${node_out * UNIT_BLOCK_H - (header ? 1 : 2) * BLOCK_R}`;
    }

    path_string += `
    l 0 ${h}
    a ${BLOCK_R} ${BLOCK_R} 0 0 0 ${BLOCK_R} ${BLOCK_R} 
    l ${w + node_in_offset + node_out_offset - 2 * BLOCK_R} 0`;

    path_string += `
    a ${BLOCK_R} ${BLOCK_R} 0 0 0 ${BLOCK_R} ${-BLOCK_R}
    l 0 ${-h}`;

    if (node_out){
        path_string += `l 0 ${-(node_in > node_out ? (node_in - node_out) * UNIT_BLOCK_H : 0)}
        l 0 ${(-UNIT_BLOCK_H / 2) + NODE_OUT_R + BLOCK_R}`;
    } else {
        path_string += `l 0 ${- node_in * UNIT_BLOCK_H + (header ? 1 : 2) * BLOCK_R}`;
    }

    // path_string += `
    // l 0 ${(-UNIT_BLOCK_H / 2) + NODE_OUT_R + BLOCK_R}`;

    for (var i = 0; i < node_out; i++) {
        path_string += `a ${NODE_OUT_R} ${NODE_OUT_R} 0 0 0 0 ${-2 * NODE_OUT_R}`;
        if (i == node_out - 1) {
            path_string += `l 0 ${-UNIT_BLOCK_H / 2 + NODE_OUT_R + (!header ? BLOCK_R : 0)}`;
        } else {
            path_string += `l 0 ${-UNIT_BLOCK_H + 2 * NODE_OUT_R}`
        }
    };

    if (header) {
        path_string += `
        l 0 ${-HEADER_H + BLOCK_R}`;
    }

    path_string += `
    a ${BLOCK_R} ${BLOCK_R} 0 0 0 ${-BLOCK_R} ${-BLOCK_R} Z`;

    return path_string;
}

class BlockShape {
    constructor({
        svg,
        nodes_in: nodes_in = 2,
        nodes_out: nodes_out = 1,
        name: name = 'Unnamed',
        header: header = false,
        solid_header: solid_header = true,
        icon: icon = false,
        icon_text: icon_text = undefined,
        icon_svg: icon_svg = false,
        node_cover_in: node_cover_in = false,
        node_cover_out: node_cover_out = false,
        content_w: content_w = 100,
        content_h: content_h = 50,
        style: style='block',
        x: x=0,
        y: y=0,
    }) {

        this.svg = svg
        this.raw_name = name
        this.n_nodes_in = nodes_in
        this.n_nodes_out = nodes_out
        this.header = header
        this.hasIcon = icon
        this.icon_svg = icon_svg
        this.icon_text = icon_text
        this.solid_header = solid_header

        this.content_w = content_w
        this.content_h = content_h

        this.node_cover_in = node_cover_in
        this.node_cover_out = node_cover_out


        this.block_path = this.svg.path(block_path(nodes_in, nodes_out, header && solid_header, this.content_w, this.content_h)).addClass(style).back()

        this.block_group = this.svg.group().add(this.block_path).addClass('block-group')

        if (header) {
            if (solid_header){
                this.block_mask_path = this.block_path.clone()
                this.header_background = this.add_header();
            }
            this.name = this.add_name()
        } else if (this.hasIcon) {
            if (icon_svg) {
                this.icon = this.add_icon()
            } else {
                this.name = this.add_name_icon()
            }
        }

        if (node_cover_in || node_cover_out) {
            this.block_mask_path_cover = this.block_path.clone().removeClass(style).attr({
                fill: 'white',
                opacity: 1
            })
            this.cover_in = undefined
            this.cover_out = undefined
            this.add_node_cover()
        }

        this.block_stroke = this.block_group.put(this.block_path.clone().removeClass(style).addClass('block-stroke'))
        this.block_group.draggable()
        // this.add_shadow()
        this.resize()

        this.block_group.get_x = this.block_group.x
        this.block_group.get_y = this.block_group.y

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
        if (this.name) {
            this.name.remove()
        }
        return this.block_group.put(this.svg.text(this.raw_name).move(this.solid_header? L_OFFSET : BLOCK_R, this.solid_header? HEADER_H / 2 - 8 : - 23).addClass('header-font'))
    }

    add_name_icon() {
        if (this.name) {
            this.name.remove()
        }
        return this.block_group.put(this.svg.text(this.icon_text || this.raw_name).move(L_OFFSET + NODE_OUT_R, Math.max(Math.max(this.n_nodes_in, this.n_nodes_out)) * UNIT_BLOCK_H / 2 - 10).addClass(this.icon_text ? 'icon-text': 'header-font'))
    }

    add_icon() {
        return this.block_group.put(this.svg.path(this.icon_svg).size(null, 30)).addClass('header-font')
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
        let block_mask = this.svg.mask().add(this.block_mask_path_cover)
        if (this.node_cover_in) {
            if (this.cover_in){
                this.cover_in.remove()
            }
            this.cover_in = this.svg.rect(Math.max(this.node_cover_in, BLOCK_R) + NODE_OUT_R + 8, (this.header ? HEADER_H : 0) + Math.max(this.n_nodes_in, this.n_nodes_out) * UNIT_BLOCK_H + 10).addClass('header')
            this.cover_in.move(- NODE_OUT_R - 8, -5)
            this.cover_in.maskWith(block_mask)
            this.block_group.add(this.cover_in)
            if (this.header){this.cover_in.backward().backward()}
        }
        if (this.node_cover_out) {
            if (this.cover_out){
                this.cover_out.remove()
            }
            this.cover_out = this.svg.rect(Math.max(this.node_cover_out, BLOCK_R) + NODE_OUT_R + 8, (this.header ? HEADER_H : 0) + Math.max(this.n_nodes_in, this.n_nodes_out) * UNIT_BLOCK_H + 10).addClass('header')
            this.cover_out.move(this.node_cover_in + this.content_w, -5)
            this.cover_out.maskWith(block_mask)
            this.block_group.add(this.cover_out)
            if (this.header){this.cover_out.backward().backward()}
        }
    }

    add_nodes() {

    }

    min_content_width() {
        if (this.header) {
            return Math.max(this.name.bbox().w + 2 * L_OFFSET, BLOCK_MIN_W)
        } else if (this.hasIcon && !this.icon_svg) {
            return Math.max(this.name.bbox().w + 2 * L_OFFSET, BLOCK_MIN_W)
        } else if (this.icon_svg) {
            if (Math.max(this.n_nodes_in, this.n_nodes_out) === 1) {
                return UNIT_BLOCK_H
            } else {
                return UNIT_BLOCK_H + 2 * L_OFFSET
            }
        } else {
            return 10
        }
    }


    min_content_height() {
        if (this.icon_svg) {
            if (Math.max(this.n_nodes_in, this.n_nodes_out) === 1) {
                return UNIT_BLOCK_H + L_OFFSET
            }
        }
        return (Math.max(this.n_nodes_in, this.n_nodes_out)) * UNIT_BLOCK_H
    }

    resize_node_cover(in_or_out, w){}

    resize_content(w, h) {

        this.content_h = Math.max(this.min_content_height(), h)
        this.content_w = Math.max(this.min_content_width(), w)

        this.block_path.plot(block_path(
            this.n_nodes_in,
            this.n_nodes_out,
            this.header && this.solid_header,
            this.content_h, this.content_w, this.node_cover_in, this.node_cover_out))
        if (this.header && this.solid_header) {
            this.header_background.width(this.content_w + 8 * NODE_OUT_R + this.node_cover_in + this.node_cover_out)
            this.block_mask_path.plot(block_path(
                this.n_nodes_in,
                this.n_nodes_out,
                this.header,
                this.content_h, this.content_w, this.node_cover_in, this.node_cover_out))
        } else if (this.hasIcon && !this.icon_svg) {
            this.name.center(this.content_w/2 + NODE_OUT_R/2, this.content_h/2)
        } else if (this.icon_svg) {
            this.icon.center(this.content_w / 2 + L_OFFSET / 2, this.content_h / 2)
        }

        if (this.node_cover_in || this.node_cover_out){
            this.add_node_cover()
            this.block_mask_path_cover.plot(block_path(
                this.n_nodes_in,
                this.n_nodes_out,
                this.header && this.solid_header,
                this.content_h, this.content_w, this.node_cover_in, this.node_cover_out))
            if (this.node_cover_in){
                this.cover_in.height((this.header ? HEADER_H : 0) + this.content_h + Math.max(this.n_nodes_in, this.n_nodes_out) * UNIT_BLOCK_H + 10)
            }
            if (this.node_cover_out){
                this.cover_out.height((this.header ? HEADER_H : 0) + this.content_h + Math.max(this.n_nodes_in, this.n_nodes_out) * UNIT_BLOCK_H + 10)
                this.cover_out.move(Math.max(this.node_cover_in, BLOCK_R) + this.content_w)
            }
        }
        this.block_stroke.plot(block_path(
            this.n_nodes_in,
            this.n_nodes_out,
            this.header && this.solid_header,
            this.content_h, this.content_w, this.node_cover_in, this.node_cover_out))
        this.block_stroke.front()
    }


    resize(){
        this.resize_content(0, 0)
    }

    rename(name){
        this.raw_name = name
        this.name.text(name)
    }

    addClass(style_class){
        this.block_group.addClass(style_class)
    }

    removeClass(style_class){
        this.block_group.removeClass(style_class)
    }

    move(x, y) {
        this.block_group.move(x, y)
    }
}

export {
    block_path,
    position_node,
    HEADER_H,
    UNIT_BLOCK_H,
    NODE_OUT_R,
    NODE_IN_R,
    BLOCK_R,
    BlockShape
};