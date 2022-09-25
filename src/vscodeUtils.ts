"use strict";

import * as vscode from 'vscode';
import * as fs from "fs";
import * as path from "path";
import * as commentJson from "comment-json";
import { EXT_CONFIG_SECTION_NAME, EXCLUDED_LANGUAGE_IDS } from "./constants";

/*
..####...######..######...........####....####...##...##..##...##..######..##..##..######.
.##......##........##............##..##..##..##..###.###..###.###..##......###.##....##...
.##.###..####......##............##......##..##..##.#.##..##.#.##..####....##.###....##...
.##..##..##........##............##..##..##..##..##...##..##...##..##......##..##....##...
..####...######....##.............####....####...##...##..##...##..######..##..##....##...
..........................................................................................
.######...####....####....####..
...##....##..##..##......##.....
...##....######..##.###...####..
...##....##..##..##..##......##.
...##....##..##...####....####..
................................
*/
function getCommentTags(languageId: string) {
	let commentTags: any = null;
	let langConfig: any = getLanguageConfig(languageId);
	if (!langConfig) {
		console.warn(
			"Banner-comments: No matching vscode language extension found. No comment tag will be applied."
		);
	} else {
		commentTags = langConfig.comments;
	}
	return commentTags;
}

/*
..####...######..######..........######...####...##..##...####...#####...######..######..######.
.##......##........##............##......##..##..##..##..##..##..##..##....##......##....##.....
.##.###..####......##............####....######..##..##..##..##..#####.....##......##....####...
.##..##..##........##............##......##..##...####...##..##..##..##....##......##....##.....
..####...######....##............##......##..##....##.....####...##..##..######....##....######.
................................................................................................
.######..#####....####...##...##..........##..##...####...######..#####..
.##......##..##..##..##..###.###..........##..##..##......##......##..##.
.####....#####...##..##..##.#.##..........##..##...####...####....#####..
.##......##..##..##..##..##...##..........##..##......##..##......##..##.
.##......##..##...####...##...##...........####....####...######..##..##.
.........................................................................
*/
function getFavoriteFontQuickPick(quickpickformatter: any, callback: any) {
	let favorites: string[] = vscode.workspace
		.getConfiguration(EXT_CONFIG_SECTION_NAME)
		.get("favorites");

	if (favorites.length == 0) {
		callback(
			new Error(
				"The list of favorite fonts is empty, please add some using the command 'Add favorite font'"
			),
			null
		);
	}

	let quickPickFavorites: vscode.QuickPickItem[] = favorites.map(quickpickformatter);

	vscode.window.showQuickPick(quickPickFavorites).then(
		(selectedPickerItem:vscode.QuickPickItem) => callback(null, selectedPickerItem.label)
	);
}

/*
..####...######..######..........##.......####...##..##...####...##..##...####....####...######.
.##......##........##............##......##..##..###.##..##......##..##..##..##..##......##.....
.##.###..####......##............##......######..##.###..##.###..##..##..######..##.###..####...
.##..##..##........##............##......##..##..##..##..##..##..##..##..##..##..##..##..##.....
..####...######....##............######..##..##..##..##...####....####...##..##...####...######.
................................................................................................
..####....####...##..##..######..######...####..
.##..##..##..##..###.##..##........##....##.....
.##......##..##..##.###..####......##....##.###.
.##..##..##..##..##..##..##........##....##..##.
..####....####...##..##..##......######...####..
................................................
*/

/*
 * Loops through the extensions to find the one containing the definition of the provided languageId.
 * Returns the content of the corresponding "language-configuration.json" or the equivalent file.
*/
function getLanguageConfig(languageId: string): any {

	// Provided language id not supported.
	if (EXCLUDED_LANGUAGE_IDS.includes(languageId)) {
		console.error(`Provided language id: '${ languageId }' not supported!`);
		return null;
	}

	// Finding language config filepath.
	let configFilepath: string = null;
	for (const ext of vscode.extensions.all) {
		if (
			ext.id.startsWith("vscode.") &&
			ext.packageJSON.contributes &&
			ext.packageJSON.contributes.languages
		) {
			const languagePackages: any[] = ext.packageJSON.contributes.languages;
			const packageLangData: any = languagePackages.find(
				languagePackage => languagePackage.id === languageId
			);
			if (!!packageLangData) {
				configFilepath = path.join(ext.extensionPath, packageLangData.configuration);
				break;
			}
		}
	}

	// Can't continue if no config file was found.
	if (!configFilepath || !fs.existsSync(configFilepath)) {
		console.error(`No configuration file exists for the provided language id: '${ languageId }'!`);
		return null;
	}

	/**
	 * unfortunatly, some of vscode's language config contains
	 * comments in the json file, which breaks the default node parser ("xml" and "xsl" for example).
	 * To resolve this problem, I had to use the `commentJson` library.
	 */
	return commentJson.parse(fs.readFileSync(configFilepath, "utf8"));
}

export default {
	getCommentTags,
	getFavoriteFontQuickPick,
	getLanguageConfig,
}
