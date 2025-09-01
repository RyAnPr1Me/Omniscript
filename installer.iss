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

[Code]
function InitializeSetup(): Boolean;
var
  ErrorCode: Integer;
  NodeVersion: String;
begin
  Result := True;
  
  // Check if Node.js is installed
  if not Exec('cmd.exe', '/c node --version', '', SW_HIDE, ewWaitUntilTerminated, ErrorCode) or (ErrorCode <> 0) then
  begin
    if MsgBox('Node.js is required but not found on your system.' + #13#10 + 
              'Would you like to download and install Node.js now?' + #13#10 + #13#10 +
              'You can download it from: https://nodejs.org/', 
              mbConfirmation, MB_YESNO) = IDYES then
    begin
      ShellExec('open', 'https://nodejs.org/', '', '', SW_SHOWNORMAL, ewNoWait, ErrorCode);
    end;
    Result := False;
    Exit;
  end;
  
  // Check npm availability
  if not Exec('cmd.exe', '/c npm --version', '', SW_HIDE, ewWaitUntilTerminated, ErrorCode) or (ErrorCode <> 0) then
  begin
    MsgBox('npm is required but not found on your system.' + #13#10 + 
           'Please ensure Node.js is properly installed and try again.', 
           mbError, MB_OK);
    Result := False;
    Exit;
  end;
end;

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1
Name: "addtopath"; Description: "Add Omniscript to system PATH"; GroupDescription: "Environment"

[Files]
Source: "bin\cli.js"; DestDir: "{app}\bin"; Flags: ignoreversion
Source: "dist\*"; DestDir: "{app}\lib"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "LICENSE"; DestDir: "{app}"; Flags: ignoreversion
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "package-lock.json"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "tsconfig.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "omni.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: ".npmrc"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist

[Icons]
Name: "{group}\Omniscript CLI"; Filename: "node"; Parameters: """{app}\bin\cli.js"""; WorkingDir: "{app}"; Comment: "Omniscript CLI"
Name: "{group}\Omniscript Documentation"; Filename: "{app}\README.md"; Comment: "Open Omniscript documentation"
Name: "{group}\{cm:UninstallProgram,Omniscript}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\Omniscript"; Filename: "node"; Parameters: """{app}\bin\cli.js"""; WorkingDir: "{app}"; Comment: "Omniscript CLI"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Omniscript"; Filename: "node"; Parameters: """{app}\bin\cli.js"""; WorkingDir: "{app}"; Comment: "Omniscript CLI"; Tasks: quicklaunchicon

[Run]
; Check if Node.js is available
Filename: "{cmd}"; Parameters: "/c node --version > nul 2>&1 || (echo Node.js is required but not found in PATH. && echo Please install Node.js from https://nodejs.org/ && pause && exit /b 1)"; Flags: runhidden waituntilterminated; StatusMsg: "Checking Node.js installation..."

; Check if npm is available  
Filename: "{cmd}"; Parameters: "/c npm --version > nul 2>&1 || (echo npm is required but not found in PATH. && echo Please install Node.js from https://nodejs.org/ && pause && exit /b 1)"; Flags: runhidden waituntilterminated; StatusMsg: "Checking npm installation..."

; Install dependencies with better error handling
Filename: "{cmd}"; Parameters: "/c npm install --omit=dev --silent || (echo Failed to install dependencies. && echo Please check your internet connection and try again. && pause && exit /b 1)"; WorkingDir: "{app}"; Flags: runhidden waituntilterminated; StatusMsg: "Installing dependencies..."

; Copy batch file to system directory with error handling
Filename: "{cmd}"; Parameters: "/c copy ""{app}\omni.bat"" ""{sys}\omni.bat"" > nul || (echo Warning: Could not install omni command globally. && echo You may need administrator privileges.)"; Flags: runhidden waituntilterminated; StatusMsg: "Installing omni command globally..."

; Verify installation
Filename: "{cmd}"; Parameters: "/c ""{app}\omni.bat"" --version > nul && echo Installation verified successfully || (echo Warning: Installation verification failed. && echo Please check that Node.js is properly installed.)"; WorkingDir: "{app}"; Description: "Verify Omniscript installation"; Flags: postinstall skipifsilent; StatusMsg: "Verifying installation..."

[Registry]
; Add Omni install folder to PATH for global access to omni command
Root: HKLM; Subkey: "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; Flags: preservestringtype uninsdeletevalue; Tasks: addtopath; Check: IsAdminInstallMode
Root: HKCU; Subkey: "Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; Flags: preservestringtype uninsdeletevalue; Tasks: addtopath; Check: not IsAdminInstallMode

; File association for .os files
Root: HKCU; Subkey: "Software\Classes\.os"; ValueType: string; ValueName: ""; ValueData: "OmniscriptFile"; Flags: uninsdeletevalue
Root: HKCU; Subkey: "Software\Classes\OmniscriptFile\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """node"" ""{app}\bin\cli.js"" ""%1"" %*"; Flags: uninsdeletevalue

; File association for .omni files  
Root: HKCU; Subkey: "Software\Classes\.omni"; ValueType: string; ValueName: ""; ValueData: "OmniscriptFile"; Flags: uninsdeletevalue

[UninstallDelete]
Type: filesandordirs; Name: "{app}"
Type: files; Name: "{sys}\omni.bat"

