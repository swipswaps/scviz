import json
import ast
x = {}

with open("mastercaselist1890-pres.json", "r") as infile:
	for line in infile:
		x = ast.literal_eval(line)

# json1_data = json.loads(x)

inv_map = {v: k for k, v in x.items()}

# for key in inv_map.items():
# 	print(key[0])
# 	print(type(key[0]))
# 	y = key[0].rstrip()
# 	print(key[0])
# 	print(key)
# 	exit(1)
clean_d = { k.rstrip():v for k, v in inv_map.items()}

with open("allnamestocitations.json", "w") as output:
	json.dump(clean_d,output)