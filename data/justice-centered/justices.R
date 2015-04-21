justicevotes = read.csv("SCDB_2014_01_justiceCentered_Vote.csv")
#justicevotes is the large dataframe containing data for each vote
#Get the list of unique names
for (name in levels(justicevotes$justiceName)){
  #Subset the data by MP
  #tmp=subset(justicevotes,justiceName==name)
  #Create a new filename for each MP - the folder 'mpExpenses2012' should already exist
  #fn=paste('justicevotes/',gsub(' ','',name),sep='')
  #Save the CSV file containing separate expenses data for each MP
  write.csv(tmp,fn,row.names=FALSE)
}
