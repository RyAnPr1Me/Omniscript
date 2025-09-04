# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [url](#url)

## url

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/url.ts`

### Classes

#### UrlUtils

**Methods**:

##### parse

Parse URL string into components

**Signature**: `static parse(url: string): ParsedUrl`

##### build

Build URL from components

**Signature**: `static build(components: Partial<ParsedUrl>, options?: UrlBuilderOptions): string`

##### join

Join URL paths correctly

**Signature**: `static join(...paths: string[]): string`

##### joinPaths

Join just the path components

**Signature**: `private static joinPaths(...paths: string[]): string`

##### addParams

Add or update query parameters

**Signature**: `static addParams(url: string, params: Record<string, string | number | boolean>): string`

##### removeParams

Remove query parameters

**Signature**: `static removeParams(url: string, ...keys: string[]): string`

##### getParam

Get specific query parameter value

**Signature**: `static getParam(url: string, key: string): string | null`

##### getParams

Get all query parameters as object

**Signature**: `static getParams(url: string): Record<string, string>`

##### isAbsolute

Check if URL is absolute

**Signature**: `static isAbsolute(url: string): boolean`

##### isRelative

Check if URL is relative

**Signature**: `static isRelative(url: string): boolean`

##### toAbsolute

Convert relative URL to absolute

**Signature**: `static toAbsolute(relativeUrl: string, baseUrl: string): string`

##### normalize

Normalize URL (remove redundant parts, standardize format)

**Signature**: `static normalize(url: string): string`

##### getDomain

Extract domain from URL

**Signature**: `static getDomain(url: string): string`

##### getSubdomain

Extract subdomain from URL

**Signature**: `static getSubdomain(url: string): string`

##### getRootDomain

Extract root domain (without subdomain)

**Signature**: `static getRootDomain(url: string): string`

##### isSameDomain

Check if two URLs are from the same domain

**Signature**: `static isSameDomain(url1: string, url2: string): boolean`

##### encode

Encode URL component

**Signature**: `static encode(component: string): string`

##### decode

Decode URL component

**Signature**: `static decode(component: string): string`

##### isValid

Validate URL format

**Signature**: `static isValid(url: string): boolean`

##### getExtension

Extract file extension from URL path

**Signature**: `static getExtension(url: string): string`

##### getFilename

Extract filename from URL path

**Signature**: `static getFilename(url: string): string`

##### slug

Create URL-safe slug from string

**Signature**: `static slug(text: string): string`

##### parseQuery

Parse query string into object

**Signature**: `static parseQuery(queryString: string): Record<string, string | string[]>`

##### buildQuery

Build query string from object

**Signature**: `static buildQuery(params: Record<string, any>, options?: UrlBuilderOptions): string`

#### UrlBuilder

**Properties**:

- `components: Partial<ParsedUrl>` - 

**Methods**:

##### protocol

**Signature**: `protocol(protocol: string): this`

##### hostname

**Signature**: `hostname(hostname: string): this`

##### port

**Signature**: `port(port: number | string): this`

##### path

**Signature**: `path(pathname: string): this`

##### param

**Signature**: `param(key: string, value: string | number | boolean): this`

##### params

**Signature**: `params(params: Record<string, string | number | boolean>): this`

##### hash

**Signature**: `hash(hash: string): this`

##### build

**Signature**: `build(): string`

##### toString

**Signature**: `toString(): string`

### Interfaces

#### ParsedUrl

**Properties**:

- `protocol: string` - 
- `hostname: string` - 
- `port: string` - 
- `pathname: string` - 
- `search: string` - 
- `hash: string` - 
- `searchParams: Map<string, string>` - 

#### UrlBuilderOptions

**Properties**:

- `encode: boolean` - 
- `arrayFormat: 'brackets' | 'indices' | 'comma'` - 


