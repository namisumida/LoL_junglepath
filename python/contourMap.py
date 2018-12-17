import numpy as np
import matplotlib.pyplot as plt

# Constants
min_X = 0
max_X = 14700
min_Y = 0
max_Y = 14600
srFilename = "SRFull.png"

# Create a function that has the following inputs and outputs:
#   Inputs - XY-Coordinate Array, Size (how many buckets for the contour)
#   Outputs - Contour plot on top of the image
#   Functionality - Determines which bucket each of the XY-coordinates fall
#       into, and counts the number of points in each bucket to make the Z-Array.

def contourSetUp(xData,yData,size):
    # Set-up for grid with given size
    x = np.linspace(min_X, max_X, size)
    y = np.linspace(min_Y, max_Y, size)
    X,Y = np.meshgrid(x,y)
    
    # Convert x and y data into data pertaining to which row and column each
    #   predicted position will fall in the Z or intensity array
    xBuckets = (np.floor(xData / max_X * size))
    yBuckets = (np.floor(yData / max_Y * size))
    
    # Pre-allocate the Z-array with zeroes, and count the number of occurrences
    #   in each bucket        
    #
    #   NOTE: yBuckets listed before xBuckets in order to have proper 
    #   orientation in Z array
    Z = np.zeros((size,size))
    xyBuckets = (np.column_stack((yBuckets.astype(int),xBuckets.astype(int)))).tolist()
    for i in range(0, size):
        for j in range(0,size):
            Z[i,j] = xyBuckets.count([i,j])/len(xyBuckets)*100
            
    plotContour(X,Y,Z,size)
    
def plotContour(X,Y,Z,size):
    
    # Plot data
    img = plt.imread(srFilename)
    fig1, ax1 = plt.subplots()
    ax1.imshow(img,interpolation = 'nearest', alpha = 1.0, \
               extent = [min_X,max_X,min_Y,max_Y])
    colormap = plt.get_cmap('jet')
    
    # Overlays the contour plot on top of the image
    pp = plt.contourf(X,Y,Z,10, cmap = colormap, alpha = 0.5)
    plt.title('Concentration of Predicted Jungle Positions')
    plt.xlabel('X-Position')
    plt.ylabel('Y-Position')
    
    # Creates the color bar scale
    cbar = plt.colorbar(pp, orientation = 'vertical')
    cbar.ax.set_ylabel('Color Scale [%]')