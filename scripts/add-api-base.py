import os
import sys
import platform


def open_file_in_default_editor(file_path):
    """
    Open a file in the default editor for the current platform.
    """
    os.system(f'code "{file_path}"')  # for Visual Studio Code

    if platform.system() == 'Darwin':  # macOS
        os.system(f'open "{file_path}"')
    elif platform.system() == 'Windows':  # Windows
        os.system(f'start "" "{file_path}"')
    else:
        print('Unsupported platform')
        sys.exit(1)


def add_api_base_to_file(file_path):
    """
    Add the line 'openai.api_base = os.environ.get("OPENAI_API_BASE")' to a Python file
    if it contains the line 'openai.api_key'.
    """
    with open(file_path, 'r') as f:
        lines = f.readlines()

    api_key_set = False
    lines_added = 0
    for i, line in enumerate(lines):
        if 'openai.api_key' in line:
            api_key_set = True
            # get the indentation of the line
            indentation = line.split('openai.api_key')[0]
        if api_key_set and 'openai.api_base' not in line:
            print('\nPotential spot found!')
            print(f'File: {file_path}\nLine {i}: {line.strip()}')
            response = input('Do you want to open the file? (y/n) ')
            if response.lower() == 'y':
                # open the file in the default editor
                open_file_in_default_editor(file_path)
            response = input(
                'Do you want to add "openai.api_base = os.environ.get("OPENAI_API_BASE")"? (y/n) ')
            if response.lower() == 'y':
                new_line = f'{indentation}openai.api_base = os.environ.get("OPENAI_API_BASE")\n'
                # insert the new line after the current line
                lines.insert(i+1, new_line)
                with open(file_path, 'w') as f:
                    f.writelines(lines)  # write the modified lines to the file
                    print('API base added to file')
                lines_added += 1
            break

    print(f"Scanned {file_path}, {lines_added} lines added.")


def scan_directory_for_files(directory_path):
    """
    Recursively scan a directory for Python files and call 'add_api_base_to_file'
    on each file found.
    """
    for dirpath, _, filenames in os.walk(directory_path):
        for filename in filenames:
            if filename.endswith('.py'):
                file_path = os.path.join(dirpath, filename)
                print(f'\nProcessing file: {file_path}')
                add_api_base_to_file(file_path)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Usage: python add_api_base.py <path-to-project-folder>')
        sys.exit(1)

    project_folder = sys.argv[1]
    if not os.path.isdir(project_folder):
        print(f'{project_folder} is not a directory')
        sys.exit(1)

    scan_directory_for_files(project_folder)
