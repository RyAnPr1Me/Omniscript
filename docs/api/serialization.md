# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [serialization](#serialization)

## serialization

**File**: `/home/runner/work/Omniscript/Omniscript/src/stdlib/serialization.ts`

### Classes

#### BaseSerializer

**Methods**:

##### serialize

**Signature**: `abstract serialize(data: any, options?: SerializationOptions): SerializationResult;`

##### deserialize

**Signature**: `abstract deserialize<T = any>(serialized: string | Uint8Array, options?: SerializationOptions): DeserializationResult<T>;`

##### getContentType

**Signature**: `abstract getContentType(): string;`

##### getFileExtension

**Signature**: `abstract getFileExtension(): string;`

#### JsonSerializer

**Extends**: `BaseSerializer`

**Properties**:

- `CONTENT_TYPE: any` - 
- `EXTENSION: any` - 

**Methods**:

##### serialize

**Signature**: `serialize(data: any, options?: SerializationOptions): SerializationResult`

##### deserialize

**Signature**: `deserialize<T = any>(serialized: string | Uint8Array, options?: SerializationOptions): DeserializationResult<T>`

##### getContentType

**Signature**: `getContentType(): string`

##### getFileExtension

**Signature**: `getFileExtension(): string`

##### createReplacer

**Signature**: `private createReplacer(): (key: string, value: any) => any`

##### createReviver

**Signature**: `private createReviver(): (key: string, value: any) => any`

#### XmlSerializer

**Extends**: `BaseSerializer`

**Properties**:

- `CONTENT_TYPE: any` - 
- `EXTENSION: any` - 

**Methods**:

##### serialize

**Signature**: `serialize(data: any, options?: SerializationOptions): SerializationResult`

##### deserialize

**Signature**: `deserialize<T = any>(serialized: string | Uint8Array, options?: SerializationOptions): DeserializationResult<T>`

##### getContentType

**Signature**: `getContentType(): string`

##### getFileExtension

**Signature**: `getFileExtension(): string`

##### objectToXml

**Signature**: `private objectToXml(obj: any, options:`

##### xmlToObject

**Signature**: `private xmlToObject(xmlString: string): any`

##### parseXmlContent

**Signature**: `private parseXmlContent(content: string): any`

##### parseXmlArray

**Signature**: `private parseXmlArray(content: string): any[]`

##### extractElements

**Signature**: `private extractElements(content: string): string[]`

##### sanitizeXmlTag

**Signature**: `private sanitizeXmlTag(tag: string): string`

##### escapeXml

**Signature**: `private escapeXml(text: string): string`

##### unescapeXml

**Signature**: `private unescapeXml(text: string): string`

#### YamlSerializer

**Extends**: `BaseSerializer`

**Properties**:

- `CONTENT_TYPE: any` - 
- `EXTENSION: any` - 

**Methods**:

##### serialize

**Signature**: `serialize(data: any, options?: SerializationOptions): SerializationResult`

##### deserialize

**Signature**: `deserialize<T = any>(serialized: string | Uint8Array, options?: SerializationOptions): DeserializationResult<T>`

##### getContentType

**Signature**: `getContentType(): string`

##### getFileExtension

**Signature**: `getFileExtension(): string`

##### objectToYaml

**Signature**: `private objectToYaml(obj: any, depth: number): string`

##### yamlToObject

**Signature**: `private yamlToObject(yamlString: string): any`

##### parseYamlLines

**Signature**: `private parseYamlLines(lines: string[], startIndex: number):`

##### parseYamlValue

**Signature**: `private parseYamlValue(value: string): any`

#### BinarySerializer

**Extends**: `BaseSerializer`

**Properties**:

- `CONTENT_TYPE: any` - 
- `EXTENSION: any` - 

**Methods**:

##### serialize

**Signature**: `serialize(data: any, options?: SerializationOptions): SerializationResult`

##### deserialize

**Signature**: `deserialize<T = any>(serialized: string | Uint8Array, options?: SerializationOptions): DeserializationResult<T>`

##### getContentType

**Signature**: `getContentType(): string`

##### getFileExtension

**Signature**: `getFileExtension(): string`

##### serializeToBinary

**Signature**: `private serializeToBinary(data: any): Uint8Array`

##### writeValue

**Signature**: `private writeValue(value: any, chunks: number[]): void`

##### writeLength

**Signature**: `private writeLength(length: number, chunks: number[]): void`

##### deserializeFromBinary

**Signature**: `private deserializeFromBinary(buffer: Uint8Array): any`

##### readValue

**Signature**: `private readValue(buffer: Uint8Array, context:`

##### readLength

**Signature**: `private readLength(buffer: Uint8Array, context:`

#### Serialization

**Properties**:

- `serializers: any` - 

**Methods**:

##### serialize

**Signature**: `static serialize(data: any, format: string = 'json', options?: SerializationOptions): SerializationResult`

##### deserialize

**Signature**: `static deserialize<T = any>(
    serialized: string | Uint8Array, 
    format: string = 'json', 
    options?: SerializationOptions
  ): DeserializationResult<T>`

##### registerSerializer

**Signature**: `static registerSerializer(format: string, serializer: BaseSerializer): void`

##### getAvailableFormats

**Signature**: `static getAvailableFormats(): string[]`

##### getContentType

**Signature**: `static getContentType(format: string): string`

##### getFileExtension

**Signature**: `static getFileExtension(format: string): string`

##### clone

**Signature**: `static clone<T>(obj: T, format: string = 'json'): T`

##### compare

**Signature**: `static compare(obj1: any, obj2: any, format: string = 'json'): boolean`

##### compress

**Signature**: `static compress(data: string | Uint8Array, algorithm: 'gzip' | 'deflate' = 'gzip'): Uint8Array`

##### decompress

**Signature**: `static decompress(data: Uint8Array, algorithm: 'gzip' | 'deflate' = 'gzip'): Uint8Array`

### Interfaces

#### SerializationOptions

**Properties**:

- `format: 'json' | 'xml' | 'yaml' | 'msgpack' | 'protobuf'` - 
- `pretty: boolean` - 
- `strict: boolean` - 
- `schema: any` - 
- `encoding: 'utf8' | 'base64' | 'hex'` - 

#### SerializationResult

**Properties**:

- `data: string | Uint8Array` - 
- `format: string` - 
- `size: number` - 
- `metadata: Record<string, any>` - 

#### DeserializationResult

**Properties**:

- `data: T` - 
- `format: string` - 
- `isValid: boolean` - 
- `errors: string[]` - 


