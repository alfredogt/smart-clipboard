# Smart Clipboard

Smart Clipboard is a desktop application that enhances your system's clipboard functionality by allowing you to access a history of previously copied items.

## Features

- Maintains a history of up to 6 copied items
- Minimalist and transparent interface
- Always visible on top of other windows
- Quick access through keyboard shortcut (Cmd/Ctrl + Shift + V)
- Quick dismiss with Escape key
- Support for normal and form modes
- Borderless and transparent interface for a non-intrusive experience

## Technologies

- Electron
- RobotJS for keyboard automation
- HTML/CSS/JavaScript

## Installation

1. Clone the repository:
```bash
git clone https://github.com/alfredogt/smart-clipboard.git
```

2. Install dependencies:
```bash
cd smart-clipboard
npm install
```

3. Start the application:
```bash
npm start
```

## Usage

1. The application runs in the background and monitors the clipboard
2. Press `Cmd/Ctrl + Shift + V` to show the clipboard history
3. Select an item from the history to paste it
4. Press `Escape` to close the window

## License

ISC
