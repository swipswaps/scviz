import pandas as pd
import numpy as np
import csv

mydf = pd.read_csv("stateissueswashugood.csv")

with open('issuesbystate.csv', mode='r') as infile:
    reader = csv.reader(infile)
    d3dict = {rows[1]:rows[0] for rows in reader}

with open('statekeys.csv', mode='r') as infile:
    reader = csv.reader(infile)
    theirkeys = {rows[0]:rows[1] for rows in reader}

# series = mydf.ix[:,"caseOriginState"]
# for number in series.iteritems():
# 	number = 
# print(theirkeys)
# exit(1)
def changeState(theirnum):
	if theirnum == "caseOriginState":
		return theirnum
	else:
		try:
			x = theirkeys[str(theirnum)]
			return d3dict[x.lower()]
		except KeyError:
			return theirnum

mydf = mydf[np.isfinite(mydf['caseOriginState'])]
mydf["caseOriginState"] = mydf["caseOriginState"].astype(int)
mydf = mydf[np.isfinite(mydf['issueArea'])]
mydf["issueArea"] = mydf["issueArea"].astype(int)
# mydf = mydf["caseOriginState"].astype(int)
# print(mydf)
# exit(1)
mydf["caseOriginState"] = mydf["caseOriginState"].apply(changeState)
mydf.columns = ['term','caseName',"id","issueArea"]
mydf.to_csv("wtf.csv")