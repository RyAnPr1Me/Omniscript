[Setup]
AppId={{B8C313D5-2D75-4555-A999-5ECBBDF90A09}}
AppName=Omniscript
AppVersion=0.1.0
AppVerName=Omniscript 0.1.0
AppPublisher=RyAnPr1Me
AppPublisherURL=https://github.com/RyAnPr1Me/Omniscript
AppSupportURL=https://github.com/RyAnPr1Me/Omniscript/issues
AppUpdatesURL=https://github.com/RyAnPr1Me/Omniscript/releases
AppCopyright=Copyright (C) 2024 RyAnPr1Me
DefaultDirName={autopf}\Omniscript
DefaultGroupName=Omniscript
LicenseFile=LICENSE
InfoBeforeFile=README.md
OutputDir=Output
OutputBaseFilename=OmniscriptSetup-{#SetupSetting("AppVersion")}
Compression=lzma2/ultra64
SolidCompression=yes
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=dialog
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
DisableProgramGroupPage=no
UsePreviousAppDir=yes
UsePreviousGroup=yes
UninstallDisplayIcon={app}\bin\cli.js
UninstallDisplayName=Omniscript Programming Language
VersionInfoVersion=0.1.0
VersionInfoCompany=RyAnPr1Me
VersionInfoDescription=Modern programming language for full-stack development
VersionInfoCopyright=Copyright (C) 2024 RyAnPr1Me
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1
Name: "addtopath"; Description: "Add Omniscript to system PATH"; GroupDescription: "Environment"

[Files]
Source: "dist\cli.js"; DestDir: "{app}\bin"; Flags: ignoreversion
Source: "dist\*"; DestDir: "{app}\lib"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "LICENSE"; DestDir: "{app}"; Flags: ignoreversion
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "tsconfig.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "omni.json"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Omniscript CLI"; Filename: "node"; Parameters: """{app}\bin\cli.js"""; WorkingDir: "{app}"; Comment: "Omniscript CLI"
Name: "{group}\Omniscript Documentation"; Filename: "{app}\README.md"; Comment: "Open Omniscript documentation"
Name: "{group}\{cm:UninstallProgram,Omniscript}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\Omniscript"; Filename: "node"; Parameters: """{app}\bin\cli.js"""; WorkingDir: "{app}"; Comment: "Omniscript CLI"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Omniscript"; Filename: "node"; Parameters: """{app}\bin\cli.js"""; WorkingDir: "{app}"; Comment: "Omniscript CLI"; Tasks: quicklaunchicon

[Run]
Filename: "{cmd}"; Parameters: "/c echo @echo off > ""{app}\omni.bat"""; Flags: runhidden waituntilterminated; StatusMsg: "Creating omni command..."
Filename: "{cmd}"; Parameters: "/c echo node ""{app}\bin\cli.js"" %%* >> ""{app}\omni.bat"""; Flags: runhidden waituntilterminated
Filename: "{cmd}"; Parameters: "/c copy ""{app}\omni.bat"" ""{sys}\omni.bat"""; Flags: runhidden waituntilterminated; StatusMsg: "Installing omni command globally..."
Filename: "node"; Parameters: """{app}\bin\cli.js"" --version"; Description: "Verify Omniscript installation"; Flags: postinstall skipifsilent runhidden; StatusMsg: "Verifying installation..."

[Registry]
; Add Omni install folder to PATH
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; Flags: preservestringtype uninsdeletevalue; Tasks: addtopath; Check: IsAdminInstallMode
Root: HKCU; Subkey: "Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; Flags: preservestringtype uninsdeletevalue; Tasks: addtopath; Check: not IsAdminInstallMode

; File association for .os files
Root: HKCU; Subkey: "Software\Classes\.os"; ValueType: string; ValueName: ""; ValueData: "OmniscriptFile"; Flags: uninsdeletevalue
Root: HKCU; Subkey: "Software\Classes\OmniscriptFile\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """node"" ""{app}\bin\cli.js"" ""%1"" %*"; Flags: uninsdeletevalue

[UninstallDelete]
Type: filesandordirs; Name: "{app}"

