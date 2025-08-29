[Setup]
AppName=Omniscript
AppVersion=1.0.0
DefaultDirName={pf}\Omniscript
DefaultGroupName=Omniscript
OutputDir=Output
OutputBaseFilename=Setup
Compression=lzma
SolidCompression=yes

[Files]
Source: "dist\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\Omniscript"; Filename: "{app}\omni.exe"
Name: "{commondesktop}\Omniscript"; Filename: "{app}\omni.exe"
