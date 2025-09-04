# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [graphics](#graphics)

## graphics

**File**: `src/stdlib/graphics.ts`

### Classes

#### Canvas2D

**Implements**: `GraphicsContext`

**Properties**:

- `canvas: HTMLCanvasElement` - 
- `ctx: CanvasRenderingContext2D` - 
- `imageData: ImageData` - 
- `pixelData: Uint8ClampedArray` - 

**Methods**:

##### getCanvas

**Signature**: `getCanvas(): HTMLCanvasElement`

##### clear

**Signature**: `clear(color: Color =`

##### drawPixel

**Signature**: `drawPixel(x: number, y: number, color: Color): void`

##### drawLine

**Signature**: `drawLine(start: Point2D, end: Point2D, color: Color, thickness: number = 1): void`

##### drawRect

**Signature**: `drawRect(rect: Rect, color: Color, filled: boolean = false): void`

##### drawCircle

**Signature**: `drawCircle(circle: Circle, color: Color, filled: boolean = false): void`

##### drawText

**Signature**: `drawText(text: string, position: Point2D, color: Color, font: string = '16px Arial'): void`

##### drawImage

**Signature**: `drawImage(imageData: ImageData, position: Point2D, size?:`

##### flush

**Signature**: `flush(): void`

##### colorToString

**Signature**: `private colorToString(color: Color): string`

##### drawPolygon

**Signature**: `drawPolygon(points: Point2D[], color: Color, filled: boolean = false): void`

##### drawBezierCurve

**Signature**: `drawBezierCurve(start: Point2D, control1: Point2D, control2: Point2D, end: Point2D, color: Color): void`

##### drawGradient

**Signature**: `drawGradient(rect: Rect, colorStart: Color, colorEnd: Color, direction: 'horizontal' | 'vertical' = 'horizontal'): void`

#### SoftwareRenderer

**Implements**: `GraphicsContext`

**Properties**:

- `buffer: Uint8ClampedArray` - 

**Methods**:

##### getImageData

**Signature**: `getImageData(): ImageData`

##### getBuffer

**Signature**: `getBuffer(): Uint8ClampedArray`

##### clear

**Signature**: `clear(color: Color =`

##### drawPixel

**Signature**: `drawPixel(x: number, y: number, color: Color): void`

##### drawLine

**Signature**: `drawLine(start: Point2D, end: Point2D, color: Color, thickness: number = 1): void`

##### drawRect

**Signature**: `drawRect(rect: Rect, color: Color, filled: boolean = false): void`

##### drawCircle

**Signature**: `drawCircle(circle: Circle, color: Color, filled: boolean = false): void`

##### drawText

**Signature**: `drawText(text: string, position: Point2D, color: Color, font?: string): void`

##### drawImage

**Signature**: `drawImage(imageData: ImageData, position: Point2D, size?:`

#### Vector3

**Methods**:

##### add

**Signature**: `static add(a: Vector3, b: Vector3): Vector3`

##### subtract

**Signature**: `static subtract(a: Vector3, b: Vector3): Vector3`

##### scale

**Signature**: `static scale(v: Vector3, scalar: number): Vector3`

##### dot

**Signature**: `static dot(a: Vector3, b: Vector3): number`

##### cross

**Signature**: `static cross(a: Vector3, b: Vector3): Vector3`

##### magnitude

**Signature**: `static magnitude(v: Vector3): number`

##### normalize

**Signature**: `static normalize(v: Vector3): Vector3`

#### Matrix4

**Methods**:

##### identity

**Signature**: `static identity(): Matrix4`

##### translation

**Signature**: `static translation(x: number, y: number, z: number): Matrix4`

##### rotation

**Signature**: `static rotation(angleX: number, angleY: number, angleZ: number): Matrix4`

##### scale

**Signature**: `static scale(x: number, y: number, z: number): Matrix4`

##### perspective

**Signature**: `static perspective(fov: number, aspect: number, near: number, far: number): Matrix4`

##### multiply

**Signature**: `multiply(other: Matrix4): Matrix4`

##### transformPoint

**Signature**: `transformPoint(point: Vector3): Vector3`

#### ChartRenderer

**Methods**:

##### drawLineChart

**Signature**: `drawLineChart(data: ChartData, rect: Rect): void`

##### drawBarChart

**Signature**: `drawBarChart(data: ChartData, rect: Rect): void`

##### drawPieChart

**Signature**: `drawPieChart(data: ChartData, rect: Rect): void`

##### drawTriangle

**Signature**: `private drawTriangle(points: Point2D[], color: Color): void`

##### addEdgeIntersection

**Signature**: `private addEdgeIntersection(p1: Point2D, p2: Point2D, y: number, intersections: number[]): void`

##### generateColor

**Signature**: `private generateColor(index: number): Color`

#### Graphics

**Properties**:

- `Colors: any` - 

**Methods**:

##### createCanvas2D

**Signature**: `static createCanvas2D(width: number, height: number): Canvas2D`

##### createSoftwareRenderer

**Signature**: `static createSoftwareRenderer(width: number, height: number): SoftwareRenderer`

##### createChartRenderer

**Signature**: `static createChartRenderer(context: GraphicsContext): ChartRenderer`

##### rgb

**Signature**: `static rgb(r: number, g: number, b: number): Color`

##### rgba

**Signature**: `static rgba(r: number, g: number, b: number, a: number): Color`

##### hsl

**Signature**: `static hsl(h: number, s: number, l: number): Color`

##### hexToColor

**Signature**: `static hexToColor(hex: string): Color`

##### colorToHex

**Signature**: `static colorToHex(color: Color): string`

### Interfaces

#### Point2D

**Properties**:

- `x: number` - 
- `y: number` - 

#### Point3D

**Properties**:

- `x: number` - 
- `y: number` - 
- `z: number` - 

#### Vector2D

**Extends**: `Point2D`

#### Vector3D

**Extends**: `Point3D`

#### Color

**Properties**:

- `r: number` - 
- `g: number` - 
- `b: number` - 
- `a: number` - 

#### Rect

**Properties**:

- `x: number` - 
- `y: number` - 
- `width: number` - 
- `height: number` - 

#### Circle

**Properties**:

- `center: Point2D` - 
- `radius: number` - 

#### Line

**Properties**:

- `start: Point2D` - 
- `end: Point2D` - 

#### Transform2D

**Properties**:

- `translate: Vector2D` - 
- `scale: Vector2D` - 
- `rotation: number` - 

#### Transform3D

**Properties**:

- `translate: Vector3D` - 
- `scale: Vector3D` - 
- `rotation: Vector3D` - 

#### GraphicsContext

**Properties**:

- `width: number` - 
- `height: number` - 

**Methods**:

##### clear

**Signature**: `clear(color?: Color): void;`

##### drawPixel

**Signature**: `drawPixel(x: number, y: number, color: Color): void;`

##### drawLine

**Signature**: `drawLine(start: Point2D, end: Point2D, color: Color, thickness?: number): void;`

##### drawRect

**Signature**: `drawRect(rect: Rect, color: Color, filled?: boolean): void;`

##### drawCircle

**Signature**: `drawCircle(circle: Circle, color: Color, filled?: boolean): void;`

##### drawText

**Signature**: `drawText(text: string, position: Point2D, color: Color, font?: string): void;`

##### drawImage

**Signature**: `drawImage(imageData: ImageData, position: Point2D, size?: { width: number; height: number }): void;`

#### ChartData

**Properties**:

- `labels: string[]` - 
- `datasets: {
    label: string;
    data: number[];
    color: Color;
    fillColor?: Color;
  }[]` - 


