import json
import os

# Загружаем JSON
with open('data/universities.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Получаем список файлов в PREVIEW
preview_files = os.listdir('data/PREVIEW')
print(f"Фото в папке: {len(preview_files)}")
print(f"Университетов: {len(data['universities'])}")

# Маппинг ID университета -> файл фото
photo_mapping = {
    1: "KAZNU.jpg",
    2: "ENU.jpg",
    3: "NU.jpg",
    4: "KBTU.png",
    5: "NARXOZ.jpeg",
    7: "TURAN.jpg",
    9: "ATU.jpeg",
    10: "ABAI PED.jpg",
    11: "ASPHEN.jpg",  # КазНМУ Асфендиярова
    12: "KAZITU.jpeg",  # МУИТ
    13: "ALAKazAGA.jpeg",  # КИМЭП - используем что есть
    14: "AITU.jpeg",
    15: "BUKETOV KARAGANDA.jpg",
    16: "KARTU.jpg",
    17: "UKAZU M AUEZOV.jpeg",
    18: "KAZAITU.jpeg",
    19: "MakhambetUtemisovWestKazakhstan.jpg",
    20: "UTEByev ATYRAU.jpeg",
    21: "ZHUBANOV.jpeg",
    22: "Pavlodargos.jpg",
    23: "Semeygos.png",
    24: "KGU baitusinov.jpg",
    25: "TARAZ.png",
    26: "korkyt0png.png",
    27: "medvuz-astana-e1524630777409.jpg",
    28: "OSPANOV.jpeg",
    29: "Здание_Медицинского_Университета_Караганды.jpg",
    30: "SOUTHMEDIC.jpg",
    31: "suleyman.jpg",
    32: "ALMAU.jpg",
    33: "kazgasa.jpeg",
    34: "KAZNARU.jpg",
    35: "JENPU.jpg",
    36: "TEmirbek zhurgenov.jpeg",
    37: "KURMANGAZY.jpg",
    38: "academyofcivil.jpg",
    39: "Kaspian.jpg",
    40: "KazakhAblaiKhaUniversityofInternationalRelations.jpg",
    41: "KAZGUY.png",
    42: "MIRAS.jpeg",
    43: "INEY.png",
    44: "VKO TECHNO.jpeg",
    45: "SKO KOZYBAYEV.jpg",
    47: "Zhansigurov.jpeg",
    48: "TURAN ASTANA.png",
    49: "kazgasa.jpeg",  # МОК КазГАСА - та же фотка
    50: "AUES.jpeg",
    51: "KazakhUniversityOfRailwayTransport.jpeg",
    53: "MUIT.jpg",  # ЦАУ
    54: "OAIU.jpeg",  # КИТУ
    55: "Zhangi han.jpg",
    56: "ALT.jpeg",
    57: "UIB.jpg",
    58: "Yessenov_University.jpg",
    60: "SATPAEV.jpg",
}

# Обновляем JSON
updated = 0
missing = []
for uni in data['universities']:
    uni_id = uni['id']
    if uni_id in photo_mapping:
        filename = photo_mapping[uni_id]
        if filename in preview_files:
            uni['image_url'] = f"/preview/{filename}"
            updated += 1
        else:
            missing.append(f"ID {uni_id}: файл {filename} не найден!")
    else:
        missing.append(f"ID {uni_id}: нет в маппинге - {uni['name_ru'][:30]}")

# Сохраняем
with open('data/universities.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\nОбновлено: {updated}")
if missing:
    print("\nПроблемы:")
    for m in missing:
        print(f"  {m}")

