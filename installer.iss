; Omniscript Installer (Slim Version)

[Setup]
AppName=Omniscript
AppVersion=2.1.0
AppPublisher=RyAnPr1Me
AppPublisherURL=https://github.com/RyAnPr1Me/Omniscript
AppSupportURL=https://github.com/RyAnPr1Me/Omniscript/issues
AppUpdatesURL=https://github.com/RyAnPr1Me/Omniscript/releases
DefaultDirName={autopf}\Omniscript
DefaultGroupName=Omniscript
OutputDir=Output
OutputBaseFilename=OmniscriptSetup
SetupIconFile=compiler:SetupClassicIcon.ico
Compression=lzma2/ultra64
SolidCompression=yes
PrivilegesRequired=admin
ArchitecturesAllowed=x64 arm64
ArchitecturesInstallIn64BitMode=x64 arm64
ChangesEnvironment=yes
ChangesAssociations=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "dist\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "cli.js"; DestDir: "{app}"; Flags: ignoreversion
Source: "omniscript.cmd"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Omniscript"; Filename: "{app}\Omniscript.exe"

[Registry]
; --- .os file association ---
Root: HKCR; Subkey: ".os"; ValueType: string; ValueData: "OmniscriptFile"; Flags: uninsdeletevalue
Root: HKCR; Subkey: "OmniscriptFile"; ValueType: string; ValueData: "Omniscript Source File"; Flags: uninsdeletekey
Root: HKCR; Subkey: "OmniscriptFile\DefaultIcon"; ValueType: string; ValueData: "{app}\Omniscript.exe,0"
Root: HKCR; Subkey: "OmniscriptFile\Shell\Open\Command"; ValueType: string; ValueData: """{app}\Omniscript.exe"" ""%1"""

; --- Add Omniscript folder to PATH ---
Root: HKCU; Subkey: "Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; Check: NeedsAddPath; Flags: preservestringtype

[Run]
Filename: "{app}\Omniscript.exe"; Description: "Launch Omniscript"; Flags: nowait postinstall skipifsilent

[Code]
function NeedsAddPath(): Boolean;
var
  OrigPath: string;
begin
  if not RegQueryStringValue(HKCU, 'Environment', 'Path', OrigPath) then
    Result := True
  else
    Result := Pos(ExpandConstant('{app}'), OrigPath) = 0;
end;

function InitializeSetup(): Boolean;
var
  ErrorCode: Integer;
begin
  Result := True;

  { Check for Node.js }
  if not Exec('cmd.exe', '/c node --version', '', SW_HIDE, ewWaitUntilTerminated, ErrorCode) or (ErrorCode <> 0) then
  begin
    case MsgBox(
      'Node.js is required but not found.' + #13#10 +
      'YES: Download Node.js LTS automatically' + #13#10 +
      'NO: Continue anyway (may fail)' + #13#10 +
      'CANCEL: Exit setup',
      mbConfirmation, MB_YESNOCANCEL) of

      IDYES:
        ShellExec('open',
                  'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi',
                  '', '', SW_SHOWNORMAL);

      IDNO:
        MsgBox('Omniscript may not work without Node.js. Install later from https://nodejs.org/', mbInformation, MB_OK);

      IDCANCEL:
        Result := False;
    end;
  end
  else
    Log('Node.js detected.');
end;
