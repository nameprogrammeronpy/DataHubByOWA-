import json
import os

# Загружаем JSON
with open('data/universities.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Получаем список файлов в PREVIEW
preview_files = os.listdir('data/PREVIEW')

# Маппинг университетов к фото
photo_mapping = {
    16: "KARTU.jpg",  # Карагандинский технический
    17: "UKAZU M AUEZOV.jpeg",  # Южно-Казахстанский Ауэзов
    18: "KAZAITU.jpeg",  # Казахский агротехнический Сейфуллина
    19: "ЗКГУ_-_Главный_корпус.jpg",  # Западно-Казахстанский Утемисов
    20: "UTEByev ATYRAU.jpeg",  # Атырауский нефти и газа Утебаев
    21: "ZHUBANOV.jpeg",  # Актюбинский Жубанов
    22: "Павлодарский гос.jpg",  # Павлодарский Торайгыров
    23: "Семипалатинский гос.png",  # Семипалатинский Шакарим
    24: "KGU baitusinov.jpg",  # Костанайский Байтурсынов
    25: "TARAZ.png",  # Таразский Дулати
    26: "korkyt0png.png",  # Кызылординский Коркыт Ата
    27: "medvuz-astana-e1524630777409.jpg",  # Медицинский Астана
    28: "OSPANOV.jpeg",  # Западно-Казахстанский медицинский Оспанов
    29: "Здание_Медицинского_Университета_Караганды.jpg",  # Карагандинский медицинский
    31: "suleyman.jpg",  # СДУ
    32: "ALMAU.jpg",  # Алматы Менеджмент
    33: "KAZGASA.jpeg",  # КазГАСА
    34: "КазНАУ.jpg",  # КазНАУ аграрный
    35: "JENPU.jpg",  # Женский педагогический
    36: "TEmirbek zhurgenov.jpeg",  # Жургенов искусств
    37: "KURMANGAZY.jpg",  # Консерватория Курмангазы
    40: "КазУМОиМЯ.jpg",  # КазУМОиМЯ Абылай хан
    41: "KAZGUY.png",  # КазГЮУ
    42: "MIRAS.jpeg",  # МИРАС
    43: "INEY.png",  # Инновационный Евразийский
    44: "VKO TECHNO.jpeg",  # ВКО Технический Серикбаев
    45: "SKO KOZYBAYEV.jpg",  # СКО Козыбаев
    47: "Zhansigurov.jpeg",  # Жетысуский Жансугуров
    48: "TURAN ASTANA.png",  # Туран-Астана
    50: "AUES.jpeg",  # АУЭС Даукеев
    51: "KAZUputei i soobsenia.jpeg",  # Пути сообщения
    55: "Zhangi han.jpg",  # Жангир хан
    56: "ALT.jpeg",  # Академия логистики
    57: "UIB.jpg",  # Университет международного бизнеса
    58: "Yessenov_University.jpg",  # Есенов
    60: "SATPAEV.jpg",  # Сатпаев
}

# Обновляем JSON
updated = 0
for uni in data['universities']:
    uni_id = uni['id']
    if uni_id in photo_mapping:
        uni['image_url'] = f"/preview/{photo_mapping[uni_id]}"
        updated += 1
        print(f"Updated ID {uni_id}: /preview/{photo_mapping[uni_id]}")

# Сохраняем
with open('data/universities.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\nОбновлено {updated} университетов")

