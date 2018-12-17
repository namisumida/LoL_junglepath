# -*- coding: utf-8 -*-
"""
Created on Tue Oct 30 19:11:02 2018

@author: sdownhowerAdmin
"""

import matplotlib.pyplot as plt

# Constants
srFilename = "SRFull.png"
newDataPath = 'C:\\Users\\sdownhowerAdmin\\Documents\\GitHub\\FallJungleProject'
colorArray = ['b', 'g', 'r', 'm', 'y', 'c', 'w']

MIN_X = 0 # Minimimum X coordinate on Summoner's Rift
MIN_Y = 0 # Minimum Y coordinate on Summoner's Rift
MAX_X = 14700 # Maximum X coordinate on Summoner's Rift
MAX_Y = 14600 # Maximum Y coordinate on Summoner's Rift

def basicPlot(xyPoints, MS = 15):
    '''
    Plots an list of points on Summoner's Rift
    
    :param list xyPoints: List of xy coordinates
        Ex: [[1000,2000],[10000,3000],[7500,6000],[3000,10000]]
    :param int MS: size of points on the plot
    '''

    # Graphs the picture of Summoner's Rift
    img = plt.imread(srFilename)
    fig1, ax1 = plt.subplots()
    ax1.imshow(img)
    ax1.imshow(img, extent=[MIN_X, MAX_X, MIN_Y, MAX_Y])

    # Separates the x-positions from the y-positions
    xpos = list(i[0] for i in xyPoints)
    ypos = list(i[1] for i in xyPoints)

    # Plots the given positions onto Summoner's Rift
    plotLine(xpos,ypos,'w', MS)

    # Annotates each of the coordinates sequentially starting from 1
    posArray = annotateArray(len(xpos))
    for i, txt in enumerate(posArray):
        ax1.annotate(txt, xy = (xpos[i],ypos[i]), va = "center", ha = "center")

def complexPlot(xyList, timestamps = [], annotate = 'yes', MS = 15):
    '''
    Plots a list of a list of points on Summoner's Rift

    :param list xyList: List of list of xy coordinates
        Ex: [[[1000, 2000], [10000, 3000], [7500, 6000], [3000, 8000]],
             [[3000, 4000], [3000, 10000], [6000, 6000], [9000, 8000]],
             [[5000, 2000], [8000, 5000], [6000, 7000], [2000, 11000]]]
    :param str annotate: whether or not the points should be annotated with
        numbers
    :param int MS: size of points on the plot
    '''

    # Catches some of the basic exceptions
    if not (isinstance(xyList, list)):
        raise Exception("error 1")

    if not (isinstance(xyList[0], list)):
        raise Exception("error 2")

    if (isinstance(xyList[0][0], int)):
        basicPlot(xyList)
        raise Exception("complexPlot function was ran with data for basicPlot")
#    elif not (isinstance(xyList[0][0], list)):
#        raise Exception("error 3")

    # Graphs the picture of Summoner's Rift
    img = plt.imread(srFilename)
    fig1, ax1 = plt.subplots()
    ax1.imshow(img)
    ax1.imshow(img, extent=[MIN_X, MAX_X, MIN_Y, MAX_Y])

    # Plots the given positions onto Summoner's Rift with annotated numbers
    for i in range(0, len(xyList)):
        xpos = list(j[0] for j in xyList[i])
        ypos = list(j[1] for j in xyList[i])
        plotLine(xpos, ypos, colorArray[i], MS)

        if (annotate == 'yes'):
            posArray = annotateArray(len(xpos))
            for j, txt in enumerate(posArray):
                ax1.annotate(txt, xy=(xpos[j],ypos[j]), va = "center", ha="center")

    plt.title(str(len(xpos)) + ' Similar Paths Identified')
    if not(timestamps == []):
        plt.legend(timestamps)

def weightedPlot(xyList, weight, timestamps = [], annotate = 'yes', MS = 15):
    '''
    Plots a list of a list of points on Summoner's Rift

    :param list xyList: List of list of xy coordinates
        Ex: [[[1000, 2000], [10000, 3000], [7500, 6000], [3000, 8000]],
             [[3000, 4000], [3000, 10000], [6000, 6000], [9000, 8000]],
             [[5000, 2000], [8000, 5000], [6000, 7000], [2000, 11000]]]
    :param str annotate: whether or not the points should be annotated with
        numbers
    :param int MS: size of points on the plot
    '''

    # Catches some of the basic exceptions
    if not (isinstance(xyList, list)):
        raise Exception("error 1")

    if not (isinstance(xyList[0], list)):
        raise Exception("error 2")

    if (isinstance(xyList[0][0], int)):
        basicPlot(xyList)
        raise Exception("complexPlot function was ran with data for basicPlot")
#    elif not (isinstance(xyList[0][0], list)):
#        raise Exception("error 3")

    # Graphs the picture of Summoner's Rift
    img = plt.imread(srFilename)
    fig1, ax1 = plt.subplots()
    ax1.imshow(img)
    ax1.imshow(img, extent=[MIN_X, MAX_X, MIN_Y, MAX_Y])

    # Plots the given positions onto Summoner's Rift with annotated numbers
    for i in range(0, len(xyList)):
        xpos = list(j[0] for j in xyList[i])
        ypos = list(j[1] for j in xyList[i])
        if not(i == len(xyList) - 1):
            plotLine(xpos, ypos, colorArray[i], MS)
        else:
            for j in range(0,len(xpos)):
                plotLine(xpos[j], ypos[j], colorArray[i], MS, weight[j])

        if (annotate == 'yes'):
            posArray = annotateArray(len(xpos))
            for j, txt in enumerate(posArray):
                ax1.annotate(txt, xy=(xpos[j],ypos[j]), va = "center", ha="center")

    plt.title(str(len(xpos)) + ' Similar Paths Identified')
    if not(timestamps == []):
        plt.legend(timestamps)

def plotLine(xpos,ypos,col, MS, o = 1):
    '''Plots a line given an array of x positions, y positions, and a color'''

    plt.plot(xpos, ypos, 'o', ms = MS, color = col, alpha = o)

def annotateArray(length):
    '''
    Generates an array that counts starting from 1 to the specified length
    '''

    # Initializes annotation array
    annotatedArray = []
    count = 1;
    if(length == 0):
        return annotatedArray
    # Creates annotation array
    while count <= length:
        annotatedArray.append(count)
        count += 1
    return annotatedArray

def srPlot(compData, matchId = "", MS = 15):
    '''
    Placeholder function for the comparePaths script
        Functionality from this function will be reconfigured for more generic
        use
    '''

    refId = compData[compData['difference'] == compData['difference'].min()].iloc[0][0]
    refPos = compData[compData['matchId'] == refId]['pos'].values
    testPos = compData[compData['matchId'] == matchId]['pos'].values

    bPos = refPos.tolist()
    rPos = testPos.tolist()

    # Divides up the
    bx = list(i[0] for i in bPos[0])
    by = list(i[1] for i in bPos[0])
    rx = list(i[0] for i in rPos[0])
    ry = list(i[1] for i in rPos[0])

    # Graphs Summoner's Rift
    img = plt.imread(srFilename)
    fig1, ax1 = plt.subplots()
    ax1.imshow(img)
    ax1.imshow(img, extent=[MIN_X, MAX_X, MIN_Y, MAX_Y])

    # Plots the given coordinates in the X and Y arrays
    plt.plot(bx,by,'o', ms = MS, color= 'blue')
    plt.plot(rx,ry,'o', ms = MS, color = 'red')

    # Annotates each of the coordinates with the appropriate timestamp numbers
    posArray = annotateArray(len(bx))
    print(posArray)
    for i, txt in enumerate(posArray):
        ax1.annotate(txt, xy = (bx[i],by[i]), va = "center", ha = "center")
        ax1.annotate(txt, xy = (rx[i],ry[i]), va = "center", ha = "center")

    # I want to add a champion column to my initial getData function, so I can
    #   have champion names instead of participant ids in the graph title
    bChamp = "Participant " + str(compData[compData['matchId'] == \
                                           refId].iloc[0][1])
    rChamp = "Participant " + str(compData[compData['matchId'] == \
                                           matchId].iloc[0][1])

    plt.title(str(bChamp) + ' (' + str(refId) + ") vs " + \
                  str(rChamp) + ' (' + str(matchId) + ')')
