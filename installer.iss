; Omniscript Programming Language Installer
; Simple, focused installer for the Omniscript language
; Version: 2.1.0

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
OutputDir=Output
OutputBaseFilename=OmniscriptSetup-2.1.0
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
ArchitecturesAllowed=x64 arm64
ArchitecturesInstallIn64BitMode=x64 arm64
UninstallDisplayIcon={app}\bin\cli.js
UninstallDisplayName=Omniscript Programming Language
VersionInfoVersion=2.1.0
VersionInfoCompany=RyAnPr1Me
VersionInfoDescription=Modern programming language for full-stack development
VersionInfoCopyright=Copyright (C) 2024 RyAnPr1Me
VersionInfoProductName=Omniscript
VersionInfoProductVersion=2.1.0
WizardStyle=modern
ChangesEnvironment=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "german"; MessagesFile: "compiler:Languages\German.isl"
Name: "italian"; MessagesFile: "compiler:Languages\Italian.isl"
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "addtopath"; Description: "Add Omniscript to system PATH"; GroupDescription: "System Integration"; Flags: checked

[Files]
; Core application files
Source: "dist\*"; DestDir: "{app}\dist"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "bin\*"; DestDir: "{app}\bin"; Flags: ignoreversion
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "LICENSE"; DestDir: "{app}"; Flags: ignoreversion
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "CHANGELOG.md"; DestDir: "{app}"; Flags: ignoreversion

; Copy node_modules if they exist (for bundled distributions)
Source: "node_modules\*"; DestDir: "{app}\node_modules"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist

[Icons]
Name: "{group}\Omniscript CLI"; Filename: "cmd.exe"; Parameters: "/k cd /d ""{app}"" && echo Omniscript Programming Language v2.1.0 && echo Type 'omni --help' to get started"; WorkingDir: "{app}"
Name: "{autodesktop}\Omniscript CLI"; Filename: "cmd.exe"; Parameters: "/k cd /d ""{app}"" && echo Omniscript Programming Language v2.1.0 && echo Type 'omni --help' to get started"; WorkingDir: "{app}"; Tasks: desktopicon

[Registry]
; Add to PATH if requested
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}\bin"; Tasks: addtopath; Check: NeedsAddPath('{app}\bin')

[Run]
; Display completion message and basic instructions
Filename: "{cmd}"; Parameters: "/c echo Installation completed successfully! && echo. && echo To use Omniscript, open a new command prompt and type: omni --help && pause"; Description: "Show installation instructions"; Flags: nowait postinstall skipifsilent

[Code]
function NeedsAddPath(Param: String): Boolean;
var
  OrigPath: String;
begin
  if not RegQueryStringValue(HKEY_LOCAL_MACHINE,
    'SYSTEM\CurrentControlSet\Control\Session Manager\Environment',
    'Path', OrigPath)
  then begin
    Result := True;
    exit;
  end;
  { look for the path with leading and trailing semicolon }
  { Pos() returns 0 if not found }
  Result := Pos(';' + Param + ';', ';' + OrigPath + ';') = 0;
end;

function InitializeSetup(): Boolean;
begin
  Result := True;
  
  { Simple Node.js check without problematic ShellExec }
  if MsgBox('Omniscript requires Node.js 16+ to run.' + #13#10 + #13#10 +
            'If you don''t have Node.js installed, please download it from:' + #13#10 +
            'https://nodejs.org/' + #13#10 + #13#10 +
            'Continue with installation?', mbConfirmation, MB_YESNO) = IDNO then
  begin
    Result := False;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    { Create a simple batch file for easier access }
    SaveStringToFile(ExpandConstant('{app}\omni.bat'), 
      '@echo off' + #13#10 +
      'node "%~dp0bin\cli.js" %*' + #13#10, False);
  end;
end;
