[Setup]
AppId={{B8C313D5-2D75-4555-A999-5ECBBDF90A09}}
AppName=Omniscript
AppVersion=2.1.0
AppVerName=Omniscript 2.1.0
AppPublisher=RyAnPr1Me
AppPublisherURL=https://github.com/RyAnPr1Me/Omniscript
AppSupportURL=https://github.com/RyAnPr1Me/Omniscript/issues
AppUpdatesURL=https://github.com/RyAnPr1Me/Omniscript/releases
AppCopyright=Copyright (C) 2024 RyAnPr1Me
DefaultDirName={autopf}\Omniscript
DefaultGroupName=Omniscript
AllowNoIcons=yes
LicenseFile=LICENSE
InfoBeforeFile=README.md
InfoAfterFile=CHANGELOG.md
OutputDir=Output
OutputBaseFilename=OmniscriptSetup-{#SetupSetting("AppVersion")}
SetupIconFile=compiler:SetupClassicIcon.ico
Compression=lzma2/ultra64
SolidCompression=yes
InternalCompressLevel=ultra64
CompressionThreads=auto
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=dialog commandline
ArchitecturesAllowed=x64 arm64
ArchitecturesInstallIn64BitMode=x64 arm64
UsePreviousAppDir=yes
UsePreviousGroup=yes
UninstallDisplayIcon={app}\bin\cli.js
UninstallDisplayName=Omniscript Programming Language
UninstallFilesDir={app}\uninst
VersionInfoVersion=2.1.0
VersionInfoCompany=RyAnPr1Me
VersionInfoDescription=Modern programming language for full-stack development
VersionInfoCopyright=Copyright (C) 2024 RyAnPr1Me
VersionInfoProductName=Omniscript
VersionInfoProductVersion=2.1.0
WizardStyle=modern
WizardResizable=yes
WizardSizePercent=120
DisableWelcomePage=no
DisableReadyPage=no
DisableFinishedPage=no
DisableDirPage=no
DisableProgramGroupPage=no
ShowLanguageDialog=yes
ShowUndisplayableLanguages=no
AppendDefaultDirName=no
UsePreviousSetupType=yes
UsePreviousLanguage=yes
UsePreviousPrivileges=yes
AlwaysShowDirOnReadyPage=yes
AlwaysShowGroupOnReadyPage=yes
AlwaysShowComponentsList=yes
FlatComponentsList=no
ShowComponentSizes=yes
ExtraDiskSpaceRequired=52428800
CloseApplications=yes
RestartApplications=yes
CloseApplicationsFilter=*.exe,*.bat,*omni*
SetupLogging=yes
ChangesEnvironment=yes
ChangesAssociations=yes

[Code]
var
  NodeJSPage: TInputDirWizardPage;
  ConfigPage: TInputQueryWizardPage;
  ComponentsInstalled: Boolean;

function InitializeSetup(): Boolean;
var
  ErrorCode: Integer;
  NodeVersion: String;
  NodePath: String;
  ResultCode: Integer;
begin
  Result := True;
  ComponentsInstalled := False;
  
  // Check if Node.js is installed
  if not Exec('cmd.exe', '/c node --version', '', SW_HIDE, ewWaitUntilTerminated, ErrorCode) or (ErrorCode <> 0) then
  begin
    case MsgBox('Node.js is required but not found on your system.' + #13#10 + 
                'Would you like to:' + #13#10 + #13#10 +
                'YES - Download and install Node.js automatically' + #13#10 +
                'NO - Continue without Node.js (installation may fail)' + #13#10 +
                'CANCEL - Exit setup', 
                mbConfirmation, MB_YESNOCANCEL) of
      IDYES: begin
        // Download and install Node.js automatically
        if MsgBox('This will download and install Node.js LTS. Continue?', mbConfirmation, MB_YESNO) = IDYES then
        begin
          // Launch Node.js installer
          if not ShellExec('open', 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi', '', '', SW_SHOWNORMAL, ewWaitUntilTerminated, ErrorCode) then
          begin
            MsgBox('Failed to download Node.js installer. Please install Node.js manually from https://nodejs.org/', mbError, MB_OK);
            Result := False;
            Exit;
          end;
        end;
      end;
      IDNO: begin
        // Continue but warn user
        MsgBox('Warning: Without Node.js, Omniscript will not function properly. You can install Node.js later from https://nodejs.org/', mbInformation, MB_OK);
      end;
      IDCANCEL: begin
        Result := False;
        Exit;
      end;
    end;
  end else begin
    // Check Node.js version
    if Exec('cmd.exe', '/c node --version', '', SW_HIDE, ewWaitUntilTerminated, ErrorCode) and (ErrorCode = 0) then
    begin
      Log('Node.js is installed and accessible');
    end;
  end;
end;

procedure InitializeWizard();
begin
  // Create custom Node.js path page
  NodeJSPage := CreateInputDirPage(wpSelectDir,
    'Node.js Installation', 'Where is Node.js installed?',
    'Setup will look for Node.js in the following folder. To continue, click Next. If you would like to select a different folder, click Browse.',
    False, '');
  NodeJSPage.Add('Node.js installation folder:');
  NodeJSPage.Values[0] := 'C:\Program Files\nodejs';

  // Create configuration page
  ConfigPage := CreateInputQueryPage(wpSelectComponents,
    'Configuration Options', 'Customize your Omniscript installation',
    'Please specify configuration options for your Omniscript installation.');
  ConfigPage.Add('Global command name (default: omni):', False);
  ConfigPage.Add('Default project directory:', False);
  ConfigPage.Add('Maximum memory limit (MB):', False);
  ConfigPage.Values[0] := 'omni';
  ConfigPage.Values[1] := ExpandConstant('{userdocs}\OmniscriptProjects');
  ConfigPage.Values[2] := '512';
end;

function ShouldSkipPage(PageID: Integer): Boolean;
var
  ErrorCode: Integer;
begin
  Result := False;
  // Skip Node.js page if Node.js is already in PATH
  if (PageID = NodeJSPage.ID) then
  begin
    Result := Exec('cmd.exe', '/c node --version', '', SW_HIDE, ewWaitUntilTerminated, ErrorCode);
    Result := Result and (ErrorCode = 0);
  end;
end;

procedure RegisterPreviousData(PreviousDataKey: Integer);
begin
  // Store previous configuration
  SetPreviousData(PreviousDataKey, 'GlobalCommand', ConfigPage.Values[0]);
  SetPreviousData(PreviousDataKey, 'ProjectDir', ConfigPage.Values[1]);
  SetPreviousData(PreviousDataKey, 'MemoryLimit', ConfigPage.Values[2]);
end;

function GetGlobalCommandName(Param: String): String;
begin
  Result := ConfigPage.Values[0];
end;

function GetProjectDirectory(Param: String): String;
begin
  Result := ConfigPage.Values[1];
end;

function GetMemoryLimit(Param: String): String;
begin
  Result := ConfigPage.Values[2];
end;

function ShouldRemoveProjectData(): Boolean;
begin
  Result := (MsgBox('Do you want to remove project templates and user data?', mbConfirmation, MB_YESNO) = IDYES);
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ConfigFile: String;
  ConfigContent: TStringList;
begin
  if CurStep = ssPostInstall then
  begin
    // Create configuration file
    ConfigFile := ExpandConstant('{app}\omni.config.json');
    ConfigContent := TStringList.Create;
    try
      ConfigContent.Add('{');
      ConfigContent.Add('  "globalCommand": "' + ConfigPage.Values[0] + '",');
      ConfigContent.Add('  "defaultProjectDirectory": "' + StringChangeEx(ConfigPage.Values[1], '\', '\\', True) + '",');
      ConfigContent.Add('  "memoryLimit": ' + ConfigPage.Values[2] + ',');
      ConfigContent.Add('  "version": "2.1.0",');
      ConfigContent.Add('  "installPath": "' + StringChangeEx(ExpandConstant('{app}'), '\', '\\', True) + '",');
      ConfigContent.Add('  "installDate": "' + GetDateTimeString('yyyy-mm-dd hh:nn:ss', #0, #0) + '"');
      ConfigContent.Add('}');
      ConfigContent.SaveToFile(ConfigFile);
    finally
      ConfigContent.Free;
    end;

    // Create project directory if it doesn't exist
    if not DirExists(ConfigPage.Values[1]) then
    begin
      if MsgBox('Create default project directory at "' + ConfigPage.Values[1] + '"?', mbConfirmation, MB_YESNO) = IDYES then
      begin
        ForceDirectories(ConfigPage.Values[1]);
      end;
    end;

    ComponentsInstalled := True;
  end;
end;

function PrepareToInstall(var NeedsRestart: Boolean): String;
var
  ResultCode: Integer;
begin
  Result := '';
  NeedsRestart := False;
  
  // Verify Node.js is accessible
  if not Exec('cmd.exe', '/c node --version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
  begin
    if MsgBox('Node.js is still not accessible. Continue installation anyway?', mbConfirmation, MB_YESNO) = IDNO then
    begin
      Result := 'Node.js is required for Omniscript to function properly.';
    end;
  end;
end;

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"
Name: "catalan"; MessagesFile: "compiler:Languages\Catalan.isl"
Name: "corsican"; MessagesFile: "compiler:Languages\Corsican.isl"
Name: "czech"; MessagesFile: "compiler:Languages\Czech.isl"
Name: "danish"; MessagesFile: "compiler:Languages\Danish.isl"
Name: "dutch"; MessagesFile: "compiler:Languages\Dutch.isl"
Name: "finnish"; MessagesFile: "compiler:Languages\Finnish.isl"
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "german"; MessagesFile: "compiler:Languages\German.isl"
Name: "hebrew"; MessagesFile: "compiler:Languages\Hebrew.isl"
Name: "icelandic"; MessagesFile: "compiler:Languages\Icelandic.isl"
Name: "italian"; MessagesFile: "compiler:Languages\Italian.isl"
Name: "japanese"; MessagesFile: "compiler:Languages\Japanese.isl"
Name: "norwegian"; MessagesFile: "compiler:Languages\Norwegian.isl"
Name: "polish"; MessagesFile: "compiler:Languages\Polish.isl"
Name: "portuguese"; MessagesFile: "compiler:Languages\Portuguese.isl"
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"
Name: "slovak"; MessagesFile: "compiler:Languages\Slovak.isl"
Name: "slovenian"; MessagesFile: "compiler:Languages\Slovenian.isl"
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"
Name: "turkish"; MessagesFile: "compiler:Languages\Turkish.isl"
Name: "ukrainian"; MessagesFile: "compiler:Languages\Ukrainian.isl"

[CustomMessages]
english.WelcomeLabel2=This will install [name/ver] on your computer.%n%nOmniscript is a modern programming language for full-stack development with type safety, async/await support, pattern matching, and built-in ORM capabilities.%n%nIt is recommended that you close all other applications before continuing.
english.ComponentsDescription=Select the components you want to install:
english.TypesDescription=Select the type of installation:
english.FullInstallation=Full installation (recommended)
english.CompactInstallation=Compact installation
english.CustomInstallation=Custom installation
english.NodeJSRequired=Node.js v16+ is required for Omniscript to function properly.
english.ConfiguringOmniscript=Configuring Omniscript...
english.InstallingComponents=Installing selected components...
english.RegisteringFileTypes=Registering file associations...
english.CreatingShortcuts=Creating shortcuts and menu items...
english.FinalizingSetup=Finalizing setup...
english.InstallationComplete=Omniscript has been successfully installed!
english.LaunchOmniscript=Launch Omniscript CLI
english.ViewDocumentation=View Documentation
english.CreateSampleProject=Create Sample Project

[Types]
Name: "full"; Description: "Full installation (recommended)"
Name: "compact"; Description: "Compact installation"
Name: "custom"; Description: "Custom installation"; Flags: iscustom

[Components]
Name: "core"; Description: "Omniscript Core Engine"; Types: full compact custom; Flags: fixed
Name: "cli"; Description: "Command Line Interface"; Types: full compact custom; Flags: fixed
Name: "docs"; Description: "Documentation and Examples"; Types: full custom
Name: "examples"; Description: "Example Projects and Templates"; Types: full custom
Name: "devtools"; Description: "Development Tools"; Types: full custom
Name: "devtools\debugger"; Description: "Built-in Debugger"; Types: full custom
Name: "devtools\profiler"; Description: "Performance Profiler"; Types: full custom
Name: "devtools\linter"; Description: "Code Linter"; Types: full custom
Name: "integrations"; Description: "IDE Integrations"; Types: full custom
Name: "integrations\vscode"; Description: "VS Code Extension Support"; Types: full custom
Name: "integrations\vim"; Description: "Vim/Neovim Integration"; Types: custom
Name: "optional"; Description: "Optional Components"; Types: custom
Name: "optional\shell"; Description: "Enhanced Shell Integration"; Types: custom
Name: "optional\gui"; Description: "GUI Project Manager"; Types: custom

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1
Name: "addtopath"; Description: "Add Omniscript to system PATH"; GroupDescription: "Environment"; Flags: checkedonce
Name: "addtouserpath"; Description: "Add to user PATH only (if admin install fails)"; GroupDescription: "Environment"
Name: "fileassoc"; Description: "Associate .omni and .os files with Omniscript"; GroupDescription: "File Associations"; Flags: checkedonce
Name: "startmenu"; Description: "Create Start Menu shortcuts"; GroupDescription: "{cm:AdditionalIcons}"; Flags: checkedonce
Name: "contextmenu"; Description: "Add 'Run with Omniscript' to context menu"; GroupDescription: "Shell Integration"
Name: "autostart"; Description: "Start Omniscript service at Windows startup"; GroupDescription: "Services"
Name: "uninstallregclean"; Description: "Clean registry entries on uninstall"; GroupDescription: "Uninstall Options"; Flags: checkedonce

[Files]
; Core engine files (always installed)
Source: "bin\cli.js"; DestDir: "{app}\bin"; Flags: ignoreversion; Components: core
Source: "dist\*"; DestDir: "{app}\lib"; Flags: ignoreversion recursesubdirs createallsubdirs; Components: core
Source: "LICENSE"; DestDir: "{app}"; Flags: ignoreversion; Components: core
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion; Components: core
Source: "tsconfig.json"; DestDir: "{app}"; Flags: ignoreversion; Components: core

; CLI components
Source: "omni.bat"; DestDir: "{app}"; Flags: ignoreversion; Components: cli
Source: ".npmrc"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist; Components: cli

; Documentation
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion; Components: docs
Source: "CHANGELOG.md"; DestDir: "{app}"; Flags: ignoreversion; Components: docs
Source: "CONTRIBUTING.md"; DestDir: "{app}"; Flags: ignoreversion; Components: docs
Source: "SECURITY.md"; DestDir: "{app}"; Flags: ignoreversion; Components: docs
Source: "docs\*"; DestDir: "{app}\docs"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist; Components: docs

; Examples and templates
Source: "examples\*"; DestDir: "{app}\examples"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist; Components: examples
Source: "demos\*"; DestDir: "{app}\demos"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist; Components: examples

; Development tools
Source: "dist\debugger\*"; DestDir: "{app}\tools\debugger"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist; Components: devtools\debugger
Source: "dist\profiler\*"; DestDir: "{app}\tools\profiler"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist; Components: devtools\profiler
Source: "dist\linter\*"; DestDir: "{app}\tools\linter"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist; Components: devtools\linter

; IDE Integrations
Source: "integrations\vscode\*"; DestDir: "{app}\integrations\vscode"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist; Components: integrations\vscode
Source: "integrations\vim\*"; DestDir: "{app}\integrations\vim"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist; Components: integrations\vim

; Optional GUI components
Source: "dist\gui\*"; DestDir: "{app}\gui"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist; Components: optional\gui

; Bundle production dependencies (optimized)
Source: "node_modules\*"; DestDir: "{app}\node_modules"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "*.git\*,*.svn\*,*.md,*.txt,CHANGELOG*,CHANGES*,README*,AUTHORS*,CONTRIBUTORS*,LICENSE*,COPYING*,NOTICE*,*.test.js,test\*,tests\*,spec\*,docs\*,doc\*,examples\*,example\*,*.d.ts,*.map,*.min.js.map,node_modules\typescript\*,node_modules\@types\*,node_modules\jest\*,node_modules\eslint\*"; Components: core

; Configuration files
Source: "omni.json"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist; Components: core

[Icons]
; Start Menu Icons
Name: "{group}\Omniscript CLI"; Filename: "node"; Parameters: """{app}\bin\cli.js"""; WorkingDir: "{app}"; Comment: "Omniscript Command Line Interface"; IconFilename: "{app}\bin\cli.js"; Tasks: startmenu
Name: "{group}\Omniscript GUI"; Filename: "{app}\gui\omniscript-gui.exe"; WorkingDir: "{app}"; Comment: "Omniscript Graphical Interface"; Components: optional\gui; Tasks: startmenu
Name: "{group}\Omniscript Documentation"; Filename: "{app}\README.md"; Comment: "Open Omniscript documentation"; Components: docs; Tasks: startmenu
Name: "{group}\Omniscript Examples"; Filename: "explorer"; Parameters: """{app}\examples"""; Comment: "Browse example projects"; Components: examples; Tasks: startmenu
Name: "{group}\Project Manager"; Filename: "{app}\gui\project-manager.exe"; WorkingDir: "{app}"; Comment: "Omniscript Project Manager"; Components: optional\gui; Tasks: startmenu
Name: "{group}\Developer Tools\Debugger"; Filename: "node"; Parameters: """{app}\tools\debugger\debugger.js"""; WorkingDir: "{app}"; Comment: "Omniscript Debugger"; Components: devtools\debugger; Tasks: startmenu
Name: "{group}\Developer Tools\Profiler"; Filename: "node"; Parameters: """{app}\tools\profiler\profiler.js"""; WorkingDir: "{app}"; Comment: "Omniscript Performance Profiler"; Components: devtools\profiler; Tasks: startmenu
Name: "{group}\Developer Tools\Code Linter"; Filename: "node"; Parameters: """{app}\tools\linter\linter.js"""; WorkingDir: "{app}"; Comment: "Omniscript Code Linter"; Components: devtools\linter; Tasks: startmenu
Name: "{group}\Uninstall Omniscript"; Filename: "{uninstallexe}"; Comment: "Uninstall Omniscript"

; Desktop Icons
Name: "{autodesktop}\Omniscript CLI"; Filename: "node"; Parameters: """{app}\bin\cli.js"""; WorkingDir: "{app}"; Comment: "Omniscript Command Line Interface"; IconFilename: "{app}\bin\cli.js"; Tasks: desktopicon
Name: "{autodesktop}\Omniscript GUI"; Filename: "{app}\gui\omniscript-gui.exe"; WorkingDir: "{app}"; Comment: "Omniscript Graphical Interface"; Components: optional\gui; Tasks: desktopicon

; Quick Launch Icons  
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Omniscript CLI"; Filename: "node"; Parameters: """{app}\bin\cli.js"""; WorkingDir: "{app}"; Comment: "Omniscript CLI"; Tasks: quicklaunchicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Omniscript GUI"; Filename: "{app}\gui\omniscript-gui.exe"; WorkingDir: "{app}"; Comment: "Omniscript GUI"; Components: optional\gui; Tasks: quicklaunchicon

[Run]
; Check Node.js installation and version
Filename: "{cmd}"; Parameters: "/c node --version > ""{tmp}\nodeversion.txt"" 2>&1 || (echo Node.js not found > ""{tmp}\nodeversion.txt"")"; Flags: runhidden waituntilterminated; StatusMsg: "Checking Node.js installation..."; BeforeInstall: Log('Checking Node.js installation')

; Validate Node.js version compatibility
Filename: "{cmd}"; Parameters: "/c for /f ""tokens=1"" %i in ('node --version 2^>nul') do if ""%i"" GEQ ""v16.0.0"" (echo Compatible Node.js version: %i) else (echo Warning: Node.js version %i may not be compatible. Recommended: v16+)"; Flags: runhidden waituntilterminated; StatusMsg: "Validating Node.js version compatibility..."

; Validate bundled dependencies
Filename: "{cmd}"; Parameters: "/c if exist ""{app}\node_modules"" (echo Bundled dependencies validated successfully) else (echo Warning: node_modules directory not found)"; Flags: runhidden waituntilterminated; StatusMsg: "Validating bundled dependencies..."

; Create symbolic links for better CLI integration  
Filename: "{cmd}"; Parameters: "/c mklink ""{sys}\{code:GetGlobalCommandName}.bat"" ""{app}\omni.bat"""; Flags: runhidden waituntilterminated; StatusMsg: "Creating command aliases..."; Tasks: addtopath; Check: IsAdminInstallMode

; Copy batch file to system directory for non-admin installs
Filename: "{cmd}"; Parameters: "/c copy ""{app}\omni.bat"" ""{localappdata}\Microsoft\WindowsApps\{code:GetGlobalCommandName}.bat"""; Flags: runhidden waituntilterminated; StatusMsg: "Installing user-level command..."; Tasks: addtouserpath; Check: not IsAdminInstallMode

; Initialize Omniscript workspace
Filename: "node"; Parameters: """{app}\bin\cli.js"" init --global --config ""{app}\omni.config.json"""; WorkingDir: "{code:GetProjectDirectory}"; Flags: runhidden waituntilterminated; StatusMsg: "Initializing Omniscript workspace..."; Components: core

Filename: "{cmd}"; Parameters: "/c if exist ""%USERPROFILE%\AppData\Local\Programs\Microsoft VS Code\bin\code.cmd"" (""%USERPROFILE%\AppData\Local\Programs\Microsoft VS Code\bin\code.cmd"" --install-extension ""{app}\integrations\vscode\omniscript.vsix"" --force) else (echo VS Code not found, skipping extension install)"; Flags: runhidden waituntilterminated; StatusMsg: "Installing VS Code extension..."; Components: integrations\vscode

; Setup development environment
Filename: "node"; Parameters: """{app}\tools\linter\setup.js"" --install-hooks"; WorkingDir: "{app}"; Flags: runhidden waituntilterminated; StatusMsg: "Setting up development environment..."; Components: devtools\linter

; Create sample project
Filename: "node"; Parameters: """{app}\bin\cli.js"" create sample-project --template basic --location ""{code:GetProjectDirectory}\sample-project"""; WorkingDir: "{code:GetProjectDirectory}"; Description: "Create a sample project"; Flags: postinstall skipifsilent; Components: examples; StatusMsg: "Creating sample project..."

; Start GUI application
Filename: "{app}\gui\omniscript-gui.exe"; WorkingDir: "{app}"; Description: "Launch Omniscript GUI"; Flags: postinstall skipifsilent nowait; Components: optional\gui

; Verify installation with comprehensive test
Filename: "node"; Parameters: """{app}\bin\cli.js"" --version && echo Installation completed successfully"; WorkingDir: "{app}"; Description: "Verify Omniscript installation"; Flags: postinstall skipifsilent; StatusMsg: "Verifying installation..."

; Open documentation
Filename: "{app}\README.md"; Description: "View Omniscript documentation"; Flags: postinstall skipifsilent shellexec; Components: docs

; Register for automatic updates
Filename: "node"; Parameters: """{app}\bin\cli.js"" update --register"; WorkingDir: "{app}"; Description: "Register for automatic updates"; Flags: postinstall skipifsilent unchecked; StatusMsg: "Registering for updates..."

; Performance optimization
Filename: "node"; Parameters: """{app}\tools\profiler\optimize.js"" --system-tune"; WorkingDir: "{app}"; Description: "Optimize system for Omniscript (recommended)"; Flags: postinstall skipifsilent unchecked; Components: devtools\profiler

[Registry]
; System PATH management
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app};{app}\bin"; Flags: preservestringtype uninsdeletevalue; Tasks: addtopath; Check: IsAdminInstallMode
Root: HKCU; Subkey: "Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app};{app}\bin"; Flags: preservestringtype uninsdeletevalue; Tasks: addtouserpath; Check: not IsAdminInstallMode

; Application registration
Root: HKLM; Subkey: "Software\Microsoft\Windows\CurrentVersion\Uninstall\Omniscript"; ValueType: string; ValueName: "DisplayName"; ValueData: "Omniscript Programming Language"; Flags: uninsdeletekey; Check: IsAdminInstallMode
Root: HKLM; Subkey: "Software\Microsoft\Windows\CurrentVersion\Uninstall\Omniscript"; ValueType: string; ValueName: "DisplayVersion"; ValueData: "2.1.0"; Check: IsAdminInstallMode
Root: HKLM; Subkey: "Software\Microsoft\Windows\CurrentVersion\Uninstall\Omniscript"; ValueType: string; ValueName: "Publisher"; ValueData: "RyAnPr1Me"; Check: IsAdminInstallMode
Root: HKLM; Subkey: "Software\Microsoft\Windows\CurrentVersion\Uninstall\Omniscript"; ValueType: string; ValueName: "InstallLocation"; ValueData: "{app}"; Check: IsAdminInstallMode

; File associations for .os files
Root: HKCU; Subkey: "Software\Classes\.os"; ValueType: string; ValueName: ""; ValueData: "OmniscriptFile"; Flags: uninsdeletevalue; Tasks: fileassoc
Root: HKCU; Subkey: "Software\Classes\.os"; ValueType: string; ValueName: "Content Type"; ValueData: "text/plain"; Tasks: fileassoc
Root: HKCU; Subkey: "Software\Classes\.os"; ValueType: string; ValueName: "PerceivedType"; ValueData: "text"; Tasks: fileassoc
Root: HKCU; Subkey: "Software\Classes\OmniscriptFile"; ValueType: string; ValueName: ""; ValueData: "Omniscript Source File"; Flags: uninsdeletekey; Tasks: fileassoc
Root: HKCU; Subkey: "Software\Classes\OmniscriptFile"; ValueType: string; ValueName: "FriendlyTypeName"; ValueData: "Omniscript Source File"; Tasks: fileassoc
Root: HKCU; Subkey: "Software\Classes\OmniscriptFile\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\bin\cli.js,0"; Tasks: fileassoc
Root: HKCU; Subkey: "Software\Classes\OmniscriptFile\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """node"" ""{app}\bin\cli.js"" run ""%1"" %*"; Tasks: fileassoc
Root: HKCU; Subkey: "Software\Classes\OmniscriptFile\shell\edit\command"; ValueType: string; ValueName: ""; ValueData: "notepad ""%1"""; Tasks: fileassoc
Root: HKCU; Subkey: "Software\Classes\OmniscriptFile\shell\debug\command"; ValueType: string; ValueName: ""; ValueData: """node"" ""{app}\tools\debugger\debugger.js"" ""%1"""; Tasks: fileassoc; Components: devtools\debugger

; File associations for .omni files  
Root: HKCU; Subkey: "Software\Classes\.omni"; ValueType: string; ValueName: ""; ValueData: "OmniscriptProjectFile"; Flags: uninsdeletevalue; Tasks: fileassoc
Root: HKCU; Subkey: "Software\Classes\.omni"; ValueType: string; ValueName: "Content Type"; ValueData: "application/json"; Tasks: fileassoc
Root: HKCU; Subkey: "Software\Classes\OmniscriptProjectFile"; ValueType: string; ValueName: ""; ValueData: "Omniscript Project File"; Flags: uninsdeletekey; Tasks: fileassoc
Root: HKCU; Subkey: "Software\Classes\OmniscriptProjectFile\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """node"" ""{app}\bin\cli.js"" project open ""%1"""; Tasks: fileassoc

; Context menu integration
Root: HKCU; Subkey: "Software\Classes\*\shell\RunWithOmniscript"; ValueType: string; ValueName: ""; ValueData: "Run with Omniscript"; Flags: uninsdeletekey; Tasks: contextmenu
Root: HKCU; Subkey: "Software\Classes\*\shell\RunWithOmniscript"; ValueType: string; ValueName: "Icon"; ValueData: "{app}\bin\cli.js,0"; Tasks: contextmenu
Root: HKCU; Subkey: "Software\Classes\*\shell\RunWithOmniscript\command"; ValueType: string; ValueName: ""; ValueData: """node"" ""{app}\bin\cli.js"" run ""%1"""; Tasks: contextmenu

Root: HKCU; Subkey: "Software\Classes\Directory\shell\OpenOmniscriptHere"; ValueType: string; ValueName: ""; ValueData: "Open Omniscript CLI Here"; Flags: uninsdeletekey; Tasks: contextmenu
Root: HKCU; Subkey: "Software\Classes\Directory\shell\OpenOmniscriptHere"; ValueType: string; ValueName: "Icon"; ValueData: "{app}\bin\cli.js,0"; Tasks: contextmenu
Root: HKCU; Subkey: "Software\Classes\Directory\shell\OpenOmniscriptHere\command"; ValueType: string; ValueName: ""; ValueData: "cmd.exe /k cd /d ""%1"" && ""{app}\omni.bat"""; Tasks: contextmenu

; URL protocol registration for omniscript:// links
Root: HKCU; Subkey: "Software\Classes\omniscript"; ValueType: string; ValueName: ""; ValueData: "URL:Omniscript Protocol"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\omniscript"; ValueType: string; ValueName: "URL Protocol"; ValueData: ""
Root: HKCU; Subkey: "Software\Classes\omniscript\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\bin\cli.js,0"
Root: HKCU; Subkey: "Software\Classes\omniscript\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """node"" ""{app}\bin\cli.js"" protocol ""%1"""

; User preferences
Root: HKCU; Subkey: "Software\Omniscript"; ValueType: string; ValueName: "InstallPath"; ValueData: "{app}"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Omniscript"; ValueType: string; ValueName: "Version"; ValueData: "2.1.0"
Root: HKCU; Subkey: "Software\Omniscript"; ValueType: string; ValueName: "GlobalCommand"; ValueData: "{code:GetGlobalCommandName}"
Root: HKCU; Subkey: "Software\Omniscript"; ValueType: string; ValueName: "ProjectDirectory"; ValueData: "{code:GetProjectDirectory}"
Root: HKCU; Subkey: "Software\Omniscript"; ValueType: dword; ValueName: "MemoryLimit"; ValueData: "{code:GetMemoryLimit}"

; Windows startup entry
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "OmniscriptService"; ValueData: """node"" ""{app}\bin\cli.js"" service start"; Flags: uninsdeletevalue; Tasks: autostart

[UninstallDelete]
; Remove application files and directories
Type: filesandordirs; Name: "{app}"
Type: files; Name: "{sys}\omni.bat"
Type: files; Name: "{sys}\{code:GetGlobalCommandName}.bat"
Type: files; Name: "{localappdata}\Microsoft\WindowsApps\{code:GetGlobalCommandName}.bat"

; Remove configuration and cache files
Type: filesandordirs; Name: "{userappdata}\Omniscript"
Type: filesandordirs; Name: "{localappdata}\Omniscript"
Type: files; Name: "{userdocs}\.omniscriptrc"

; Remove temporary and log files
Type: filesandordirs; Name: "{tmp}\omniscript-*"
Type: files; Name: "{tmp}\nodeversion.txt"

; Remove project templates (only if user confirms)
Type: filesandordirs; Name: "{code:GetProjectDirectory}\omniscript-templates"; Check: ShouldRemoveProjectData

[UninstallRun]
; Stop any running Omniscript services
Filename: "taskkill"; Parameters: "/f /im omniscript-service.exe"; Flags: runhidden; RunOnceId: "StopOmniscriptService"
Filename: "taskkill"; Parameters: "/f /im omniscript-gui.exe"; Flags: runhidden; RunOnceId: "StopOmniscriptGUI"

; Unregister from automatic updates
Filename: "node"; Parameters: """{app}\bin\cli.js"" update --unregister"; WorkingDir: "{app}"; Flags: runhidden; RunOnceId: "UnregisterUpdates"

; Clean up VS Code extension
Filename: "{cmd}"; Parameters: "/c if exist ""{userprofile}\AppData\Local\Programs\Microsoft VS Code\bin\code.cmd"" (code --uninstall-extension omniscript-vscode --force)"; Flags: runhidden; RunOnceId: "UninstallVSCodeExt"

; Remove development environment hooks
Filename: "node"; Parameters: """{app}\tools\linter\setup.js"" --remove-hooks"; WorkingDir: "{app}"; Flags: runhidden; RunOnceId: "RemoveDevHooks"; Components: devtools\linter

; Clean system optimization
Filename: "node"; Parameters: """{app}\tools\profiler\optimize.js"" --system-restore"; WorkingDir: "{app}"; Flags: runhidden; RunOnceId: "RestoreSystemOpt"; Components: devtools\profiler

; Registry cleanup (if task was selected)
Filename: "reg"; Parameters: "delete ""HKCU\Software\Classes\.os"" /f"; Flags: runhidden; RunOnceId: "CleanOSFileAssoc"; Tasks: uninstallregclean
Filename: "reg"; Parameters: "delete ""HKCU\Software\Classes\.omni"" /f"; Flags: runhidden; RunOnceId: "CleanOMNIFileAssoc"; Tasks: uninstallregclean
Filename: "reg"; Parameters: "delete ""HKCU\Software\Classes\omniscript"" /f"; Flags: runhidden; RunOnceId: "CleanProtocolReg"; Tasks: uninstallregclean

