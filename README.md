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

Converts selected lines into banners using figlet. Some file formats will also automatically wrap the banner in a block comment (See at the end of the README for a list of supported file formats).

###Commands:

- __"Apply"__: Converts the selected lines into banner comments.

![feature 'Apply'](images/banner-comments-apply.gif)

- __"Set font"__: Sets the figlet font to use.

![feature 'Apply'](images/banner-comments-set-font.gif)

NOTE: Also supports multi-line selections:

![feature 'Apply'](images/banner-comments-multi-line.gif)

## Requirements

None!

## Extension Settings

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