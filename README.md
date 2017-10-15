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

Converts a select line into a banner using figlet. Some file format will also automatically wrap the banner in a block comment (See at the end of the file for a list of supported file format).

###Commands:

- __"Apply"__: Converts selected line into a banner comment.

![feature 'Apply'](images/banner-comments-apply.gif)

- __"Set font"__: Sets the figlet font to use.

![feature 'Apply'](images/banner-comments-set-font.gif)

NOTE: Also supports multi-line selections:

![feature 'Apply'](images/banner-comments-multi-line.gif)

## Requirements

None!

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `banner-comments.font`: "\<figlet font name\>" (Figlet font to use when converting a line.)

## Known Issues

Only a couple of languages are supported for block comment. Those that are not supported will have to be commented manually.

Here's a list of the supported languages:
- css
- less
- sass
- javascript
- typescript
- json
- html

## Release Notes

### 0.0.1

Initial release of the 'Banner comments' extension.

-----------------------------------------------------------------------------------------------------------