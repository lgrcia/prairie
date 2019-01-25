import numpy as np

def say_hello():
    c = 'Hello'
    return c

def say_hello_to(someone):
    c = 'Hello ' + str(someone) + '!'
    return c

def random_number():
    return np.random.rand()

def sinus(x):
    return np.sin(x)

def random_matrix(dimension):
    return np.random.rand(dimension, dimension)

def random_matrix_multiple(dimension1, dimension2):
    mat1 = np.random.rand(dimension1, dimension2)
    mat2 = np.random.rand(dimension2)
    return mat1, mat2

def add(a, b):
    sum = a + b 
    return sum

def multiply(a, b):
    result = a * b 
    return result

def image_simuation():
    N = 500
    x = np.linspace(0, 10, N)
    y = np.linspace(0, 10, N)
    xx, yy = np.meshgrid(x, y)
    d = np.sin(xx)*np.cos(yy)

    return d

def fft(d):
    result = np.fft.fft2(d)
    return result

def real_part(c):
    return c.real

def complex_part(c):
    return c.complex

def inv_log(image):
    return -np.log(image)

def row0(vector):
    return vector[0]

def row(vector, n):
    return vector[n]