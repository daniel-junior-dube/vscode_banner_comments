"use strict";

import * as vscode from 'vscode';

class TextUtils {
	static removeTrailingWhitespaces(lines: string[]) {
		return lines.map(line => TextUtils.removeTrailingWhitespace(line));
	}

	static removeTrailingWhitespace(line:string) {
		return line.replace(/\s+$/, '');
	}

	static wrapLinesWithComments(lines: string[], commentTags: any) {
		if (commentTags.blockComment) {
			
			// Insert first tag in front
			lines.unshift(commentTags.blockComment[0]);
			
			// Insert second tag in back
			lines.push(commentTags.blockComment[1]);
		} else if (commentTags.lineComment) {
			
			// Prefix each line with lineComment tag
			lines.map(line => commentTags.lineComment + line);
		}
		return lines;
	}

	static applyIndentationToLines(lines: string[], indentation: string) {
		return lines.map((line: string, index: number) =>
			(index > 0 && line.length > 0) ? indentation + line : line
		);
	}

	static getSelectionIndentation(document: vscode.TextDocument, selection: vscode.Selection) {
		return document.getText(new vscode.Range(
			selection.start.translate(0, -selection.start.character),
			selection.start
		));
	}
}

export default TextUtils;
