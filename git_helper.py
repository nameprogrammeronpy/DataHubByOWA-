import subprocess
import os

os.chdir(r'C:\Users\Almaz\PycharmProjects\Dat')

with open('git_result.txt', 'w', encoding='utf-8') as f:
    # Добавляем все файлы
    result = subprocess.run(['git', 'add', '-A'], capture_output=True, text=True)
    f.write(f"git add: {result.returncode}\n{result.stdout}\n{result.stderr}\n\n")

    # Коммит
    result = subprocess.run(['git', 'commit', '-m', 'Add GZip compression and lazy loading for speed'], capture_output=True, text=True)
    f.write(f"git commit: {result.returncode}\n{result.stdout}\n{result.stderr}\n\n")

    # Пуш
    result = subprocess.run(['git', 'push', 'origin', 'main'], capture_output=True, text=True)
    f.write(f"git push: {result.returncode}\n{result.stdout}\n{result.stderr}\n")

print("Done! Check git_result.txt")

