# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [installManager](#installmanager)

## installManager

**File**: `src/installManager.ts`

### Classes

#### OmniscriptInstaller

**Properties**:

- `TEMP_DIR: any` - 
- `REPO_URL: any` - 
- `RELEASE_URL: any` - 
- `FALLBACK_DOWNLOAD_URL: any` - 
- `ESSENTIAL_FILES: any` - 
- `CORE_FILES: any` - 

**Methods**:

##### downloadWithRetry

**Signature**: `static async downloadWithRetry(url: string, destPath: string, maxRetries: number = 3): Promise<void>`

##### downloadRepository

**Signature**: `static async downloadRepository(): Promise<string>`

##### extractFiles

**Signature**: `static async extractFiles(zipPath: string, targetDir: string): Promise<void>`

##### createMinimalInstall

**Signature**: `static async createMinimalInstall(installPath: string): Promise<void>`

##### verifyChecksums

**Signature**: `static async verifyChecksums(installPath: string): Promise<boolean>`

##### buildFromSource

**Signature**: `static async buildFromSource(installPath: string): Promise<void>`

##### ensureDependencies

**Signature**: `static async ensureDependencies(): Promise<void>`

##### extractTarGz

**Signature**: `private static async extractTarGz(source: string, dest: string): Promise<void>`

##### getNodeDownloadUrl

**Signature**: `private static getNodeDownloadUrl(): string`

##### getGitDownloadUrl

**Signature**: `private static getGitDownloadUrl(): string`

##### checkWritePermissions

**Signature**: `static async checkWritePermissions(path: string): Promise<boolean>`

##### getDefaultInstallPath

**Signature**: `static getDefaultInstallPath(options:`

##### cloneRepository

**Signature**: `private static async cloneRepository(installPath: string): Promise<void>`

##### install

**Signature**: `static async install(options:`

##### bundleCoreFiles

**Signature**: `private static async bundleCoreFiles(installPath: string): Promise<void>`

##### copyDir

**Signature**: `private static copyDir(src: string, dest: string): void`

##### setupEnvironment

**Signature**: `private static async setupEnvironment(installPath: string, userInstall?: boolean): Promise<void>`

##### createShortcuts

**Signature**: `private static async createShortcuts(installPath: string): Promise<void>`

##### verifyInstallation

**Signature**: `private static verifyInstallation(installPath: string): boolean`

##### isToolAvailable

**Signature**: `static isToolAvailable(tool: string): boolean`


