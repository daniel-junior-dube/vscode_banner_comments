'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as commentJson from 'comment-json';

import * as figlet from 'figlet';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let bannerCommentApply = vscode.commands.registerCommand('extension.bannerCommentApply', () => {
		// The code you place here will be executed every time your command is executed

		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return vscode.window.showErrorMessage("No active editor (Open a file).");
		}

		let commentTags:any = null;
		try {
			const documentLanguageId:string = editor.document.languageId;
			const excludedLanguagesIds:any[] = ["plaintext"];
			if (!excludedLanguagesIds.includes(documentLanguageId)) {
				let langConfigFilepath:string = null;
				for (const _ext of vscode.extensions.all) {
					if (
						_ext.id.startsWith("vscode.") &&
						_ext.packageJSON.contributes &&
						_ext.packageJSON.contributes.languages
					) {
						const packageLangData = _ext.packageJSON.contributes.languages.find(
							_packageLangData => (_packageLangData.id === documentLanguageId)
						);
						if (!!packageLangData) {
							langConfigFilepath = path.join(
								_ext.extensionPath,
								packageLangData.configuration
							);
							break;
						}
					}
				}
				if (!!langConfigFilepath && fs.existsSync(langConfigFilepath)) {
					/**
					 * unfortunatly, some of vscode's language config contains
					 * comments... ("xml" and "xsl" for example)
					 */
					var langConfig = commentJson.parse(
						fs.readFileSync(langConfigFilepath, "utf8")
					);
					commentTags = langConfig.comments;
				} else {
					console.warn(
						"Banner-comments: No matching vscode language extension found."
					);
				}
			}
		} catch (error) {
			console.error(error);
		}

		const selections:vscode.Selection[] = editor.selections;
		const figletFont:string = vscode.workspace.getConfiguration('banner-comments').get('font');
		const figletConfig:any = {
			font: figletFont,
			horizontalLayout: 'default',
			verticalLayout: 'default'
		};

		editor.edit(builder => {
			for (const selection of selections) {
				var err = null;
				var text:string = null;
				var figletText:string = null;
				var bannerText:string = null;
				try {
					text = editor.document.getText(selection);
					figletText = figlet.textSync(text, figletConfig);
					if (!!commentTags) {
						if (commentTags.blockComment) {
							bannerText = commentTags.blockComment[0] + "\n";
							bannerText += figletText + "\n";
							bannerText += commentTags.blockComment[1];
						} else if (commentTags.lineComment) {
							bannerText = "";
							figletText.split("\n").forEach(_line => {
								bannerText += commentTags.lineComment+_line+"\n";
							});
						} else {
							bannerText = figletText;
						}
					} else {
						bannerText = figletText;
					}
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
		var opts: vscode.QuickPickOptions = {
			matchOnDescription: true,
			placeHolder: "What do you want to do to the selection(s)?"
		};
		var items: vscode.QuickPickItem[] = figlet.fontsSync().map(function (figletFont) {
			return {
				label: figletFont,
				description: "Use the " + figletFont + " font",
			};
		}, this);

		vscode.window.showQuickPick(items).then((selectedPickerItem) => {
			if (!selectedPickerItem) return;
			let config = vscode.workspace.getConfiguration('banner-comments');
			config.update('font', selectedPickerItem.label, true);

			// Debug purposes
			console.log("Updated Banner-comments font setting to '%s'", selectedPickerItem.label);
		});
	});

	context.subscriptions.push(
		bannerCommentApply,
		bannerCommentSetFont
	);
}

// this method is called when your extension is deactivated
export function deactivate() {
}