import os

PATH = os.path.abspath('../data/justice-centered/justicevotes/')

for file_name in os.listdir(PATH):
    # we know that first two characters are numbers
    newname = PATH +"/"+ file_name + ".csv"
    oldname = PATH +"/"+ file_name
    print newname
    print oldname
    os.rename(oldname, newname)
