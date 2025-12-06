import json
import os
from urllib.parse import quote

# Загружаем JSON
with open('data/universities.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Получаем список файлов в PREVIEW
preview_files = os.listdir('data/PREVIEW')

# Обновляем URL с правильной кодировкой
updated = 0
for uni in data['universities']:
    img = uni.get('image_url', '')
    if img.startswith('/preview/'):
        filename = img.replace('/preview/', '')
        if filename in preview_files:
            # URL-encode filename для правильной загрузки
            encoded = quote(filename)
            new_url = f"/preview/{encoded}"
            if new_url != img:
                uni['image_url'] = new_url
                updated += 1
                print(f"Encoded ID {uni['id']}: {filename} -> {encoded}")

# Сохраняем
with open('data/universities.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\nОбновлено {updated} URL")

