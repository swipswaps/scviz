### COMP 150-VAN Final Project: Visualizing The Supreme Court
### George Brown and Skyler Tom, April 2015
### Plot how often a justice votes with majority on 5-4 decision
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("../data/washuDB/justice-centered/SCDB_2014_01_justiceCentered_Vote.csv", encoding="iso-8859-1")

## Justices to compare:
justices = ["SGBreyer","AMKennedy"]

## Get voting info for every yeat a given justice was on the court
def addJustice(justiceName):
	df2 = df[df["justiceName"].isin([justiceName])]
	# df2 is a df with only votes for this particular justice
	# myData limits that to just majVotes, etc; alldata is an empty DF
	myData = df2.loc[:,["majVotes","vote","justiceName","term","majority"]]
	alldata = pd.DataFrame()
	for i in range(1,3):
		df3 = myData[myData["majority"].isin([i])]  ## 1 == dissent; 2 == majority
		df4 = df3[df3["majVotes"].isin([4,5])]   ### IMPORTANT: ONLY 5-4 decisions!
		for year in range(1946,2014):
			counter = df4[df4["term"].isin([year])]
			if counter["majority"].count() != 0:       ### did the justice even vote this year?
				if i == 2:
					decStr = "Voted w/ majority or plurality"
				elif i == 1:
					decStr = "Dissent"
				alldata.loc[year, decStr] = counter["majority"].count()
	return alldata

## Now, call addJustice for all justices we'll be comparing
for justice in justices:
	x = addJustice(justice)
	x.fillna(0, inplace=True) ## Replace NaNs with zeroes
	x.plot()

plt.show()

