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
..####...#####...#####...##......##..##.
.##..##..##..##..##..##..##.......####..
.######..#####...#####...##........##...
.##..##..##......##......##........##...
.##..##..##......##......######....##...
........................................
*/

function applyFromHeader( headerType ) {
	const editor:vscode.TextEditor = vscode.window.activeTextEditor;

	// An active editor session is required to apply banner comment.
	if ( !editor ) {
		return vscode.window.showErrorMessage( "Banner-comments: No active editor (Open a file)." );
	}

	let commentTags:any = null;
	let langConfig:any = getLanguageConfig( editor.document.languageId );
	if ( !langConfig ) {
		console.warn(
			"Banner-comments: No matching vscode language extension found. No comment tag will be applied."
		);
	} else {
		commentTags = langConfig.comments;
	}

	const figletConfig:any = {
		font: vscode.workspace.getConfiguration( "banner-comments" ).get( headerType ),
		horizontalLayout: "default",
		verticalLayout: "default"
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

function applyFromFavorite() {
	const editor:vscode.TextEditor = vscode.window.activeTextEditor;

	// An active editor session is required to apply banner comment.
	if ( !editor ) {
		return vscode.window.showErrorMessage( "Banner-comments: No active editor (Open a file)." );
	}

	let commentTags:any = null;
	let langConfig:any = getLanguageConfig( editor.document.languageId );
	if ( !langConfig ) {
		console.warn(
			"Banner-comments: No matching vscode language extension found. No comment tag will be applied."
		);
	} else {
		commentTags = langConfig.comments;
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
			const figletConfig:any = {
				font: font,
				horizontalLayout: "default",
				verticalLayout: "default"
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

// ADD FAVORITE
function addAFontToFavorites() {
	var availableFigletfonts:string[] = figlet.fontsSync();
	var quickPickFigletFonts:vscode.QuickPickItem[] = availableFigletfonts.map(
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
			favorites.push( _selectedPickerItem.label );
			config.update( "favorites", favorites, true );
			console.log(
				`Banner-comments: Added '${ _selectedPickerItem.label }' font to favorites`
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
*/

function removeTrailingWhitespaces( lines ) {
	return lines.map( _line => removeTrailingWhitespace( _line ) );
}

function removeTrailingWhitespace( line ) {
	return line.replace( /\s+$/, '' );
}

function wrapLinesWithComments( lines, commentTags ) {
	if ( commentTags.blockComment ) {
		// Insert first tag in front
		lines.unshift( commentTags.blockComment[0] );
		// Insert second tag in back
		lines.push( commentTags.blockComment[1] );
		;
	} else if ( commentTags.lineComment ) {
		// Prefix each line with lineComment tag
		lines.map( _line => commentTags.lineComment + _line );
	}
	return lines;
}

function applyIndentation( lines, indentation ) {
	return lines.map(
		( _line, index ) => ( index > 0 && _line.length > 0 ) ? indentation + _line : _line
	);
}

function getSelectionIndentation( document, selection ) {
	return document.getText(
		new vscode.Range(
			selection.start.translate( 0, -selection.start.character ),
			selection.start
		)
	);
}

/*
 * Replaces the provided selection with a figlet banner using the provided figlet config.
 * Formats the generated figlet banner using the provided commentTags.
*/
function replaceSelectionWithBanner( document, builder, selection, figletConfig, commentTags ) {
	let indentation:string = getSelectionIndentation( document, selection );
	let lines:string[];
	let selectionText:string = document.getText( selection );
	// We don't process empty selection
	if ( selectionText.length == 0 ) return;
	try {
		// Apply figlet on selection text.
		lines = figlet.textSync( selectionText, figletConfig ).split( "\n" );
		// Format lines
		lines = removeTrailingWhitespaces( lines );
		if ( commentTags ) lines = wrapLinesWithComments( lines, commentTags );
		lines = applyIndentation( lines, indentation );
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

	/**
	 * Banner-comment command to apply the font to selection.
	 */
	let applyH1:vscode.Disposable = vscode.commands.registerCommand(
		"extension.bannerCommentApplyH1", _ => applyFromHeader( "h1" )
	);
	let applyH2:vscode.Disposable = vscode.commands.registerCommand(
		"extension.bannerCommentApplyH2", _ => applyFromHeader( "h2" )
	);
	let applyH3:vscode.Disposable = vscode.commands.registerCommand(
		"extension.bannerCommentApplyH3", _ => applyFromHeader( "h3" )
	);
	let applyFavorite:vscode.Disposable = vscode.commands.registerCommand(
		"extension.bannerCommentApplyFavorite", _ => applyFromFavorite()
	);

	/**
	 * Banner-comment command to set the font and save it to the workspace configuration.
	 */
	let setH1Font:vscode.Disposable = vscode.commands.registerCommand(
		"extension.bannerCommentSetH1Font", _ => setHeaderFont( "h1" )
	);
	let setH2Font:vscode.Disposable = vscode.commands.registerCommand(
		"extension.bannerCommentSetH2Font", _ => setHeaderFont( "h2" )
	);
	let setH3Font:vscode.Disposable = vscode.commands.registerCommand(
		"extension.bannerCommentSetH3Font", _ => setHeaderFont( "h3" )
	);

	/**
	 * Banner-comment command to add a font to the list of favorites which saves into workspace configuration.
	 */
	let addToFavorite:vscode.Disposable = vscode.commands.registerCommand(
		"extension.bannerCommentAddToFavorite", _ => addAFontToFavorites()
	);

	context.subscriptions.push(
		applyH1, applyH2, applyH3, applyFavorite, setH1Font, setH2Font, setH3Font, addToFavorite
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