import * as vscode from 'vscode';
import { IFlowPanel } from './panel';

export function activate(context: vscode.ExtensionContext) {
	console.log('IFlow for VSCode is now active');

	const disposable = vscode.commands.registerCommand('iflow-for-vscode.openPanel', () => {
		IFlowPanel.createOrShow(context.extensionUri, context.globalState);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
