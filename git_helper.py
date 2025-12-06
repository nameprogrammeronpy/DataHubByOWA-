import subprocess
import os
import sys

os.chdir(r'C:\Users\Almaz\PycharmProjects\Dat')

# Добавляем все файлы
result = subprocess.run(['git', 'add', '-A'], capture_output=True, text=True)
print("git add:", result.returncode)

# Коммит
result = subprocess.run(['git', 'commit', '-m', 'Add GZip compression and lazy loading for speed'], capture_output=True, text=True)
print("git commit:", result.returncode, result.stdout[:200] if result.stdout else "", result.stderr[:200] if result.stderr else "")

# Пуш
result = subprocess.run(['git', 'push', 'origin', 'main'], capture_output=True, text=True)
print("git push:", result.returncode, result.stdout[:200] if result.stdout else "", result.stderr[:200] if result.stderr else "")

