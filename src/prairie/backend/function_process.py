import importlib.util
from util import clean_prairie_id
import numpy as np

def get_function(script_path, function_name):
    # dev : Check if already imported
    # dev: is it importing all the functions from the file?
    spec = importlib.util.spec_from_file_location("module.name", script_path)
    functions = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(functions)

    return getattr(functions, function_name)


def execute(script_path, function_name, args=[], kwargs=[]):

    function_attr = get_function(script_path, function_name)
    output = []

    try:
        #    Function call
        if len(args) == 0 and len(kwargs) == 0:
            output = function_attr()
        elif len(args) >= 1 and len(kwargs) == 0:
            output = function_attr(*args)
        elif len(args) == 0 and len(kwargs) >= 1:
            output = function_attr(**kwargs)
        elif len(args) > 1 and len(kwargs) >= 1:
            output = function_attr(*args, **kwargs)

        if isinstance(output, tuple) and function_name != 'input':
            output = [return_value for return_value in output]
        else:
            output = [output]

    except Exception as e:
        return 'Python_SPECIFIC_ERROR_CODE_001', str(e)

    return output

def run_global(script):
    try:
        exec(script, globals(), globals())
        return 'done'
    except Exception as e:
        return 'Python_SPECIFIC_ERROR_CODE_001', str(e)
