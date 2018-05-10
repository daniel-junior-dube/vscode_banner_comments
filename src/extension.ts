"use strict";

/*
.########..########..#######..##.....##.####.########..########
.##.....##.##.......##.....##.##.....##..##..##.....##.##......
.##.....##.##.......##.....##.##.....##..##..##.....##.##......
.########..######...##.....##.##.....##..##..########..######..
.##...##...##.......##..##.##.##.....##..##..##...##...##......
.##....##..##.......##....##..##.....##..##..##....##..##......
.##.....##.########..#####.##..#######..####.##.....##.########
*/

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as commentJson from "comment-json";
import * as figlet from "figlet";
import TextUtils from "./textUtils";

/*
..######...##........#######..########.....###....##........######.
.##....##..##.......##.....##.##.....##...##.##...##.......##....##
.##........##.......##.....##.##.....##..##...##..##.......##......
.##...####.##.......##.....##.########..##.....##.##........######.
.##....##..##.......##.....##.##.....##.#########.##.............##
.##....##..##.......##.....##.##.....##.##.....##.##.......##....##
..######...########..#######..########..##.....##.########..######.
*/

const HEADER_TYPE = { H1: "h1", H2: "h2", H3: "h3" };

/*
..######...#######..##.....##.##.....##....###....##....##.########...######.
.##....##.##.....##.###...###.###...###...##.##...###...##.##.....##.##....##
.##.......##.....##.####.####.####.####..##...##..####..##.##.....##.##......
.##.......##.....##.##.###.##.##.###.##.##.....##.##.##.##.##.....##..######.
.##.......##.....##.##.....##.##.....##.#########.##..####.##.....##.......##
.##....##.##.....##.##.....##.##.....##.##.....##.##...###.##.....##.##....##
..######...#######..##.....##.##.....##.##.....##.##....##.########...######.
*/

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

function applyFromList() {
	const editor:vscode.TextEditor = vscode.window.activeTextEditor;

	// An active editor session is required to apply banner comment.
	if ( !editor ) {
		return vscode.window.showErrorMessage(
			"Banner-comments: No active editor (Open a file)."
		);
	}

	let commentTags:any = getCommentTags( editor.document.languageId );
	let availableFigletfonts:string[] = figlet.fontsSync();
	let quickPickFigletFonts:vscode.QuickPickItem[] = availableFigletfonts.map(
		( figletFontName:string ) => {
			return {
				label: figletFontName,
				description: "Add the " + figletFontName + " font to favorites",
			};
		}
	);

	vscode.window.showQuickPick( quickPickFigletFonts ).then(
		( _selectedPickerItem:vscode.QuickPickItem ) => {
			if ( !_selectedPickerItem ) return;
			let config:any = vscode.workspace.getConfiguration( "banner-comments" );
			const figletConfig:any = {
				font: _selectedPickerItem.label,
				horizontalLayout: config.get( "figlet.horizontalLayout" ),
				verticalLayout: config.get( "figlet.verticalLayout" )
			};

			editor.edit(
				( builder:vscode.TextEditorEdit ) => {
					editor.selections.forEach(
						_selection => replaceSelectionWithBanner(
							editor.document, builder, _selection, figletConfig, commentTags
						)
					);
				}
			);
		}
	);
}

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
function applyFromHeader( headerType ) {
	const editor:vscode.TextEditor = vscode.window.activeTextEditor;

	// An active editor session is required to apply banner comment.
	if ( !editor ) {
		return vscode.window.showErrorMessage( "Banner-comments: No active editor (Open a file)." );
	}

	let config:any = vscode.workspace.getConfiguration( "banner-comments" );
	let commentTags:any = getCommentTags( editor.document.languageId );
	const figletConfig:any = {
		font: vscode.workspace.getConfiguration( "banner-comments" ).get( headerType ),
		horizontalLayout: config.get( "figlet.horizontalLayout" ),
		verticalLayout: config.get( "figlet.verticalLayout" )
	};

	editor.edit(
		( builder:vscode.TextEditorEdit ) => {
			editor.selections.forEach(
				_selection => replaceSelectionWithBanner(
					editor.document, builder, _selection, figletConfig, commentTags
				)
			);
		}
	);
}

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

function applyFromFavorite() {
	const editor:vscode.TextEditor = vscode.window.activeTextEditor;

	// An active editor session is required to apply banner comment.
	if ( !editor ) {
		return vscode.window.showErrorMessage( "Banner-comments: No active editor (Open a file)." );
	}

	let commentTags:any = getCommentTags( editor.document.languageId );
	getFavoriteFontFromUser(
		(err, font) => {
			if ( err ) {
				vscode.window.showErrorMessage(
					"Banner-comments: An error occured while getting a favorite font from user! See the logs for more information."
				);
				return console.error( err );
			}
			if ( !font ) return;
			let config:any = vscode.workspace.getConfiguration( "banner-comments" );
			const figletConfig:any = {
				font: font,
				horizontalLayout: config.get( "figlet.horizontalLayout" ),
				verticalLayout: config.get( "figlet.verticalLayout" )
			};

			editor.edit(
				( builder:vscode.TextEditorEdit ) => {
					editor.selections.forEach(
						_selection => replaceSelectionWithBanner(
							editor.document, builder, _selection, figletConfig, commentTags
						)
					);
				}
			);
		}
	);
}

/*
..####...######..######..........######...####...##..##..######.
.##......##........##............##......##..##..###.##....##...
..####...####......##............####....##..##..##.###....##...
.....##..##........##............##......##..##..##..##....##...
..####...######....##............##.......####...##..##....##...
................................................................
*/

function setHeaderFont( headerType ) {
	var availableFigletfonts:string[] = figlet.fontsSync();
	var quickPickFigletFonts:vscode.QuickPickItem[] = availableFigletfonts.map(
		( figletFontName:string ) => {
			return {
				label: figletFontName,
				description: "Use the " + figletFontName + " font",
			};
		}
	);

	vscode.window.showQuickPick( quickPickFigletFonts ).then(
		( _selectedPickerItem:vscode.QuickPickItem ) => {
			if ( !_selectedPickerItem ) return;
			let config:any = vscode.workspace.getConfiguration( "banner-comments" );
			config.update( headerType, _selectedPickerItem.label, true );
			console.log(
				`Banner-comments: Updated font setting to '${ _selectedPickerItem.label }'`
			);
		}
	);
}

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

function addAFontToFavorites() {
	let availableFigletfonts:string[] = figlet.fontsSync();
	let quickPickFigletFonts:vscode.QuickPickItem[] = availableFigletfonts.map(
		( figletFontName:string ) => {
			return {
				label: figletFontName,
				description: "Add the " + figletFontName + " font to favorites",
			};
		}
	);

	vscode.window.showQuickPick( quickPickFigletFonts ).then(
		( _selectedPickerItem:vscode.QuickPickItem ) => {
			if ( !_selectedPickerItem ) return;
			let config:any = vscode.workspace.getConfiguration( "banner-comments" );
			let favorites:string[] = config.favorites;
			if ( favorites.includes( _selectedPickerItem.label ) ) {
				vscode.window.showInformationMessage(
					`Banner-comments: Font '${ _selectedPickerItem.label }' is already in favorites!`
				);
				return;
			}
			favorites.push( _selectedPickerItem.label );
			config.update( "favorites", favorites, true );
			console.log(
				`Banner-comments: Added '${ _selectedPickerItem.label }' font to favorites`
			);
		}
	);
}

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

function removeFromFavorites() {
	let config:any = vscode.workspace.getConfiguration( "banner-comments" );
	let favorites:string[] = config.favorites;
	if ( favorites.length == 0 ) {
		vscode.window.showErrorMessage(
			"Banner-comments: The list of favorite fonts is empty, can't remove from empty list!"
		);
		return;
	}
	getFavoriteFontFromUser(
		(err, font) => {
			if ( err ) {
				vscode.window.showErrorMessage(
					"Banner-comments: An error occured while getting a favorite font from user! See the logs for more information."
				);
				return console.error( err );
			}
			if ( !font ) return;
			if ( !favorites.includes( font ) ) {
				vscode.window.showErrorMessage(
					`Banner-comments: Font '${ font }' isn't in the list of favorites!`
				);
				return;
			}
			favorites.splice( favorites.indexOf( font ), 1 );
			config.update( "favorites", favorites, true );
			console.log(
				`Banner-comments: Added '${ font }' font to favorites`
			);
		}
	);
}

/*
.########..#######...#######..##........######.
....##....##.....##.##.....##.##.......##....##
....##....##.....##.##.....##.##.......##......
....##....##.....##.##.....##.##........######.
....##....##.....##.##.....##.##.............##
....##....##.....##.##.....##.##.......##....##
....##.....#######...#######..########..######.
*/

function getCommentTags( languageId:string ) {
	let commentTags:any = null;
	let langConfig:any = getLanguageConfig( languageId );
	if ( !langConfig ) {
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
function getFavoriteFontFromUser( callback ) {
	let favorites:string[] = vscode.workspace.getConfiguration( "banner-comments" ).get( "favorites" );
	if ( favorites.length == 0 ) {
		callback(
			new Error( "The list of favorite fonts is empty, please add some using the command 'Add favorite font'"),
			null
		);
	}

	var quickPickFavorites:vscode.QuickPickItem[] = favorites.map(
		( favoriteFigletFontName:string ) => {
			return {
				label: favoriteFigletFontName,
				description: "Use the " + favoriteFigletFontName + " font",
			};
		}
	);

	vscode.window.showQuickPick( quickPickFavorites ).then(
		( _selectedPickerItem:vscode.QuickPickItem ) => {
			callback( null, _selectedPickerItem.label );
		}
	);
}

/*
..####...######..######...........####....####...##..##..######..######...####..
.##......##........##............##..##..##..##..###.##..##........##....##.....
.##.###..####......##............##......##..##..##.###..####......##....##.###.
.##..##..##........##............##..##..##..##..##..##..##........##....##..##.
..####...######....##.............####....####...##..##..##......######...####..
................................................................................
*/

/*
 * Loops through the extensions to find the one containing the definition of the provided languageId.
 * Returns the content of the corresponding "language-configuration.json" or the equivalent file.
*/
function getLanguageConfig( languageId:string ):any {
	const excludedIds:any[] = [ "plaintext" ];

	// Provided language id not supported.
	if ( excludedIds.includes( languageId ) ) {
		return console.error(
			`Provided language id: '${ languageId }' not supported!`
		);
	}

	// Finding language config filepath.
	let configFilepath:string = null;
	for ( const _ext of vscode.extensions.all ) {
		if (
			_ext.id.startsWith( "vscode." ) &&
			_ext.packageJSON.contributes &&
			_ext.packageJSON.contributes.languages
		) {
			const languagePackages:any[] = _ext.packageJSON.contributes.languages;
			const packageLangData:any = languagePackages.find( _lang => ( _lang.id === languageId ) );
			if ( !!packageLangData ) {
				configFilepath = path.join(
					_ext.extensionPath,
					packageLangData.configuration
				);
				break;
			}
		}
	}

	// Can't continue if no config file was found.
	if ( !configFilepath || !fs.existsSync( configFilepath ) ) {
		return console.error(
			`No configuration file exists for the provided language id: '${ languageId }'!`
		);
	}

	/**
	 * unfortunatly, some of vscode's language config contains
	 * comments in the json file, which breaks the default node parser ("xml" and "xsl" for example).
	 * To resolve this problem, I had to use the `commentJson` library.
	 */
	return commentJson.parse(
		fs.readFileSync( configFilepath, "utf8" )
	);
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
	document:vscode.TextDocument,
	builder:vscode.TextEditorEdit,
	selection:vscode.Selection,
	figletConfig:any,
	commentTags:any
) {
	let indentation:string = TextUtils.getSelectionIndentation( document, selection );
	let lines:string[];
	let selectionText:string = document.getText( selection );
	// We don't process empty selection
	if ( selectionText.length == 0 ) return;
	try {
		// Apply figlet on selection text.
		lines = figlet.textSync( selectionText, figletConfig ).split( "\n" );
		// Format lines
		lines = TextUtils.removeTrailingWhitespaces( lines );
		if ( commentTags ) lines = TextUtils.wrapLinesWithComments( lines, commentTags );
		lines = TextUtils.applyIndentationToLines( lines, indentation );
	} catch ( err ) {
		vscode.window.showErrorMessage( "Banner-comments: " + err.message );
		return;
	}
	builder.replace( selection, lines.join( "\n" ) );
}

/*
.########.##.....##.########.########.##....##..######..####..#######..##....##
.##........##...##.....##....##.......###...##.##....##..##..##.....##.###...##
.##.........##.##......##....##.......####..##.##........##..##.....##.####..##
.######......###.......##....######...##.##.##..######...##..##.....##.##.##.##
.##.........##.##......##....##.......##..####.......##..##..##.....##.##..####
.##........##...##.....##....##.......##...###.##....##..##..##.....##.##...###
.########.##.....##....##....########.##....##..######..####..#######..##....##
*/

/*
..####....####...######..######..##..##...####...######..######.
.##..##..##..##....##......##....##..##..##..##....##....##.....
.######..##........##......##....##..##..######....##....####...
.##..##..##..##....##......##.....####...##..##....##....##.....
.##..##...####.....##....######....##....##..##....##....######.
................................................................
*/

export function activate( context: vscode.ExtensionContext ) {

	context.subscriptions.push(
		/**
		 * Banner-comment command to apply the font to selection.
		 */
		vscode.commands.registerCommand(
			"extension.bannerCommentApplyFromList", _ => applyFromList()
		),
		vscode.commands.registerCommand(
			"extension.bannerCommentApplyH1", _ => applyFromHeader( "h1" )
		),
		vscode.commands.registerCommand(
			"extension.bannerCommentApplyH2", _ => applyFromHeader( "h2" )
		),
		vscode.commands.registerCommand(
			"extension.bannerCommentApplyH3", _ => applyFromHeader( "h3" )
		),
		vscode.commands.registerCommand(
			"extension.bannerCommentApplyFavorite", _ => applyFromFavorite()
		),
		/**
		 * Banner-comment command to set the font and save it to the workspace configuration.
		 */
		vscode.commands.registerCommand(
			"extension.bannerCommentSetH1Font", _ => setHeaderFont( "h1" )
		),
		vscode.commands.registerCommand(
			"extension.bannerCommentSetH2Font", _ => setHeaderFont( "h2" )
		),
		vscode.commands.registerCommand(
			"extension.bannerCommentSetH3Font", _ => setHeaderFont( "h3" )
		),
		/**
		 * Banner-comment command to add a font to the list of favorites which saves into workspace configuration.
		 */
		vscode.commands.registerCommand(
			"extension.bannerCommentAddToFavorite", _ => addAFontToFavorites()
		),
		vscode.commands.registerCommand(
			"extension.bannerCommentRemoveFromFavorite", _ => removeFromFavorites()
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

// this method is called when your extension is deactivated
export function deactivate() {}