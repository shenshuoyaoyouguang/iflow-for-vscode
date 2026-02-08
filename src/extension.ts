import * as vscode from 'vscode';
import { IFlowPanel } from './panel';
import { IFlowSidebarProvider } from './sidebarProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log('IFlow for VSCode is now active');

	// Register the independent panel command
	const disposable = vscode.commands.registerCommand('iflow-for-vscode.openPanel', () => {
		IFlowPanel.createOrShow(context.extensionUri, context.globalState);
	});
	context.subscriptions.push(disposable);

	// Register lock editor group command
	const lockDisposable = vscode.commands.registerCommand('iflow-for-vscode.lockGroup', () => {
		vscode.commands.executeCommand('workbench.action.lockEditorGroup');
	});
	context.subscriptions.push(lockDisposable);

	// Register the sidebar webview provider
	const sidebarProvider = new IFlowSidebarProvider(context.extensionUri, context.globalState);
	const sidebarDisposable = vscode.window.registerWebviewViewProvider(
		IFlowSidebarProvider.viewType,
		sidebarProvider,
		{ webviewOptions: { retainContextWhenHidden: true } }
	);
	context.subscriptions.push(sidebarDisposable);
}

export function deactivate() {}
