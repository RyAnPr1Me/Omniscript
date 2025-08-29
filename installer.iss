[Setup]
AppId={{B8C313D5-2D75-4555-A999-5ECBBDF90A09}
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
UninstallDisplayIcon={app}\bin\omniscript-installer-win.exe
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
Name: "addtopath"; Description: "Add Omniscript to system PATH"; GroupDescription: "Environment:"; Flags: unchecked

[Files]
Source: "dist\cli.js"; DestDir: "{app}"; Flags: ignoreversion
Source: "dist\bin\omniscript-installer-win.exe"; DestDir: "{app}\bin"; Flags: ignoreversion
Source: "dist\*"; DestDir: "{app}\lib"; Excludes: "bin,cli.js"; Flags: ignoreversion recursesubdirs
Source: "src\*"; DestDir: "{app}\src"; Flags: ignoreversion recursesubdirs
Source: "LICENSE"; DestDir: "{app}"; Flags: ignoreversion
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "tsconfig.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "omni.json"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Omniscript CLI"; Filename: "node"; Parameters: """{app}\cli.js"""; WorkingDir: "{app}"; Comment: "Omniscript Programming Language CLI"
Name: "{group}\Omniscript Documentation"; Filename: "{app}\README.md"; Comment: "Open Omniscript documentation"
Name: "{group}\{cm:UninstallProgram,Omniscript}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\Omniscript"; Filename: "node"; Parameters: """{app}\cli.js"""; WorkingDir: "{app}"; Comment: "Omniscript Programming Language CLI"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Omniscript"; Filename: "node"; Parameters: """{app}\cli.js"""; WorkingDir: "{app}"; Comment: "Omniscript Programming Language CLI"; Tasks: quicklaunchicon

[Run]
Filename: "{cmd}"; Parameters: "/c echo @echo off > ""{app}\omni.bat"""; Flags: runhidden waituntilterminated; StatusMsg: "Creating omni command..."
Filename: "{cmd}"; Parameters: "/c echo node ""{app}\cli.js"" %%* >> ""{app}\omni.bat"""; Flags: runhidden waituntilterminated
Filename: "node"; Parameters: """{app}\cli.js"" --version"; Description: "Verify Omniscript installation"; \
    Flags: postinstall skipifsilent runhidden; StatusMsg: "Verifying installation..."

[Registry]
; Add Omni install folder to PATH (system-wide or user-level based on privileges)
Root: HKA; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; \
    ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; \
    Flags: preservestringtype uninsdeletevalue; Tasks: addtopath; Check: IsAdminInstallMode
Root: HKCU; Subkey: "Environment"; \
    ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; \
    Flags: preservestringtype uninsdeletevalue; Tasks: addtopath; Check: not IsAdminInstallMode

[UninstallDelete]
Type: filesandordirs; Name: "{app}"
