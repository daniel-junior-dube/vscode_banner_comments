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

### Commands:

- __"Apply h* font"__: Converts the selected lines into an h* (ex: h1) header type banner comments. ( Automatically wrapped with comment tag! )

![feature 'Apply'](images/banner-comments-apply.gif)

- __"Set h* font"__: Sets the figlet font to use for a specific h* (ex: h1) header type.

![feature 'Set font'](images/banner-comments-set-font.gif)

NOTE: Also supports multi-line selections:

![feature 'Multi-cursor'](images/banner-comments-multi-line.gif)

## Requirements

None!

## Extension Settings

This extension contributes the following settings:

* `banner-comments.h1`: "\<figlet font name\>" (Figlet font to use when converting a line to h1 header type.)
* `banner-comments.h2`: "\<figlet font name\>" (Figlet font to use when converting a line to h2 header type.)
* `banner-comments.h3`: "\<figlet font name\>" (Figlet font to use when converting a line to h3 header type.)

## Known Issues

- Only the languages provided by vscode are supported to wrap the banner with comments.

## Release Notes

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