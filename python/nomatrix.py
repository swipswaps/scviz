### George Brown and Skyler Tom, Spring 2015
### COMP 150-VAN Final Project
### Scrape & create adj list for citation network
############################# LIBRARIES ##############################
import re
import numpy
import pandas as pd
import requests
from bs4 import BeautifulSoup
import json
import ast
import csv

########################## CONSTANTS & GLOBALS ######################
base = "http://caselaw.lp.findlaw.com/scripts/"
myreg = re.compile('(\d{1,3}\s{1,3}U.\s{0,1}S.(\s|,\sat\s)\d{1,3})')
numnames = {}
listorder = []
newcitedict = {}  ## to convert new citations to old style, using SCDB
citestonames = {} ## to convert any US citation to its full name, eg "Brown v. Board of Education"

######################### FILE RESOURCES TO USE #####################


with open("alllinks.txt","r") as f:
	for line in f:
		linkdata = ast.literal_eval(line)
with open('dockettoUSbest.csv', mode='r') as infile:
    reader = csv.reader(infile)
    newcitedict = {rows[0]:rows[1] for rows in reader}
with open('uscitestonamesgood.csv', mode='r') as infile:
    reader = csv.reader(infile)
    citestonames = {rows[0]:rows[1] for rows in reader}
######################### SCRAPE + POPULATE MATRIX ##################

def getAllData(linkdata):
	count = 0
	theycite = {}
	global numnames, listorder, base
	for year in range(1890, 1997):  ### at 1998, shit gets F**KED! --> start ~1800
		array = linkdata[year]
		for uri in array:
			url = base + uri
			try:
				r = requests.get(url)
			except requests.exceptions.RequestException as e:
				print(e)
				continue
			try:
				dumbvarnames = r.content.decode("utf-8")
			except UnicodeDecodeError:
				print("bad decode! trying iso-8859-1...........")
				dumbvarnames = r.content.decode("iso-8859-1")
			html = BeautifulSoup(r.content)
			try:
				actualname = uri.rsplit("&vol=",1)[1]
				actualname = actualname.replace("&invol="," U.S. ")
				try:
					caseName = citestonames[actualname]
				except KeyError:
					try:
						print("KeyError, doing dumb way")
						caseName = html.select("h3")[0]
						caseName = str(caseName)
						caseName = caseName.replace("\r","").lstrip()
						thiscase = myreg.findall(caseName)
						caseName = caseName.replace("<h3>","").replace("</h3>","")
						thiscase = [x[0] for x in thiscase]
						actualname = thiscase[0].replace("\n","").replace("\r","")
					except IndexError:
						print("legitly missed this one")
						continue
				cited = myreg.findall(dumbvarnames)
				mylist = [z[0] for z in cited]
				mylist = [z.replace("\n","").replace("\r","").replace(", at","") for z in mylist]
				theycite[actualname] = []
				numnames[actualname] = caseName.lstrip()
				listorder.append(actualname)
				for case in mylist:
					theycite[actualname].append(case)
				if not mylist:
					print("my list was empty, adding this case")
					theycite[actualname].append(actualname)
					# finalmatrix.loc[actualname,[actualname]] = 1
				print(caseName + " added, in year " + str(year))
				count += 1
			except IndexError:
				print("IndexError on " + str(html.select("h3")) + " in year " + str(year))
				print("=======================")
				continue
	print("done up to '97, total count, START_YEAR to END_YEAR: " + str(count))
	base = "http://caselaw.lp.findlaw.com"
	for year in range(1997,2013):	### For new citation style, XX-XXXXX
		array = linkdata[year]
		for uri in array:
			url = base + uri
			try:
				r = requests.get(url)
			except requests.exceptions.RequestException as e:
				print(e)
				continue
			html = BeautifulSoup(r.content)
			html = html.get_text()
			try:
				newcasecitefromuri = uri.rsplit("&invol=",1)[1]
				try:
					actualname = newcitedict[newcasecitefromuri]
					caseName = citestonames[actualname]
				except KeyError:
					try:
						newcasecitefromuri = newcasecitefromuri.replace("-","")
						actualname = newcitedict[newcasecitefromuri]
						caseName = citestonames[actualname]
					except KeyError:
						if year == 1997:
							try:
								actualname = uri.rsplit("&vol=",1)[1]
								actualname = actualname.replace("&invol="," U.S. ")
								try:
									caseName = citestonames[actualname]
								except KeyError:
									print("keyerror: unable to match docket to citation") ### can incorporate some sort of querying, but this is tough.
									continue
							except IndexError:
								continue
				cited = myreg.findall(html)
				mylist = [z[0] for z in cited]
				mylist.append(actualname)
				mylist = [z.replace("\n","").replace("\r","").replace(", at","") for z in mylist]
				mylist = [w.replace("U.\xa0S.", "U.S.") for w in mylist]
				theycite[actualname] = []
				numnames[actualname] = caseName ## don't need to strip here!
				listorder.append(actualname)
				for case in mylist:
					theycite[actualname].append(case)
				if not mylist:
					print("mylist was empty, adding this case [[this is impossible]]")
					theycite[actualname].append(actualname)
				print(caseName + " added, in year " + str(year))
				count += 1
			except IndexError:
				print("indexerr line 149")
				continue
	return theycite

def toArrays(theycite):
	global listorder
	theyrecitedby = {}
	finaljson = "{"
	length = len(theycite)
	print("LENGTH SHOULD BE COUNT. IT IS: " + str(length))
	for case, cited in theycite.items():
		for citedcase in cited:
			if citedcase in theyrecitedby:
				theyrecitedby[citedcase].append(case)
			else:
				theyrecitedby[citedcase] = []
				theyrecitedby[citedcase].append(case)
	return theyrecitedby

theycitedict = getAllData(linkdata)
print("ALL CASES LOADED INTO dictionary theycitedict, calculating other direction...")
theyrecitedbydict = toArrays(theycitedict)
with open('theycite.txt', 'w') as outfile:
    json.dump(theycitedict, outfile)

with open('citedby.txt', 'w') as thisfile:
    json.dump(theyrecitedbydict, thisfile)

with open("mastercaselist1890-pres.json", "w") as filename:
	json.dump(numnames, filename)
print("done.")
