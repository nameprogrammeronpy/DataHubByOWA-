import subprocess
import os

os.chdir(r'C:\Users\Almaz\PycharmProjects\Dat')

# Проверяем файлы в git
result = subprocess.run(['git', 'ls-files', 'data/PREVIEW/'], capture_output=True, text=True)
files = result.stdout.strip().split('\n') if result.stdout.strip() else []

with open('git_check_result.txt', 'w', encoding='utf-8') as f:
    f.write(f"Файлов PREVIEW в git: {len(files)}\n")
    f.write("Файлы:\n")
    for file in files:
        f.write(f"  {file}\n")

    # Проверяем локальные файлы
    local_files = os.listdir('data/PREVIEW/')
    f.write(f"\nЛокальных файлов PREVIEW: {len(local_files)}\n")

    # Находим что не в git
    git_basenames = [os.path.basename(f) for f in files]
    missing = [f for f in local_files if f not in git_basenames]
    f.write(f"\nНе в git ({len(missing)}):\n")
    for m in missing:
        f.write(f"  {m}\n")

print("Done! Check git_check_result.txt")


