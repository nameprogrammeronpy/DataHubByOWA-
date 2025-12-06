import subprocess
import os

os.chdir(r'C:\Users\Almaz\PycharmProjects\Dat')

with open('git_result.txt', 'w', encoding='utf-8') as f:
    # Проверяем файлы PREVIEW в git
    result = subprocess.run(['git', 'ls-files', 'data/PREVIEW/'], capture_output=True, text=True)
    files = result.stdout.strip().split('\n') if result.stdout.strip() else []
    f.write(f"Files in git PREVIEW: {len(files)}\n")
    f.write('\n'.join(files[:10]) + '\n\n')

    # Проверяем kazgasa
    f.write(f"kazgasa in git: {'kazgasa.jpeg' in result.stdout}\n")


print("Done! Check git_result.txt")

