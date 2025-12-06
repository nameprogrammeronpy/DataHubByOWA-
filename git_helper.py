import subprocess
import os

os.chdir(r'C:\Users\Almaz\PycharmProjects\Dat')

# Добавляем все файлы
result = subprocess.run(['git', 'add', '-A'], capture_output=True, text=True)
print("git add:", result.stdout, result.stderr)

# Коммит
result = subprocess.run(['git', 'commit', '-m', 'Fix: add assets folder creation and gitkeep files'], capture_output=True, text=True)
print("git commit:", result.stdout, result.stderr)

# Пуш
result = subprocess.run(['git', 'push', 'origin', 'main'], capture_output=True, text=True)
print("git push:", result.stdout, result.stderr)

