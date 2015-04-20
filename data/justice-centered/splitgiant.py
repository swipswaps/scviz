# import csv
# from itertools import groupby

# #myfile = csv.reader(open("SCDB_2014_01_justiceCentered_Vote.csv"), dialect=csv.excel_tab)

# for key, rows in groupby(csv.reader(open("SCDB_2014_01_justiceCentered_Vote.csv", 'rU'), dialect=csv.excel_tab), lambda row: row[0]):
#     with open("%s.txt" % key, "w") as output:
#         for row in rows:
#             output.write(",".join(row) + "\n")

from pandas.io.parsers import read_csv
import csv

df = read_csv("SCDB_2014_01_justiceCentered_Vote.csv", encoding = "ISO-8859-1", header=1, sep='\n', index_col=[0])
for (justice_name,x), group in df.groupby(level=[0,1]):
    group.to_csv(justice_name+'.csv')