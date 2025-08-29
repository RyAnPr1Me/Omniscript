[Setup]
AppId={B8C313D5-2D75-4555-A999-5ECBBDF90A09}
AppName=Omniscript
AppVersion=0.1.0
DefaultDirName={autopf}\Omniscript
DefaultGroupName=Omniscript
OutputDir=Output
Compression=lzma2/ultra64
SolidCompression=yes
PrivilegesRequired=admin
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
WizardStyle=modern

[Files]
Source: "dist\cli.js"; DestDir: "{app}\bin"; Flags: ignoreversion
Source: "dist\*"; DestDir: "{app}\lib"; Excludes: "bin,cli.js"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\Omniscript CLI"; Filename: "node"; Parameters: """{app}\bin\cli.js"""; WorkingDir: "{app}"; Comment: "Omniscript CLI"
Name: "{autodesktop}\Omniscript"; Filename: "node"; Parameters: """{app}\bin\cli.js"""; WorkingDir: "{app}"; Comment: "Omniscript CLI"; Tasks: desktopicon

[Run]
Filename: "{cmd}"; Parameters: "/c echo @echo off > ""{app}\omni.bat"""; Flags: runhidden waituntilterminated
Filename: "{cmd}"; Parameters: "/c echo node ""{app}\bin\cli.js"" %%* >> ""{app}\omni.bat"""; Flags: runhidden waituntilterminated
Filename: "node"; Parameters: """{app}\bin\cli.js"" --version"; Description: "Verify Omniscript installation"; Flags: postinstall skipifsilent runhidden

[Registry]
; Add Omni install folder to PATH
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; \
    ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; Flags: preservestringtype uninsdeletevalue; Check: IsAdminInstallMode
Root: HKCU; Subkey: "Environment"; \
    ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; Flags: preservestringtype uninsdeletevalue; Check: not IsAdminInstallMode

; File association for .os files
Root: HKCR; Subkey: ".os"; ValueType: string; ValueName: ""; ValueData: "OmniscriptFile"; Flags: uninsdeletekey
Root: HKCR; Subkey: "OmniscriptFile"; ValueType: string; ValueName: ""; ValueData: "Omniscript File"; Flags: uninsdeletekey
Root: HKCR; Subkey: "OmniscriptFile\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\bin\cli.js"" ""%1"""; Flags: uninsdeletekey

[UninstallDelete]
Type: filesandordirs; Name: "{app}"
