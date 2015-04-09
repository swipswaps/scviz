### COMP 150-VAN Final Project: Visualizing The Supreme Court
### George Brown and Skyler Tom, April 2015
### Plot justices votes (majority/plurality, dissent, regular concurrence, special concurrence) by year
import mpld3
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("../data/washuDB/justice-centered/SCDB_2014_01_justiceCentered_Vote.csv", encoding="iso-8859-1")

## Justices to compare:
justices = ["AScalia"]

## Final data that we'll plot
alldata = pd.DataFrame()

## Get voting info for every yeat a given justice was on the court
def addJustice(justiceName):
	df2 = df[df["justiceName"].isin([justiceName])]
	myData = df2.loc[:,["vote","justiceName","term"]]
	global alldata
	for i in range(1,5):
		df3 = myData[myData["vote"].isin([i])]
		for year in range(1946,2014):
			counter = df3[df3["term"].isin([year])]
			if counter["vote"].count() != 0:
				if i == 1:
					decStr = "Voted w/ majority or plurality"
				elif i == 2:
					decStr = "Dissent"
				elif i == 3:
					decStr = "Regular concurrence"
				else:
					decStr = "Special concurrence"
				alldata.loc[year, decStr] = counter["vote"].count()
				#print("in year " + str(year) + ", " + justice1 + " voted " + str(i) + " " + str(counter["vote"].count()) + " times.")

## Now, call addJustice for all justices we'll be comparing
for justice in justices:
	addJustice(justice) ##### TODO: ONLY WORKS FOR ONE JUSTICE NOW!

alldata.fillna(0, inplace=True) ## Replace NaNs with zeroes
alldata.plot()
plt.show()

