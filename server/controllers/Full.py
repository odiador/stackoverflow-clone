x = input()
mp = {}
for value in x:
    if value in mp:
        mp[value] += 1
    else:
        mp[value] = 1
found3 = False
found2 = False
for key in mp:
    if(mp[key] == 3):
        found3 = True
    if(mp[key] == 2):
        found2 = True
if(found3 and found2):
    print("YES")
else:
    print("NO")