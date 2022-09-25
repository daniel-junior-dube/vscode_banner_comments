"use strict";

import * as vscode from "vscode";
import Commands from "./commands";

/*
..####....####...######..######..##..##...####...######..######.
.##..##..##..##....##......##....##..##..##..##....##....##.....
.######..##........##......##....##..##..######....##....####...
.##..##..##..##....##......##.....####...##..##....##....##.....
.##..##...####.....##....######....##....##..##....##....######.
................................................................
*/

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
		
		/**
		 * Banner-comment command to apply the font to selection.
		 */
		vscode.commands.registerCommand(
			"extension.bannerCommentApplyFromList", _ => Commands.applyFromList()
		),
		vscode.commands.registerCommand(
			"extension.bannerCommentApplyH1", _ => Commands.applyFromHeader("h1")
		),
		vscode.commands.registerCommand(
			"extension.bannerCommentApplyH2", _ => Commands.applyFromHeader("h2")
		),
		vscode.commands.registerCommand(
			"extension.bannerCommentApplyH3", _ => Commands.applyFromHeader("h3")
		),
		vscode.commands.registerCommand(
			"extension.bannerCommentApplyFavorite", _ => Commands.applyFromFavorite()
		),

		/**
		 * Banner-comment command to set the font and save it to the workspace configuration.
		 */
		vscode.commands.registerCommand(
			"extension.bannerCommentSetH1Font", _ => Commands.setHeaderFont("h1")
		),
		vscode.commands.registerCommand(
			"extension.bannerCommentSetH2Font", _ => Commands.setHeaderFont("h2")
		),
		vscode.commands.registerCommand(
			"extension.bannerCommentSetH3Font", _ => Commands.setHeaderFont("h3")
		),

		/**
		 * Banner-comment command to add a font to the list of favorites which saves into workspace
		 * configuration.
		 */
		vscode.commands.registerCommand(
			"extension.bannerCommentAddToFavorite", _ => Commands.addAFontToFavorites()
		),
		vscode.commands.registerCommand(
			"extension.bannerCommentRemoveFromFavorite", _ => Commands.removeFromFavorites()
		)
	);
}

/*
.#####...######...####....####...######..######..##..##...####...######..######.
.##..##..##......##..##..##..##....##......##....##..##..##..##....##....##.....
.##..##..####....######..##........##......##....##..##..######....##....####...
.##..##..##......##..##..##..##....##......##.....####...##..##....##....##.....
.#####...######..##..##...####.....##....######....##....##..##....##....######.
................................................................................
*/

// This method is called when your extension is deactivated.
export function deactivate() {}
