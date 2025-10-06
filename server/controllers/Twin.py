MOD = 10007

fst = input()
snd = input()
len_fst = len(fst)
len_snd = len(snd)


minTwin = ""
found = False
for i in range(0, len_fst-1,2):
    if found:
        minTwin+="0"
        continue
    if fst[i]<fst[i+1]:
        minTwin+=str(int(fst[i])+1)
        found = True
    else:
        minTwin+=fst[i]

maxTwin = ""
found = False
for i in range(0, len_snd-1,2):
    if found:
        maxTwin+="9"
        continue
    if snd[i]<snd[i+1]:
        maxTwin+=snd[i]
        found = True
    else:
        maxTwin+=snd[i]
MOD = 10007
print((int(maxTwin)-int(minTwin)+1)%MOD)