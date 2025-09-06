import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn, ChildProcess } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    console.log('Omniscript extension is now active!');

    // Register all commands
    const compileCommand = vscode.commands.registerCommand('omniscript.compile', async (uri?: vscode.Uri) => {
        await compileFile(uri);
    });

    const compileProjectCommand = vscode.commands.registerCommand('omniscript.compileProject', async () => {
        await compileProject();
    });

    const runCommand = vscode.commands.registerCommand('omniscript.run', async (uri?: vscode.Uri) => {
        await runFile(uri);
    });

    const debugCommand = vscode.commands.registerCommand('omniscript.debug', async (uri?: vscode.Uri) => {
        await debugFile(uri);
    });

    const checkTypesCommand = vscode.commands.registerCommand('omniscript.checkTypes', async (uri?: vscode.Uri) => {
        await checkTypes(uri);
    });

    const formatCommand = vscode.commands.registerCommand('omniscript.format', async () => {
        await formatDocument();
    });

    const newProjectCommand = vscode.commands.registerCommand('omniscript.newProject', async () => {
        await createNewProject();
    });

    const installCLICommand = vscode.commands.registerCommand('omniscript.installCLI', async () => {
        await installOmniscriptCLI();
    });

    // Register document formatting provider
    const formatProvider = vscode.languages.registerDocumentFormattingEditProvider('omniscript', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
            // Simple formatting - in a real implementation, this would call the omniscript formatter
            return [];
        }
    });

    // Register diagnostic provider
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('omniscript');
    context.subscriptions.push(diagnosticCollection);

    // Watch for document changes to provide real-time error checking
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(async (event) => {
        if (event.document.languageId === 'omniscript') {
            await updateDiagnostics(event.document, diagnosticCollection);
        }
    });

    // Register all subscriptions
    context.subscriptions.push(
        compileCommand,
        compileProjectCommand,
        runCommand,
        debugCommand,
        checkTypesCommand,
        formatCommand,
        newProjectCommand,
        installCLICommand,
        formatProvider,
        changeDocumentSubscription
    );

    // Initialize language features
    initializeLanguageFeatures(context);
}

async function compileFile(uri?: vscode.Uri): Promise<void> {
    const filePath = getActiveFilePath(uri);
    if (!filePath) {
        vscode.window.showErrorMessage('No Omniscript file selected');
        return;
    }

    const config = vscode.workspace.getConfiguration('omniscript');
    const outputDir = config.get<string>('compiler.outputDirectory', 'dist');
    const target = config.get<string>('compiler.target', 'ES2020');
    const strictMode = config.get<boolean>('compiler.strictMode', true);

    const terminal = vscode.window.createTerminal('Omniscript Compile');
    terminal.show();

    const compilerPath = await getOmniscriptPath();
    if (!compilerPath) {
        vscode.window.showErrorMessage('Omniscript CLI not found. Please install it first.');
        return;
    }

    const args = [
        'compile',
        filePath,
        '--output', outputDir,
        '--target', target
    ];

    if (strictMode) {
        args.push('--strict');
    }

    terminal.sendText(`"${compilerPath}" ${args.join(' ')}`);
    
    vscode.window.showInformationMessage(`Compiling ${path.basename(filePath)}...`);
}

async function compileProject(): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }

    const config = vscode.workspace.getConfiguration('omniscript');
    const outputDir = config.get<string>('compiler.outputDirectory', 'dist');
    
    const terminal = vscode.window.createTerminal('Omniscript Build');
    terminal.show();

    const compilerPath = await getOmniscriptPath();
    if (!compilerPath) {
        vscode.window.showErrorMessage('Omniscript CLI not found. Please install it first.');
        return;
    }

    terminal.sendText(`cd "${workspaceFolder.uri.fsPath}"`);
    terminal.sendText(`"${compilerPath}" build --output ${outputDir}`);
    
    vscode.window.showInformationMessage('Building Omniscript project...');
}

async function runFile(uri?: vscode.Uri): Promise<void> {
    const filePath = getActiveFilePath(uri);
    if (!filePath) {
        vscode.window.showErrorMessage('No Omniscript file selected');
        return;
    }

    // First compile the file
    await compileFile(uri);

    // Then run it
    const terminal = vscode.window.createTerminal('Omniscript Run');
    terminal.show();

    const compilerPath = await getOmniscriptPath();
    if (!compilerPath) {
        vscode.window.showErrorMessage('Omniscript CLI not found. Please install it first.');
        return;
    }

    terminal.sendText(`"${compilerPath}" run "${filePath}"`);
}

async function debugFile(uri?: vscode.Uri): Promise<void> {
    const filePath = getActiveFilePath(uri);
    if (!filePath) {
        vscode.window.showErrorMessage('No Omniscript file selected');
        return;
    }

    const config = vscode.workspace.getConfiguration('omniscript');
    const debugEnabled = config.get<boolean>('debug.enable', true);

    if (!debugEnabled) {
        vscode.window.showWarningMessage('Debugging is disabled in settings');
        return;
    }

    const terminal = vscode.window.createTerminal('Omniscript Debug');
    terminal.show();

    const compilerPath = await getOmniscriptPath();
    if (!compilerPath) {
        vscode.window.showErrorMessage('Omniscript CLI not found. Please install it first.');
        return;
    }

    terminal.sendText(`"${compilerPath}" debug "${filePath}"`);
    vscode.window.showInformationMessage(`Debugging ${path.basename(filePath)}...`);
}

async function checkTypes(uri?: vscode.Uri): Promise<void> {
    const filePath = getActiveFilePath(uri);
    if (!filePath) {
        vscode.window.showErrorMessage('No Omniscript file selected');
        return;
    }

    const compilerPath = await getOmniscriptPath();
    if (!compilerPath) {
        vscode.window.showErrorMessage('Omniscript CLI not found. Please install it first.');
        return;
    }

    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Checking types...",
        cancellable: false
    }, async (progress) => {
        return new Promise<void>((resolve, reject) => {
            const process = spawn(compilerPath, ['check', filePath]);
            let output = '';
            let errorOutput = '';

            process.stdout.on('data', (data) => {
                output += data.toString();
            });

            process.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            process.on('close', (code) => {
                if (code === 0) {
                    vscode.window.showInformationMessage('✅ No type errors found');
                } else {
                    vscode.window.showErrorMessage(`❌ Type errors found:\n${errorOutput}`);
                }
                resolve();
            });

            process.on('error', (error) => {
                vscode.window.showErrorMessage(`Error running type checker: ${error.message}`);
                reject(error);
            });
        });
    });
}

async function formatDocument(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'omniscript') {
        vscode.window.showErrorMessage('No active Omniscript file');
        return;
    }

    const config = vscode.workspace.getConfiguration('omniscript');
    const formatEnabled = config.get<boolean>('format.enable', true);

    if (!formatEnabled) {
        vscode.window.showWarningMessage('Formatting is disabled in settings');
        return;
    }

    const compilerPath = await getOmniscriptPath();
    if (!compilerPath) {
        vscode.window.showErrorMessage('Omniscript CLI not found. Please install it first.');
        return;
    }

    const filePath = editor.document.uri.fsPath;
    
    return new Promise<void>((resolve, reject) => {
        const process = spawn(compilerPath, ['format', filePath]);
        let formattedContent = '';
        let errorOutput = '';

        process.stdout.on('data', (data) => {
            formattedContent += data.toString();
        });

        process.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        process.on('close', (code) => {
            if (code === 0 && formattedContent) {
                const edit = new vscode.WorkspaceEdit();
                const fullRange = new vscode.Range(
                    editor.document.positionAt(0),
                    editor.document.positionAt(editor.document.getText().length)
                );
                edit.replace(editor.document.uri, fullRange, formattedContent);
                vscode.workspace.applyEdit(edit);
                vscode.window.showInformationMessage('Document formatted');
            } else {
                vscode.window.showErrorMessage(`Formatting failed: ${errorOutput}`);
            }
            resolve();
        });

        process.on('error', (error) => {
            vscode.window.showErrorMessage(`Error running formatter: ${error.message}`);
            reject(error);
        });
    });
}

async function createNewProject(): Promise<void> {
    const projectName = await vscode.window.showInputBox({
        prompt: 'Enter project name',
        validateInput: (value) => {
            if (!value || value.trim().length === 0) {
                return 'Project name cannot be empty';
            }
            if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                return 'Project name can only contain letters, numbers, hyphens, and underscores';
            }
            return null;
        }
    });

    if (!projectName) {
        return;
    }

    const folderUri = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false,
        openLabel: 'Select folder for new project'
    });

    if (!folderUri || folderUri.length === 0) {
        return;
    }

    const projectPath = path.join(folderUri[0].fsPath, projectName);

    if (fs.existsSync(projectPath)) {
        vscode.window.showErrorMessage(`Directory ${projectName} already exists`);
        return;
    }

    const compilerPath = await getOmniscriptPath();
    if (!compilerPath) {
        vscode.window.showErrorMessage('Omniscript CLI not found. Please install it first.');
        return;
    }

    const terminal = vscode.window.createTerminal('Omniscript New Project');
    terminal.show();

    terminal.sendText(`cd "${folderUri[0].fsPath}"`);
    terminal.sendText(`"${compilerPath}" init "${projectName}"`);

    vscode.window.showInformationMessage(`Creating new Omniscript project: ${projectName}`);

    // Auto-open the new project after a delay
    setTimeout(async () => {
        const openProject = await vscode.window.showInformationMessage(
            `Project ${projectName} created successfully!`,
            'Open Project'
        );
        
        if (openProject === 'Open Project') {
            const projectUri = vscode.Uri.file(projectPath);
            await vscode.commands.executeCommand('vscode.openFolder', projectUri);
        }
    }, 3000);
}

async function installOmniscriptCLI(): Promise<void> {
    const choice = await vscode.window.showQuickPick([
        { label: 'Install via npm (global)', description: 'npm install -g omniscript' },
        { label: 'Install from source', description: 'Build and install from Omniscript repository' },
        { label: 'Download binary', description: 'Download pre-built binary' }
    ], {
        placeHolder: 'Choose installation method'
    });

    if (!choice) {
        return;
    }

    const terminal = vscode.window.createTerminal('Omniscript Install');
    terminal.show();

    switch (choice.label) {
        case 'Install via npm (global)':
            terminal.sendText('npm install -g omniscript');
            break;
        case 'Install from source':
            terminal.sendText('git clone https://github.com/RyAnPr1Me/Omniscript.git');
            terminal.sendText('cd Omniscript');
            terminal.sendText('npm install');
            terminal.sendText('npm run build');
            terminal.sendText('npm link');
            break;
        case 'Download binary':
            vscode.env.openExternal(vscode.Uri.parse('https://github.com/RyAnPr1Me/Omniscript/releases'));
            break;
    }

    vscode.window.showInformationMessage('Installing Omniscript CLI...');
}

async function getOmniscriptPath(): Promise<string | null> {
    const config = vscode.workspace.getConfiguration('omniscript');
    const customPath = config.get<string>('compiler.path');

    if (customPath && fs.existsSync(customPath)) {
        return customPath;
    }

    // Try to find omni command in PATH
    return new Promise((resolve) => {
        const process = spawn('which', ['omni'], { shell: true });
        let output = '';

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.on('close', (code) => {
            if (code === 0 && output.trim()) {
                resolve(output.trim());
            } else {
                // Try Windows where command
                const winProcess = spawn('where', ['omni'], { shell: true });
                let winOutput = '';

                winProcess.stdout.on('data', (data) => {
                    winOutput += data.toString();
                });

                winProcess.on('close', (winCode) => {
                    if (winCode === 0 && winOutput.trim()) {
                        resolve(winOutput.trim().split('\n')[0]);
                    } else {
                        resolve(null);
                    }
                });
            }
        });
    });
}

function getActiveFilePath(uri?: vscode.Uri): string | null {
    if (uri) {
        return uri.fsPath;
    }

    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === 'omniscript') {
        return editor.document.uri.fsPath;
    }

    return null;
}

async function updateDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection): Promise<void> {
    const config = vscode.workspace.getConfiguration('omniscript');
    const lintingEnabled = config.get<boolean>('linting.enable', true);

    if (!lintingEnabled) {
        return;
    }

    const compilerPath = await getOmniscriptPath();
    if (!compilerPath) {
        return;
    }

    const filePath = document.uri.fsPath;
    
    return new Promise<void>((resolve) => {
        const process = spawn(compilerPath, ['check', '--json', filePath]);
        let output = '';

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.on('close', (code) => {
            const diagnostics: vscode.Diagnostic[] = [];

            try {
                if (output.trim()) {
                    const errors = JSON.parse(output);
                    for (const error of errors) {
                        const range = new vscode.Range(
                            error.line - 1, error.column - 1,
                            error.line - 1, error.column + error.length
                        );
                        const diagnostic = new vscode.Diagnostic(
                            range,
                            error.message,
                            error.severity === 'error' ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning
                        );
                        diagnostics.push(diagnostic);
                    }
                }
            } catch (parseError) {
                // If JSON parsing fails, ignore
            }

            collection.set(document.uri, diagnostics);
            resolve();
        });
    });
}

function initializeLanguageFeatures(context: vscode.ExtensionContext): void {
    // Register hover provider
    const hoverProvider = vscode.languages.registerHoverProvider('omniscript', {
        provideHover(document, position, token) {
            const range = document.getWordRangeAtPosition(position);
            const word = document.getText(range);
            
            // Provide basic hover information
            return new vscode.Hover(`**${word}** (Omniscript symbol)`);
        }
    });

    // Register completion provider
    const completionProvider = vscode.languages.registerCompletionItemProvider('omniscript', {
        provideCompletionItems(document, position, token, context) {
            const completions: vscode.CompletionItem[] = [];

            // Add basic keywords
            const keywords = ['function', 'class', 'interface', 'type', 'let', 'const', 'var', 'if', 'else', 'for', 'while', 'return'];
            for (const keyword of keywords) {
                const completion = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
                completions.push(completion);
            }

            return completions;
        }
    });

    context.subscriptions.push(hoverProvider, completionProvider);
}

export function deactivate() {
    console.log('Omniscript extension deactivated');
}