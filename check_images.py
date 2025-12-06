import json
import os

# Загружаем JSON
with open('data/universities.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Получаем список файлов в PREVIEW
preview_files = os.listdir('data/PREVIEW')
preview_lower = {f.lower(): f for f in preview_files}

print(f"Всего фото в PREVIEW: {len(preview_files)}")
print(f"Всего университетов: {len(data['universities'])}")
print("\n--- Проверка путей к фото ---")

for uni in data['universities']:
    img = uni.get('image_url', '')
    uni_id = uni['id']
    name = uni['name_ru'][:40]

    if img.startswith('/preview/'):
        # Проверяем существует ли файл
        filename = img.replace('/preview/', '')
        if filename in preview_files:
            print(f"ID {uni_id}: OK - {filename}")
        else:
            print(f"ID {uni_id}: MISSING FILE - {filename}")
    else:
        print(f"ID {uni_id}: NO LOCAL - {name}")

