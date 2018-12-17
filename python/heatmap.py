import matplotlib.pyplot as plt
import numpy as np

def points(n=100):
    x = np.random.uniform(size=n)
    y = np.random.uniform(size=n)
    return x, y
x1, y1 = points()
x2, y2 = points()
fig = plt.figure(figsize=(4,4))
ax = fig.add_subplot(111, title="Test scatter")
alpha = 0.5
ax.scatter(x1, y1, s=100, alpha = 0.5, c=[1., alpha, alpha])
ax.scatter(x2, y2, s=100, alpha = 0.5, c=[alpha, alpha, 1.])
plt.show()
