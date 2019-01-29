import numpy as np

def length(v):
    return len(v)

def dot_product(u, v):
    return np.dot(u, v)

def cross_product(u, v):
    return np.cross(u, v)

def arange(n0, n, d):
    return np.arange(n0, n, d)

def linspace(n0, n, N):
    return np.linspace(n0, n, N)

def ones(n):
    return np.ones(n)

def zeros(n):
    return np.zeros(n)

def rand(dim):
    return np.random.rand(dim)