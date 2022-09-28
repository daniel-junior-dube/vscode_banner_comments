"use strict";

import * as vscode from "vscode";
import * as figlet from "figlet";
import TextUtils from "./textUtils";
import VSCodeUtils from "./vscodeUtils";
import {
	EXT_CONFIG_SECTION_NAME,
	FIGLET_H_LAYOUT_CONFIG_KEY,
	FIGLET_V_LAYOUT_CONFIG_KEY,
	WIDTH_CONFIG_KEY,
	WHITESPACEBREAK_CONFIG_KEY,
	FIGLET_MIN_WIDTH
} from "./constants";

function get_figlet_configuration(font_name: string) {
	let config: any = vscode.workspace.getConfiguration(EXT_CONFIG_SECTION_NAME);
	let figletConfig: any = {
		font: font_name,
		horizontalLayout: config.get(FIGLET_H_LAYOUT_CONFIG_KEY),
		verticalLayout: config.get(FIGLET_V_LAYOUT_CONFIG_KEY)
	};

	// INFO: When `whitespaceBreak` on figletConfig, it seems to ignore the value of `whitespaceBreak` and is enabled
	// by default.
	if (config.get(WHITESPACEBREAK_CONFIG_KEY)) {
		figletConfig.whitespaceBreak = true;
		figletConfig.width = Math.max(config.get(WIDTH_CONFIG_KEY), FIGLET_MIN_WIDTH);
	}
	return figletConfig;
}

/*
.#####...######..#####...##.......####....####...######.
.##..##..##......##..##..##......##..##..##..##..##.....
.#####...####....#####...##......######..##......####...
.##..##..##......##......##......##..##..##..##..##.....
.##..##..######..##......######..##..##...####...######.
........................................................
..####...######..##......######...####...######..######...####...##..##.
.##......##......##......##......##..##....##......##....##..##..###.##.
..####...####....##......####....##........##......##....##..##..##.###.
.....##..##......##......##......##..##....##......##....##..##..##..##.
..####...######..######..######...####.....##....######...####...##..##.
........................................................................
*/

/*
 * Replaces the provided selection with a figlet banner using the provided figlet config.
 * Formats the generated figlet banner using the provided commentTags.
*/
function replaceSelectionWithBanner(
	document: vscode.TextDocument,
	builder: vscode.TextEditorEdit,
	selection: vscode.Selection,
	figletConfig: any,
	commentTags?: any
) {
	let indentation: string = TextUtils.getSelectionIndentation(document, selection);
	let lines: string[];
	let selectionText: string = document.getText(selection);

	// We don't process empty selection
	if (selectionText.length == 0) return;
	try {

		// Apply figlet on selection text.
		lines = figlet.textSync(selectionText, figletConfig).split("\n");

		// Format lines
		lines = TextUtils.removeTrailingWhitespaces(lines);
		if (commentTags) {
			lines = TextUtils.wrapLinesWithComments(lines, commentTags);
		}
		lines = TextUtils.applyIndentationToLines(lines, indentation);
	} catch (err) {
		vscode.window.showErrorMessage(`Banner-comments: ${ err.message }`);
		return;
	}
	builder.replace(selection, lines.join("\n"));
}

export default {

	/*
	..####...#####...#####...##......##..##..........######..#####....####...##...##.
	.##..##..##..##..##..##..##.......####...........##......##..##..##..##..###.###.
	.######..#####...#####...##........##............####....#####...##..##..##.#.##.
	.##..##..##......##......##........##............##......##..##..##..##..##...##.
	.##..##..##......##......######....##............##......##..##...####...##...##.
	.................................................................................
	.##......######...####...######.
	.##........##....##........##...
	.##........##.....####.....##...
	.##........##........##....##...
	.######..######...####.....##...
	................................
	*/
	applyFromList: function() {
		const editor: vscode.TextEditor = vscode.window.activeTextEditor;

		// An active editor session is required to apply banner comment.
		if (!editor) {
			return vscode.window.showErrorMessage(
				"Banner-comments: No active editor (Open a file)."
			);
		}

		let commentTags: any = VSCodeUtils.getCommentTags(editor.document.languageId);
		let availableFigletfonts: string[] = figlet.fontsSync();
		let quickPickFigletFonts: vscode.QuickPickItem[] = availableFigletfonts.map(
			(figletFontName: string) => ({
				label: figletFontName,
				description: `Apply '${ figletFontName }'`,
			})
		);

		vscode.window.showQuickPick(quickPickFigletFonts).then(
			(selectedPickerItem: vscode.QuickPickItem) => {
				if (!selectedPickerItem) return;
				const figletConfig = get_figlet_configuration(selectedPickerItem.label);
				editor.edit((builder: vscode.TextEditorEdit) =>
					editor.selections.forEach((selection: vscode.Selection) =>
						replaceSelectionWithBanner(editor.document, builder, selection, figletConfig, commentTags)
					)
				);
			}
		);
	},

	/*
	..####...#####...#####...##......##..##..........######..#####....####...##...##.
	.##..##..##..##..##..##..##.......####...........##......##..##..##..##..###.###.
	.######..#####...#####...##........##............####....#####...##..##..##.#.##.
	.##..##..##......##......##........##............##......##..##..##..##..##...##.
	.##..##..##......##......######....##............##......##..##...####...##...##.
	.................................................................................
	.##..##..######...####...#####...######..#####..
	.##..##..##......##..##..##..##..##......##..##.
	.######..####....######..##..##..####....#####..
	.##..##..##......##..##..##..##..##......##..##.
	.##..##..######..##..##..#####...######..##..##.
	................................................
	*/
	applyFromHeader: function(headerType: any) {
		const editor: vscode.TextEditor = vscode.window.activeTextEditor;

		// An active editor session is required to apply banner comment.
		if (!editor) {
			return vscode.window.showErrorMessage("Banner-comments: No active editor (Open a file).");
		}
		const figletConfig = get_figlet_configuration(vscode.workspace.getConfiguration(EXT_CONFIG_SECTION_NAME).get(headerType));
		const commentTags: any = VSCodeUtils.getCommentTags(editor.document.languageId);
		editor.edit((builder: vscode.TextEditorEdit) =>
			editor.selections.forEach((selection: vscode.Selection) =>
				replaceSelectionWithBanner(editor.document, builder, selection, figletConfig, commentTags)
			)
		);
	},

	/*
	..####...#####...#####...##......##..##..........######..#####....####...##...##.
	.##..##..##..##..##..##..##.......####...........##......##..##..##..##..###.###.
	.######..#####...#####...##........##............####....#####...##..##..##.#.##.
	.##..##..##......##......##........##............##......##..##..##..##..##...##.
	.##..##..##......##......######....##............##......##..##...####...##...##.
	.................................................................................
	.######...####...##..##...####...#####...######..######..######...####..
	.##......##..##..##..##..##..##..##..##....##......##....##......##.....
	.####....######..##..##..##..##..#####.....##......##....####.....####..
	.##......##..##...####...##..##..##..##....##......##....##..........##.
	.##......##..##....##.....####...##..##..######....##....######...####..
	........................................................................
	*/

	applyFromFavorite: function() {
		const editor: vscode.TextEditor = vscode.window.activeTextEditor;

		// An active editor session is required to apply banner comment.
		if (!editor) {
			return vscode.window.showErrorMessage("Banner-comments: No active editor (Open a file).");
		}

		let commentTags: any = VSCodeUtils.getCommentTags(editor.document.languageId);
		VSCodeUtils.getFavoriteFontQuickPick(
			(favoriteFigletFontName:string) => ({
				label: favoriteFigletFontName,
				description: `Use the ${ favoriteFigletFontName } font`,
			}),
			(err: any, font: string) => {
				if (err) {
					vscode.window.showErrorMessage(
						"Banner-comments: An error occured while getting a favorite font from user! See the logs for more information."
					);
					return console.error(err);
				}
				if (!font) return;

				const figletConfig = get_figlet_configuration(font);
				editor.edit((builder: vscode.TextEditorEdit) =>
					editor.selections.forEach((selection: vscode.Selection) =>
						replaceSelectionWithBanner(editor.document, builder, selection, figletConfig, commentTags)
					)
				);
			}
		);
	},

	/*
	..####...######..######..........######...####...##..##..######.
	.##......##........##............##......##..##..###.##....##...
	..####...####......##............####....##..##..##.###....##...
	.....##..##........##............##......##..##..##..##....##...
	..####...######....##............##.......####...##..##....##...
	................................................................
	*/

	setHeaderFont: function(headerType: string) {
		let availableFigletfonts: string[] = figlet.fontsSync();
		let quickPickFigletFonts: vscode.QuickPickItem[] = availableFigletfonts.map(
			(figletFontName: string) => ({
				label: figletFontName,
				description: `Apply '${ figletFontName }'`,
			})
		);

		vscode.window.showQuickPick(quickPickFigletFonts).then(
			(selectedPickerItem: vscode.QuickPickItem) => {
				if (!selectedPickerItem) return;
				let config: any = vscode.workspace.getConfiguration(EXT_CONFIG_SECTION_NAME);
				config.update(headerType, selectedPickerItem.label, true);
				console.log(`Banner-comments: Updated font setting to '${ selectedPickerItem.label }'`);
			}
		);
	},

	/*
	..####...#####...#####...........######...####..
	.##..##..##..##..##..##............##....##..##.
	.######..##..##..##..##............##....##..##.
	.##..##..##..##..##..##............##....##..##.
	.##..##..#####...#####.............##.....####..
	................................................
	.######...####...##..##...####...#####...######..######..######.
	.##......##..##..##..##..##..##..##..##....##......##....##.....
	.####....######..##..##..##..##..#####.....##......##....####...
	.##......##..##...####...##..##..##..##....##......##....##.....
	.##......##..##....##.....####...##..##..######....##....######.
	................................................................
	*/

	addAFontToFavorites: function() {
		let availableFigletfonts: string[] = figlet.fontsSync();
		let quickPickFigletFonts: vscode.QuickPickItem[] = availableFigletfonts.map(
			(figletFontName: string) => {
				return {
					label: figletFontName,
					description: `Add '${ figletFontName }' to the list of favorites`,
				};
			}
		);

		vscode.window.showQuickPick(quickPickFigletFonts).then(
			(selectedPickerItem:vscode.QuickPickItem) => {
				if (!selectedPickerItem) return;
				let config: any = vscode.workspace.getConfiguration(EXT_CONFIG_SECTION_NAME);
				let favorites: string[] = config.favorites;
				if (favorites.includes(selectedPickerItem.label)) {
					vscode.window.showInformationMessage(
						`Banner-comments: Font '${ selectedPickerItem.label }' is already in favorites!`
					);
					return;
				}
				favorites.push(selectedPickerItem.label);
				config.update("favorites", favorites, true);
				console.log(`Banner-comments: Added '${ selectedPickerItem.label }' font to favorites`);
			}
		);
	},

	/*
	.#####...######..##...##...####...##..##..######..........######..#####....####...##...##.
	.##..##..##......###.###..##..##..##..##..##..............##......##..##..##..##..###.###.
	.#####...####....##.#.##..##..##..##..##..####............####....#####...##..##..##.#.##.
	.##..##..##......##...##..##..##...####...##..............##......##..##..##..##..##...##.
	.##..##..######..##...##...####.....##....######..........##......##..##...####...##...##.
	..........................................................................................
	.######...####...##..##...####...#####...######..######..######...####..
	.##......##..##..##..##..##..##..##..##....##......##....##......##.....
	.####....######..##..##..##..##..#####.....##......##....####.....####..
	.##......##..##...####...##..##..##..##....##......##....##..........##.
	.##......##..##....##.....####...##..##..######....##....######...####..
	........................................................................
	*/

	removeFromFavorites: function() {
		let config: any = vscode.workspace.getConfiguration(EXT_CONFIG_SECTION_NAME);
		let favoritesFonts: string[] = config.favorites;
		if ( favoritesFonts.length == 0 ) {
			vscode.window.showErrorMessage(
				"Banner-comments: The list of favorite fonts is empty, can't remove from empty list!"
			);
			return;
		}
		VSCodeUtils.getFavoriteFontQuickPick(
			(favoriteFigletFontName:string) => ({
				label: favoriteFigletFontName,
				description: `Remove ${ favoriteFigletFontName } from the favorites`,
			}),
			(err: any, font: string) => {
				if (err) {
					vscode.window.showErrorMessage(
						"Banner-comments: An error occured while getting a favorite font from user! See the logs for more information."
					);
					return console.error(err);
				}
				if (!font) return;
				if (!favoritesFonts.includes(font)) {
					vscode.window.showErrorMessage(
						`Banner-comments: Font '${ font }' isn't in the list of favorites!`
					);
					return;
				}
				favoritesFonts.splice(favoritesFonts.indexOf(font), 1);
				config.update("favorites", favoritesFonts, true);
				console.log(`Banner-comments: Added '${ font }' font to favorites`);
			}
		);
	},
};
