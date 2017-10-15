'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as figlet from 'figlet';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "banner-comments" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let bannerCommentApply = vscode.commands.registerCommand('extension.bannerCommentApply', () => {
        // The code you place here will be executed every time your command is executed

        let editor = vscode.window.activeTextEditor;

        if (!editor) {
            return vscode.window.showErrorMessage("No active editor (Open a file).");
        }

        var blockCommentTags = [ "", "" ];
        switch (editor.document.languageId) {
            case "css":
            case "less":
            case "sass":
            case "javascript":
            case "typescript":
            case "json":
                blockCommentTags = [ "/*", "*/" ];
                break;
            case "html":
                blockCommentTags = [ "<!--", "-->" ];
                break;
            default:
                // Do nothing
        }

        const selections:vscode.Selection[] = editor.selections;

        const font:string = vscode.workspace.getConfiguration('banner-comments').get('font');

        const figletConfig:any = {
            font: font,
            horizontalLayout: 'default',
            verticalLayout: 'default'
        };

        editor.edit(builder => {
            for (const selection of selections) {
                var err = null;
                var text:string = null;
                var bannerText:string = null;
                try {
                    text = editor.document.getText(selection);
                    bannerText = blockCommentTags[0] + "\n";
                    bannerText += figlet.textSync(text, figletConfig)+ "\n";
                    bannerText += blockCommentTags[1];
                } catch (replaceErr) {
                    err = replaceErr;
                } finally {
                    if (err) {
                        vscode.window.showErrorMessage(err.message);
                    } else {
                        builder.replace(selection, bannerText);
                    }
                }
            }
        });
    });

    let bannerCommentSetFont = vscode.commands.registerCommand('extension.bannerCommentSetFont', () => {
        var opts: vscode.QuickPickOptions = { matchOnDescription: true, placeHolder: "What do you want to do to the selection(s)?" };
        var items: vscode.QuickPickItem[] = [];

        figlet.fontsSync().forEach(function (font) {
            items.push({ label: font, description: "User the " + font + " font" });
        }, this);

        vscode.window.showQuickPick(items).then((selectedPickerItem) => {
            if (!selectedPickerItem) {
                return;
            }
            let config = vscode.workspace.getConfiguration('banner-comments');
            config.update('font', selectedPickerItem.label, true);
            console.log("Updated Banner-comments font setting to '%s'", selectedPickerItem.label);
        });
    });

    context.subscriptions.push();
    context.subscriptions.push(
        bannerCommentApply,
        bannerCommentSetFont
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
}