# from nltk.corpus import inaugural
import nltk
import os
from nltk.corpus import PlaintextCorpusReader

corpus_root = "../data/supremecourt.gov/stripped"
wordlists = PlaintextCorpusReader(corpus_root, ".*")


# mylist = os.listdir("tester")
# print(mylist)
# [fileid[7:11] for fileid in wordlists]

cfd = nltk.ConditionalFreqDist(
	(target, fileid[7:11])
	for fileid in wordlists.fileids()
	for w in wordlists.words(fileid)
	#with open(fileid) as f:
	#	allwords = f.read().split()
	for target in ['thurgood', 'citizen']
	if w.lower().startswith(target))
cfd.plot()

