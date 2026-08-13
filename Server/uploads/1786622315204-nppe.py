n = int(input())
s = "\n".join(input() for _ in range(n))
vowels = "aieouAEIOU"
vowel_list = []
for ch in s:
    if ch in vowels:
        vowel_list.append(ch)
vowel_list.reverse()
result = ""
i = 0
for ch in s:
    if ch in vowels:
        result += vowel_list[i]
        i += 1
    else:
        result += ch
print(result)
