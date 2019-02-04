import numpy as np
import pprint

def input(x):
    input = None
    if x is not None or (isinstance(x, str) and len(x)>0):
        input = eval(x)
    
    return input


def output(x):
    output = x
    if isinstance(x, str):
        output = "'" + output + "'"
    else:
        output = pprint.pformat(output, indent=4)
    return output

def plot(y, x):
    return y, x

def image(d):
    return d

def code(script, inputs):
    outputs = {}
    exec(script, inputs, outputs)
    return outputs

def matrix(a):
    if len(a.shape) > 2:
        raise ValueError('bmatrix can at most display two dimensions')
    lines = str(a).replace('[', '').replace(']', '').splitlines()
    rv = [r'\begin{bmatrix}']
    rv += ['  ' + ' & '.join(l.split()) + r'\\' for l in lines]
    rv +=  [r'\end{bmatrix}']
    math = '\n'.join(rv)
    return math

def scan(e):
    return e
