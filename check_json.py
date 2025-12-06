import json

with open('data/universities.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

unis = data['universities']
print(f"Total: {len(unis)}")

required = ['founded_year', 'rector', 'achievements', 'financial_aid', 'exchange_programs']

results = []
for uni in unis:
    uid = uni.get('id', 0)
    if uid <= 15:
        missing = [f for f in required if f not in uni]
        status = "OK" if not missing else f"MISSING: {missing}"
        results.append(f"ID {uid}: {status}")

with open('check_result.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(results))

print("Saved to check_result.txt")

