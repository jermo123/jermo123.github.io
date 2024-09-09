import webview
import os
import sys

def open_folder(path):
    if os.name == 'nt':  # Check if the OS is Windows
        os.startfile(path)
    elif os.name == 'posix':  # For macOS or Linux
        subprocess.call(('open' if sys.platform == 'darwin' else 'xdg-open', path))

def main():
    window = webview.create_window('My App', 'index.html')
    window.expose(open_folder)
    webview.start()

if __name__ == '__main__':
    main()
