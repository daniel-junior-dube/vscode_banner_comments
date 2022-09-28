```
██████╗  █████╗ ███╗   ██╗███╗   ██╗███████╗██████╗
██╔══██╗██╔══██╗████╗  ██║████╗  ██║██╔════╝██╔══██╗
██████╔╝███████║██╔██╗ ██║██╔██╗ ██║█████╗  ██████╔╝
██╔══██╗██╔══██║██║╚██╗██║██║╚██╗██║██╔══╝  ██╔══██╗
██████╔╝██║  ██║██║ ╚████║██║ ╚████║███████╗██║  ██║
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝



 ██████╗ ██████╗ ███╗   ███╗███╗   ███╗███████╗███╗   ██╗████████╗███████╗
██╔════╝██╔═══██╗████╗ ████║████╗ ████║██╔════╝████╗  ██║╚══██╔══╝██╔════╝
██║     ██║   ██║██╔████╔██║██╔████╔██║█████╗  ██╔██╗ ██║   ██║   ███████╗
██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   ╚════██║
╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   ███████║
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝
```

## Features

Converts selected lines into banners-comments headers using figlet.
( Automatically wrapped with comment tag! )

### Commands:

- __"Apply from list"__: Transform selected text into a figlet font selected from the list of available options!
- __"Apply <h1|h2|h3> font"__: Transform selected text into a figlet font corresponding to a user-defined header type! (h1, h2 or h3)
- __"Apply from favorites"__: Transform selected text into a figlet font selected from the list of favorites!

![feature 'Apply'](images/banner-comments-apply.gif)

- __"Set <h1|h2|h3> font"__: Assign a font for the specified header type!

![feature 'Set font'](images/banner-comments-set-font.gif)

- __"Add to favorites"__: Add a font to the list of favorites so it's easily accessible later!

NOTE: Also supports multi-line selections:

![feature 'Multi-cursor'](images/banner-comments-multi-line.gif)

## Requirements

None!

## Extension Settings

This extension contributes the following settings:

* `banner-comments.h1`: "\<figlet font name\>"
* `banner-comments.h2`: "\<figlet font name\>"
* `banner-comments.h3`: "\<figlet font name\>"
* `banner-comments.favorites`: [ \<figlet font name\>, ... ]
* `banner-comments.figlet.horizontalLayout`: "\<default | full | fitted | controlled smushing | universal smushing\>"
* `banner-comments.figlet.verticalLayout`: "\<default | full | fitted | controlled smushing | universal smushing\>"

## Known Issues

- Only the languages provided by vscode are supported to wrap the banner with comments. Converting to figlet font should still work

## Release Notes

### 0.4.1

__Fixes__:
- Using JSON5 instead of commentJson (error on some file format)
- Code refactoring
- Updated dependencies

__Features__:
- __banner-comments.figlet.whitespaceBreak__: Figlet configuration that, if set to true, will attempt to break up the text on whitespace when limiting the width. https://www.npmjs.com/package/figlet#whitespaceBreak
- __banner-comments.figlet.width__: Figlet configuration that limits the width of the output. Requires `banner-comments.figlet.whitespaceBreak` to be true. https://www.npmjs.com/package/figlet#width

### 0.3.0

__Fixes__:
- Fixed the package.json so the extension keeps working on newer vscode engines
- Code refactoring/simplification

__Features__:
- __Apply from list__: Opens the list of all available figlet fonts and applies the selected one.
- __Add/Remove to favorites__: Choose a font to add to/remove from the list of favorite fonts.
- __Apply from favorites__: Opens the list of favorite fonts and applies the selected one.

__Settings__:
- __banner-comments.figlet.horizontalLayout__: Figlet configuration providing 5 differents layout affecting the width of the font. https://www.npmjs.com/package/figlet#user-content-horizontallayout
- __banner-comments.figlet.verticalLayout__: Figlet configuration providing 5 differents layout affecting the height of the font. https://www.npmjs.com/package/figlet#verticallayout

### 0.2.0

- Fixed indentation issues where only the first line was indented correctly.
- Converted apply and set font to "apply h* font" and "set h* font" with h1, h2 and h3.
- Code cleaned and removed unused dependencies.

### 0.1.0

- Now detects and uses the file's comment tags to wrap the banner text! (Uses the blockComment to wrap the text or puts lineComments in front of each line)
- Auto-trims whitespaces from the end of each line of the banner.

### 0.0.1

Initial release of the 'Banner comments' extension.

-----------------------------------------------------------------------------------------------------------