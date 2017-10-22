'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as commentJson from 'comment-json';
import * as figlet from 'figlet';
import * as async from 'async';

/*
 * Loops through the extensions to find the one containing the definition of the provided languageId.
 * Returns the content of the corresponding "language-configuration.json" or the equivalent file.
*/
function getLanguageConfig(languageId:string):any {
	var langConfig:any = null;
	const editor:vscode.TextEditor = vscode.window.activeTextEditor;
	const excludedLanguagesIds:any[] = ["plaintext"];

	if (!excludedLanguagesIds.includes(languageId)) {
		let langConfigFilepath:string = null;
		for (const _ext of vscode.extensions.all) {
			if (
				_ext.id.startsWith("vscode.") &&
				_ext.packageJSON.contributes &&
				_ext.packageJSON.contributes.languages
			) {
				const packageLangData:any = _ext.packageJSON.contributes.languages.find(
					_packageLangData => (_packageLangData.id === languageId)
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
			langConfig = commentJson.parse(
				fs.readFileSync(langConfigFilepath, "utf8")
			);
		}
		return langConfig;
	}
}

/*
 * Replaces the provided selection with a figlet banner using the provided figlet config.
 * Formats the generated figlet banner using the provided commentTags.
*/
function replaceSelectionWithBanner(document, builder, selection, figletConfig, commentTags) {
	var err = null;
	var figletText:string = null;
	var bannerText:string = "";
	var useBlockComment:boolean = false;
	var trimTrailingWhitespaces:boolean = vscode.workspace
																							.getConfiguration("banner-comments")
																							.get('trimTrailingWhitespaces');
	try {
		figletText = figlet.textSync(
			document.getText(selection),
			figletConfig
		);
		// Setting the formatting options
		let formatAndAddLine = (_line:string, trimTrailingWhitespaces:boolean, lineComment:string = null) => {
			if (trimTrailingWhitespaces) {
				_line = _line.replace(/\s*$/,"");
			}
			if (!!lineComment) {
				_line = lineComment + _line;
			}
			bannerText += _line + "\n";
		};
		if (!!commentTags) {
			if (commentTags.blockComment) {
				useBlockComment = true;
			} else if (commentTags.lineComment) {
				formatAndAddLine = _line => {
					bannerText += (
						commentTags.lineComment +
						_line.replace(/\s*$/,"") +
						"\n"
					);
				};
			}
		}
		// Assemble the banner comment
		if (useBlockComment) {
			bannerText += commentTags.blockComment[0] + "\n";
			figletText.split("\n").forEach(formatAndAddLine);
			bannerText += commentTags.blockComment[1] + "\n";
		} else {
			figletText.split("\n").forEach(formatAndAddLine);
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

export function activate(context: vscode.ExtensionContext) {

	/**
	 * Banner-comment command to apply the font to selection.
	 */
	let bannerCommentApply:vscode.Disposable = vscode.commands.registerCommand(
		'extension.bannerCommentApply', () => {
			const editor:vscode.TextEditor = vscode.window.activeTextEditor;
			let commentTags:any = null;

			if (!editor) {
				return vscode.window.showErrorMessage("No active editor (Open a file).");
			}

			let langConfig:any = getLanguageConfig(editor.document.languageId);
			if (!langConfig) {
				console.warn(
					"Banner-comments: No matching vscode language extension found."
				);
			} else {
				commentTags = langConfig.comments;
			}

			const figletConfig:any = {
				font: vscode.workspace.getConfiguration("banner-comments").get('font'),
				horizontalLayout: 'default',
				verticalLayout: 'default'
			};

			editor.edit(
				(builder:vscode.TextEditorEdit) => {
					editor.selections.forEach(
						_selection => replaceSelectionWithBanner(
							editor.document,
							builder,
							_selection,
							figletConfig,
							commentTags
						)
					);
				}
			);
		}
	);

	/**
	 * Banner-comment command to select the font and save it to the workspace configuration.
	 */
	let bannerCommentSetFont:vscode.Disposable = vscode.commands.registerCommand(
		'extension.bannerCommentSetFont', () => {
			var availableFigletfonts:string[] = figlet.fontsSync();
			var items:vscode.QuickPickItem[] = availableFigletfonts.map(
				(figletFont:string) => {
					return {
						label: figletFont,
						description: "Use the " + figletFont + " font",
					};
				}
			);

			vscode.window.showQuickPick(items).then(
				(_selectedPickerItem:vscode.QuickPickItem) => {
					if (!_selectedPickerItem) return;
					let config:any = vscode.workspace.getConfiguration("banner-comments");
					config.update('font', _selectedPickerItem.label, true);
					console.log("Banner-comments: Updated font setting to '%s'", _selectedPickerItem.label);
				}
			);
		}
	);

	/**
	 * Banner-comment command to select the font from favorites and save it to the workspace configuration.
	 */
	let bannerCommentPickFromFavorites:vscode.Disposable = vscode.commands.registerCommand(
		'extension.bannerCommentPickFromFavorites', () => {
			let config:any = vscode.workspace.getConfiguration("banner-comments");
			let favoriteFonts:string[] = config.get("favorites");

			var items:vscode.QuickPickItem[] = favoriteFonts.map(
				(_favoriteFont:string) => {
					return {
						label: _favoriteFont,
						description: "Use the " + _favoriteFont + " font",
					};
				}
			);

			vscode.window.showQuickPick(items).then(
				(_selectedPickerItem:vscode.QuickPickItem) => {
					if (!_selectedPickerItem) return;
					let fontToSetName:string = _selectedPickerItem.label;
					config.update('font', fontToSetName, true);
					console.log("Banner-comments: Font '%s' added to favorites.", fontToSetName);
				}
			);
		}
	);

	/**
	 * Banner-comment command add a font from the list of available figlet font to the banner-comments favorite list.
	 */
	let bannerCommentAddAFontToFavorites:vscode.Disposable = vscode.commands.registerCommand(
		'extension.bannerCommentAddAFontToFavorites', () => {
			var availableFigletfonts:string[] = figlet.fontsSync();
			var items:vscode.QuickPickItem[] = availableFigletfonts.map(
				(figletFont:string) => {
					return {
						label: figletFont,
						description: "Use the " + figletFont + " font",
					};
				}
			);

			vscode.window.showQuickPick(items).then(
				(_selectedPickerItem:vscode.QuickPickItem) => {
					if (!_selectedPickerItem) return;
					let config:any = vscode.workspace.getConfiguration("banner-comments");
					let favoriteFonts:string[] = config.get("favorites");
					let fontToAddName:string = _selectedPickerItem.label;
					if (!favoriteFonts.includes(fontToAddName)) {
						favoriteFonts.push(fontToAddName);
						config.update('favorites', favoriteFonts, true);
						console.log("Banner-comments: Font '%s' added to favorites.", fontToAddName);
					} else {
						vscode.window.showInformationMessage("Current font '"+fontToAddName+"' already in favorites.");
					}
				}
			);
		}
	);

	/**
	 * Banner-comment command add the current selected font to the banner-comments favorite list.
	 */
	let bannerCommentAddCurrentFontToFavorites:vscode.Disposable = vscode.commands.registerCommand(
		'extension.bannerCommentAddCurrentFontToFavorites', () => {
			let config:any = vscode.workspace.getConfiguration("banner-comments");
			let currentFont:string = config.get("font");
			let favoriteFonts:string[] = config.get("favorites");

			if (!favoriteFonts.includes(currentFont)) {
				favoriteFonts.push(currentFont);
				config.update('favorites', favoriteFonts, true);
				console.log("Banner-comments: Font '%s' added to favorites.", currentFont);
			} else {
				vscode.window.showInformationMessage("Current font '"+currentFont+"' already in favorites.");
			}
		}
	);

	/**
	 * Banner-comment command add the current selected font to the banner-comments favorite list.
	 */
	let bannerCommentRemoveFromFavorites:vscode.Disposable = vscode.commands.registerCommand(
		'extension.bannerCommentRemoveFromFavorites', () => {
			let config:any = vscode.workspace.getConfiguration("banner-comments");
			let favoriteFonts:string[] = config.get("favorites");

			let items:vscode.QuickPickItem[] = favoriteFonts.map(
				(_favoriteFont:string) => {
					return {
						label: _favoriteFont,
						description: "Remove the " + _favoriteFont + " font from favorites.",
					};
				}
			);

			vscode.window.showQuickPick(items).then(
				(_selectedPickerItem:vscode.QuickPickItem) => {
					if (!_selectedPickerItem) return;
					let fontToRemoveName:string = _selectedPickerItem.label;
					let fontToRemoveIndex:number = favoriteFonts.indexOf(fontToRemoveName);
					if (fontToRemoveIndex >= 0) {
						favoriteFonts.splice(fontToRemoveIndex, 1);
						config.update('favorites', favoriteFonts, true);
						console.log("Banner-comments: Font '%s' removed from favorites.", fontToRemoveName);
					} else {
						vscode.window.showInformationMessage("Font '"+fontToRemoveName+"' not in favorites.");
					}
				}
			);
		}
	);

	context.subscriptions.push(
		bannerCommentApply,
		bannerCommentSetFont,
		bannerCommentPickFromFavorites,
		bannerCommentAddAFontToFavorites,
		bannerCommentAddCurrentFontToFavorites,
		bannerCommentRemoveFromFavorites
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}