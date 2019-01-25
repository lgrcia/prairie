const fs = require('fs')
const path = require('path')
const _ = require('underscore')

function walkDir(fpath) {
    var nodes = fs.readdirSync(fpath)
    var vnodes = _.map(nodes, (node) => {
        let node_path = path.join(fpath, node)
        return {
            name: node,
            extension: path.extname(node).replace(".", ""),
            open: false,
            saved: false,
            type: (fs.lstatSync(node_path).isDirectory() ? "directory" : "file"),
            path: node_path
        }
    })
    // var vnodes = _.map(nodes, (node) => {
    //     let node_path = path.join(fpath, node)
    //     return [node_path, {
    //         name: node,
    //         extension: path.extname(node).replace(".", ""),
    //         open: false,
    //         saved: false,
    //         type: (fs.lstatSync(node_path).isDirectory() ? "directory" : "file"),
    //         path: node_path
    //     }]
    // })
    var folders = _.sortBy(_.filter(vnodes, function(f){return f.type === "directory"}), 'name')
    var files = _.sortBy(_.filter(vnodes, function(f){return f.type === "file"}), 'name')
    return _.object(_.map(folders.concat(files), (node) => {
        return [node.name, node]
    }))
}

function buildDir(fpath) {
    return {
        name: path.basename(fpath),
        extension: path.extname(fpath).replace(".", ""),
        open: false,
        saved: false,
        type: (fs.lstatSync(fpath).isDirectory() ? "directory" : "file"),
        path: fpath,
        children: walkDir(fpath)
    }

}

function findDeep(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(findDeep(obj[i], key, val));
        } else
            //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
            if (i == key && obj[i] == val || i == key && val == '') { //
                objects.push(obj);
            } else if (obj[i] == val && key == '') {
                //only add if the object is not already in the array
                if (objects.lastIndexOf(obj) == -1) {
                    objects.push(obj);
                }
            }
    }
    return objects;
}

export {
    walkDir,
    buildDir,
    findDeep
}