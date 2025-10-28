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
Source: "dist\*"; DestDir: "{app}\dist"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "bin\cli.js"; DestDir: "{app}\bin"; Flags: ignoreversion
Source: "omni.bat"; DestDir: "{app}"; Flags: ignoreversion
; Copy production node_modules only (install with npm ci --omit=dev before packaging)
Source: "node_modules\*"; DestDir: "{app}\node_modules"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "@types\*,eslint*,prettier*,jest*,ts-jest*,ts-node*,typescript-eslint*,pkg*,@eslint*,@jest*,@types*"

[Icons]
Name: "{group}\Omniscript"; Filename: "{app}\omni.bat"; WorkingDir: "{app}"; IconFilename: "{sys}\shell32.dll"; IconIndex: 2
Name: "{group}\Uninstall Omniscript"; Filename: "{uninstallexe}"

[Registry]
; --- .os file association ---
Root: HKCR; Subkey: ".os"; ValueType: string; ValueData: "OmniscriptFile"; Flags: uninsdeletevalue
Root: HKCR; Subkey: "OmniscriptFile"; ValueType: string; ValueData: "Omniscript Source File"; Flags: uninsdeletekey
Root: HKCR; Subkey: "OmniscriptFile\DefaultIcon"; ValueType: string; ValueData: "{sys}\shell32.dll,2"
Root: HKCR; Subkey: "OmniscriptFile\Shell\Open\Command"; ValueType: string; ValueData: """{app}\omni.bat"" ""%1"""

; --- Add Omniscript root folder to PATH (contains omni.bat) ---
Root: HKCU; Subkey: "Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; Check: NeedsAddPath; Flags: preservestringtype

[Run]
Filename: "{app}\omni.bat"; Parameters: "repl"; Description: "Launch Omniscript REPL"; Flags: nowait postinstall skipifsilent

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

function InitializeUninstall(): Boolean;
begin
  Result := True;
  Log('Validating bundled dependencies');
  { Check if node_modules directory exists }
  if DirExists(ExpandConstant('{app}\node_modules')) then
    Log('Dependencies found in: dir {app}\node_modules')
  else
    Log('Warning: node_modules directory not found');
end;
