[Setup]
AppName=Omniscript
AppVersion=1.0.0
DefaultDirName={pf}\Omniscript
DefaultGroupName=Omniscript
OutputDir=Output
OutputBaseFilename=Setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin

[Files]
Source: "dist\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\Omniscript"; Filename: "{app}\omni.exe"
Name: "{commondesktop}\Omniscript"; Filename: "{app}\omni.exe"

[Registry]
; Add Omni install folder to PATH (system-wide)
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; \
    ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; Flags: preservestringtype uninsdeletevalue
