import subprocess
import os

os.chdir(r'C:\Users\Almaz\PycharmProjects\Dat')

# Проверяем файлы в git
result = subprocess.run(['git', 'ls-files', 'data/PREVIEW/'], capture_output=True, text=True)
files = result.stdout.strip().split('\n')
print(f"Файлов PREVIEW в git: {len(files)}")
print("Первые 5:", files[:5])

# Проверяем статус
result = subprocess.run(['git', 'status', '--short'], capture_output=True, text=True)
print("\nСтатус:", result.stdout[:500] if result.stdout else "Чисто")

