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

[Code]
var
  NodeJSPage: TInputDirWizardPage;
  ConfigPage: TInputQueryWizardPage;
  ComponentsInstalled: Boolean;

function InitializeSetup(): Boolean;
var
  ErrorCode: Integer;
begin
  Result := True;
  ComponentsInstalled := False;

  { Check Node.js }
  if not Exec('cmd.exe', '/c node --version', '', SW_HIDE, ewWaitUntilTerminated, ErrorCode) or (ErrorCode <> 0) then
  begin
    case MsgBox('Node.js is required but not found.' + #13#10 +
                'YES: Download and install automatically' + #13#10 +
                'NO: Continue without Node.js (may fail)' + #13#10 +
                'CANCEL: Exit setup', mbConfirmation, MB_YESNOCANCEL) of
IDYES:
begin
  if MsgBox('Download Node.js LTS now?', mbConfirmation, MB_YESNO) = IDYES then
  begin
    var ResultCode: Integer;
    if not ShellExec('open',
                     'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi',
                     '', '', SW_SHOWNORMAL, ResultCode) then
    begin
      MsgBox('Failed to open Node.js download page. Please install it manually from https://nodejs.org/', mbError, MB_OK);
    end;
  end;
end;

          begin
            MsgBox('Download failed. Install manually from https://nodejs.org/', mbError, MB_OK);
            Result := False;
          end;
      IDNO:
        MsgBox('Warning: Omniscript may not work without Node.js. Install later from https://nodejs.org/', mbInformation, MB_OK);
      IDCANCEL:
        Result := False;
    end;
  end
  else
    Log('Node.js detected.');
end;

procedure InitializeWizard();
begin
  NodeJSPage := CreateInputDirPage(wpSelectDir,
    'Node.js Installation', 'Where is Node.js installed?',
    'Select Node.js installation folder.', False, '');
  NodeJSPage.Add('Node.js installation folder:');
  NodeJSPage.Values[0] := 'C:\Program Files\nodejs';

  ConfigPage := CreateInputQueryPage(wpSelectComponents,
    'Configuration Options', 'Customize Omniscript installation',
    'Specify configuration options for Omniscript.');
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
  if (PageID = NodeJSPage.ID) then
  begin
    Result := Exec('cmd.exe', '/c node --version', '', SW_HIDE, ewWaitUntilTerminated, ErrorCode);
    Result := Result and (ErrorCode = 0);
  end;
end;

procedure RegisterPreviousData(PreviousDataKey: Integer);
begin
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
  Result := (MsgBox('Remove project templates and user data?', mbConfirmation, MB_YESNO) = IDYES);
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ConfigFile: String;
  ConfigContent: TStringList;
  ProjectDirEscaped: String;
begin
  if CurStep = ssPostInstall then
  begin
    ConfigFile := ExpandConstant('{app}\omni.config.json');
    ConfigContent := TStringList.Create;
    try
      ProjectDirEscaped := StringChangeEx(ConfigPage.Values[1], '\', '\\', True);
      ConfigContent.Add('{');
      ConfigContent.Add('  "globalCommand": "' + ConfigPage.Values[0] + '",');
      ConfigContent.Add('  "defaultProjectDirectory": "' + ProjectDirEscaped + '",');
      ConfigContent.Add('  "memoryLimit": ' + ConfigPage.Values[2] + ',');
      ConfigContent.Add('  "version": "2.1.0",');
      ConfigContent.Add('  "installPath": "' + StringChangeEx(ExpandConstant('{app}'), '\', '\\', True) + '",');
      ConfigContent.Add('  "installDate": "' + FormatDateTime('yyyy-mm-dd hh:nn:ss', Now) + '"');
      ConfigContent.Add('}');
      ConfigContent.SaveToFile(ConfigFile);
    finally
      ConfigContent.Free;
    end;

    if not DirExists(ConfigPage.Values[1]) then
      if MsgBox('Create default project directory at "' + ConfigPage.Values[1] + '"?', mbConfirmation, MB_YESNO) = IDYES then
        ForceDirectories(ConfigPage.Values[1]);

    ComponentsInstalled := True;
  end;
end;

function PrepareToInstall(var NeedsRestart: Boolean): String;
var
  ResultCode: Integer;
begin
  Result := '';
  NeedsRestart := False;
  if not Exec('cmd.exe', '/c node --version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) then
    if MsgBox('Node.js not accessible. Continue installation?', mbConfirmation, MB_YESNO) = IDNO then
      Result := 'Node.js is required for Omniscript.';
end;
