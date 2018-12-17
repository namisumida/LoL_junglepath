# -*- coding: utf-8 -*-
"""
Created on Fri Oct 26 16:03:14 2018

@author: Stephen Downhower

Input: Query
Output: matchId, partId, role dataframe
"""

# Constants
filename = 'compData.pkl'
dataPath = 'C:\\Users\\sdownhowerAdmin\\Documents\\GitHub\\FallJungleProject\\Data\\'

# Import Statements
import pandas as pd
import numpy as np

endTime = 6

## GET DATA    
# Imports the necessary functions from roleScript
from roleScript import query, roleFinder

# Utilizes the functions to get and return the heartbeat and role data
hbData = query()
roleData = roleFinder()

## PROCESS DATA
# Filters out the heartbeat data for participants who are not the jungler
jngData = roleData[roleData['role'] == 'JNG']
hbData = hbData.merge(jngData[['matchId','participantId','role']], \
                      how='left', on=['matchId','participantId'])
hbData = hbData[hbData['role'] == 'JNG']

# Creates a new DataFrame, posData, which contains three columns: matchId,
#   participantId, and pos (contains one array of the position data from
#   the heartbeat data)
hbData['pos'] = hbData.apply(lambda r: [r.positionx,r.positiony], axis=1)
posData = pd.DataFrame(hbData.groupby(['matchId','participantId'])['pos'].sum()).reset_index()

# Breaks up the pos column array into multiple numpy arrays
timestamps = list(set(hbData['timestamp_minute'].values))
posData['pos'] = posData.apply(lambda r: np.split(np.array(r.pos), len(timestamps)), axis=1)

## COMPARE DATA
# Filters out red side junglers for a more accurate comparison
#   NOTE: I do not want to compare blue side paths to red side paths right
#   now, but I should definitely add functionality for comparing red side 
#   to red side. Looking for input on this.
compData = posData[posData['participantId']<=5]

ref = posData.iloc[0][0]
refPos = compData[compData['matchId'] == ref]['pos']   
matchIds = list(compData['matchId'].values)

def findDist(ref,test):
    '''Calculates the distance between two points given as a numpy array'''
    distance = []
    for i in range(0, endTime):
        distance.append(round(np.linalg.norm(ref.iloc[0][i] - \
                                             test.iloc[0][i]),2))
    return distance;

# Loops through the position data to calculate distance relative to the 
#   reference path, and adds a new column, distance, to posData
distance = []    
for i in range(0, len(matchIds)):
    distance.append(findDist(refPos, compData[compData['matchId'] == \
                                             matchIds[i]]['pos']))
compData["distance"] = distance

# Loops through the position data to calculate overall difference relative 
#   to the reference path, and adds a new column, distance, to posData
difference = []
for i in range(0, len(matchIds)):
    # difference.append(calcDifference(compData.iloc[i][3]))
    difference.append(np.mean(compData.iloc[i][3]))
compData["difference"] = difference

picklePath = dataPath + filename
compData.to_pickle(picklePath)

from srPlot import srPlot
srPlot(compData, 2695194284)