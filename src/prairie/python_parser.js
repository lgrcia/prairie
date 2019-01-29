const _ = require('underscore')
const fs = require('fs')


function parse(filename){

  let re_functions = /def .*(?:\n?\n(?:(?:    ).*))*/g;
  let re_funtion_parameters = /def .*\(/
  let re_function_signature = /def (\w+)\s*\((.*?)\):/;
  let re_function_returns = /return .*/;

  let python_code = fs.readFileSync(filename).toString()

  let py_defs = python_code.match(re_functions)

  py_defs = _.zip(
    _.map(py_defs, function(def){
      return def.split('def ')[1].split('(')[0]}),
    _.map(py_defs, function(def){
      return def.split(/def .*\(/)[1].split('):')[0].split(',')}),
    _.map(py_defs, function(def){
        return def.split(/return /)[1].split(',')}))


  py_defs = _.map(py_defs, function(py_def){ return {
      name: py_def[0],
      parameters: _.filter(py_def[1], function(arg){return arg.length > 0}),
      returns: _.filter(py_def[2], function(arg){return arg.length > 0})
    };
  })

  return py_defs
}

function get_function_blocks(filename){
  let re_functions = /def .*(?:\n?\n(?:(?:    ).*))*/g;

  let python_code = fs.readFileSync(filename).toString()

  let py_defs = python_code.match(re_functions)

    py_defs = _.zip(
    _.map(py_defs, function(def){
      return def.split('def ')[1].split('(')[0]}))//,
    // _.map(py_defs, function(def){
    //   return def.split('"""')[1].split('"""')[0]}))


  py_defs = _.map(py_defs, (py_def) => {return {
      name: py_def[0],
      path: filename,
      // icon_text: JSON.parse(py_def[1]).icon_text
    };
  })

  return py_defs
}

export {parse, get_function_blocks}

