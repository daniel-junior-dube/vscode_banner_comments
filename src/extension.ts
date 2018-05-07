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

function applyBannerComment( headerType ) {
	const editor:vscode.TextEditor = vscode.window.activeTextEditor;

	// An active editor session is required to apply banner comment.
	if ( !editor ) {
		return vscode.window.showErrorMessage( "No active editor (Open a file)." );
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
		vscode.window.showErrorMessage( err.message );
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
		"extension.bannerCommentApplyH1", _ => applyBannerComment( "h1" )
	);
	let applyH2:vscode.Disposable = vscode.commands.registerCommand(
		"extension.bannerCommentApplyH2", _ => applyBannerComment( "h2" )
	);
	let applyH3:vscode.Disposable = vscode.commands.registerCommand(
		"extension.bannerCommentApplyH3", _ => applyBannerComment( "h3" )
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

	context.subscriptions.push(
		applyH1, applyH2, applyH3, setH1Font, setH2Font, setH3Font
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