/**
 * Advanced Graphics and Visualization library for Omniscript
 * Provides 2D/3D graphics, charts, and visualization primitives
 */

import { MathUtils } from './math';
import { logger } from './logging';

// Basic geometric types
export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

// Vector types are aliases for points
export type Vector2D = Point2D;
export type Vector3D = Point3D;

export interface Color {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a?: number; // 0-1 (alpha)
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  center: Point2D;
  radius: number;
}

export interface Line {
  start: Point2D;
  end: Point2D;
}

export interface Transform2D {
  translate: Vector2D;
  scale: Vector2D;
  rotation: number; // radians
}

export interface Transform3D {
  translate: Vector3D;
  scale: Vector3D;
  rotation: Vector3D; // euler angles in radians
}

// Drawing context interface
export interface GraphicsContext {
  width: number;
  height: number;
  clear(color?: Color): void;
  drawPixel(x: number, y: number, color: Color): void;
  drawLine(start: Point2D, end: Point2D, color: Color, thickness?: number): void;
  drawRect(rect: Rect, color: Color, filled?: boolean): void;
  drawCircle(circle: Circle, color: Color, filled?: boolean): void;
  drawText(text: string, position: Point2D, color: Color, font?: string): void;
  drawImage(imageData: ImageData, position: Point2D, size?: { width: number; height: number }): void;
}

// Canvas-based graphics context
export class Canvas2D implements GraphicsContext {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageData: ImageData;
  private pixelData: Uint8ClampedArray;

  constructor(public width: number, public height: number) {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D rendering context');
    }
    this.ctx = context;
    
    this.imageData = this.ctx.createImageData(width, height);
    this.pixelData = this.imageData.data;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  clear(color: Color = { r: 0, g: 0, b: 0, a: 1 }): void {
    this.ctx.fillStyle = this.colorToString(color);
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawPixel(x: number, y: number, color: Color): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    
    const index = (y * this.width + x) * 4;
    this.pixelData[index] = color.r;
    this.pixelData[index + 1] = color.g;
    this.pixelData[index + 2] = color.b;
    this.pixelData[index + 3] = (color.a ?? 1) * 255;
  }

  drawLine(start: Point2D, end: Point2D, color: Color, thickness: number = 1): void {
    this.ctx.strokeStyle = this.colorToString(color);
    this.ctx.lineWidth = thickness;
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();
  }

  drawRect(rect: Rect, color: Color, filled: boolean = false): void {
    this.ctx.strokeStyle = this.colorToString(color);
    this.ctx.fillStyle = this.colorToString(color);
    
    if (filled) {
      this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    } else {
      this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
  }

  drawCircle(circle: Circle, color: Color, filled: boolean = false): void {
    this.ctx.strokeStyle = this.colorToString(color);
    this.ctx.fillStyle = this.colorToString(color);
    this.ctx.beginPath();
    this.ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, 2 * Math.PI);
    
    if (filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawText(text: string, position: Point2D, color: Color, font: string = '16px Arial'): void {
    this.ctx.fillStyle = this.colorToString(color);
    this.ctx.font = font;
    this.ctx.fillText(text, position.x, position.y);
  }

  drawImage(imageData: ImageData, position: Point2D, size?: { width: number; height: number }): void {
    if (size) {
      this.ctx.putImageData(imageData, position.x, position.y, 0, 0, size.width, size.height);
    } else {
      this.ctx.putImageData(imageData, position.x, position.y);
    }
  }

  flush(): void {
    this.ctx.putImageData(this.imageData, 0, 0);
  }

  private colorToString(color: Color): string {
    const alpha = color.a ?? 1;
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
  }

  // Advanced drawing methods
  drawPolygon(points: Point2D[], color: Color, filled: boolean = false): void {
    if (points.length < 3) return;
    
    this.ctx.strokeStyle = this.colorToString(color);
    this.ctx.fillStyle = this.colorToString(color);
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    
    this.ctx.closePath();
    
    if (filled) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawBezierCurve(start: Point2D, control1: Point2D, control2: Point2D, end: Point2D, color: Color): void {
    this.ctx.strokeStyle = this.colorToString(color);
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, end.x, end.y);
    this.ctx.stroke();
  }

  drawGradient(rect: Rect, colorStart: Color, colorEnd: Color, direction: 'horizontal' | 'vertical' = 'horizontal'): void {
    const gradient = direction === 'horizontal'
      ? this.ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y)
      : this.ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.height);
    
    gradient.addColorStop(0, this.colorToString(colorStart));
    gradient.addColorStop(1, this.colorToString(colorEnd));
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }
}

// Software renderer for environments without canvas
export class SoftwareRenderer implements GraphicsContext {
  private buffer: Uint8ClampedArray;
  
  constructor(public width: number, public height: number) {
    this.buffer = new Uint8ClampedArray(width * height * 4);
  }

  getImageData(): ImageData {
    return new ImageData(this.buffer, this.width, this.height);
  }

  getBuffer(): Uint8ClampedArray {
    return this.buffer;
  }

  clear(color: Color = { r: 0, g: 0, b: 0, a: 1 }): void {
    for (let i = 0; i < this.buffer.length; i += 4) {
      this.buffer[i] = color.r;
      this.buffer[i + 1] = color.g;
      this.buffer[i + 2] = color.b;
      this.buffer[i + 3] = (color.a ?? 1) * 255;
    }
  }

  drawPixel(x: number, y: number, color: Color): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    
    const index = (y * this.width + x) * 4;
    this.buffer[index] = color.r;
    this.buffer[index + 1] = color.g;
    this.buffer[index + 2] = color.b;
    this.buffer[index + 3] = (color.a ?? 1) * 255;
  }

  drawLine(start: Point2D, end: Point2D, color: Color, thickness: number = 1): void {
    // Bresenham's line algorithm
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);
    const sx = start.x < end.x ? 1 : -1;
    const sy = start.y < end.y ? 1 : -1;
    let err = dx - dy;

    let x = Math.floor(start.x);
    let y = Math.floor(start.y);
    const endX = Math.floor(end.x);
    const endY = Math.floor(end.y);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      this.drawPixel(x, y, color);
      
      if (x === endX && y === endY) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  drawRect(rect: Rect, color: Color, filled: boolean = false): void {
    if (filled) {
      for (let y = rect.y; y < rect.y + rect.height; y++) {
        for (let x = rect.x; x < rect.x + rect.width; x++) {
          this.drawPixel(x, y, color);
        }
      }
    } else {
      // Draw four lines for the rectangle border
      this.drawLine({ x: rect.x, y: rect.y }, { x: rect.x + rect.width, y: rect.y }, color);
      this.drawLine({ x: rect.x + rect.width, y: rect.y }, { x: rect.x + rect.width, y: rect.y + rect.height }, color);
      this.drawLine({ x: rect.x + rect.width, y: rect.y + rect.height }, { x: rect.x, y: rect.y + rect.height }, color);
      this.drawLine({ x: rect.x, y: rect.y + rect.height }, { x: rect.x, y: rect.y }, color);
    }
  }

  drawCircle(circle: Circle, color: Color, filled: boolean = false): void {
    // Midpoint circle algorithm
    const cx = Math.floor(circle.center.x);
    const cy = Math.floor(circle.center.y);
    const r = Math.floor(circle.radius);
    
    if (filled) {
      for (let y = -r; y <= r; y++) {
        for (let x = -r; x <= r; x++) {
          if (x * x + y * y <= r * r) {
            this.drawPixel(cx + x, cy + y, color);
          }
        }
      }
    } else {
      let x = r;
      let y = 0;
      let decisionParameter = 1 - r;

      while (x >= y) {
        this.drawPixel(cx + x, cy + y, color);
        this.drawPixel(cx - x, cy + y, color);
        this.drawPixel(cx + x, cy - y, color);
        this.drawPixel(cx - x, cy - y, color);
        this.drawPixel(cx + y, cy + x, color);
        this.drawPixel(cx - y, cy + x, color);
        this.drawPixel(cx + y, cy - x, color);
        this.drawPixel(cx - y, cy - x, color);

        y++;
        if (decisionParameter <= 0) {
          decisionParameter += 2 * y + 1;
        } else {
          x--;
          decisionParameter += 2 * (y - x) + 1;
        }
      }
    }
  }

  drawText(text: string, position: Point2D, color: Color, font?: string): void {
    // Simple bitmap font rendering would go here
    // For now, just draw a placeholder rectangle
    this.drawRect({
      x: position.x,
      y: position.y,
      width: text.length * 8,
      height: 12
    }, color, false);
  }

  drawImage(imageData: ImageData, position: Point2D, size?: { width: number; height: number }): void {
    const srcWidth = size?.width || imageData.width;
    const srcHeight = size?.height || imageData.height;
    
    for (let y = 0; y < srcHeight; y++) {
      for (let x = 0; x < srcWidth; x++) {
        const srcIndex = (y * imageData.width + x) * 4;
        const color: Color = {
          r: imageData.data[srcIndex],
          g: imageData.data[srcIndex + 1],
          b: imageData.data[srcIndex + 2],
          a: imageData.data[srcIndex + 3] / 255
        };
        this.drawPixel(position.x + x, position.y + y, color);
      }
    }
  }
}

// 3D utilities
export class Vector3 {
  constructor(public x: number, public y: number, public z: number) {}

  static add(a: Vector3, b: Vector3): Vector3 {
    return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
  }

  static subtract(a: Vector3, b: Vector3): Vector3 {
    return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  static scale(v: Vector3, scalar: number): Vector3 {
    return new Vector3(v.x * scalar, v.y * scalar, v.z * scalar);
  }

  static dot(a: Vector3, b: Vector3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  static cross(a: Vector3, b: Vector3): Vector3 {
    return new Vector3(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x
    );
  }

  static magnitude(v: Vector3): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  }

  static normalize(v: Vector3): Vector3 {
    const mag = Vector3.magnitude(v);
    return mag > 0 ? Vector3.scale(v, 1 / mag) : new Vector3(0, 0, 0);
  }
}

export class Matrix4 {
  constructor(public elements: number[] = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]) {}

  static identity(): Matrix4 {
    return new Matrix4();
  }

  static translation(x: number, y: number, z: number): Matrix4 {
    return new Matrix4([
      1, 0, 0, x,
      0, 1, 0, y,
      0, 0, 1, z,
      0, 0, 0, 1
    ]);
  }

  static rotation(angleX: number, angleY: number, angleZ: number): Matrix4 {
    const cx = Math.cos(angleX), sx = Math.sin(angleX);
    const cy = Math.cos(angleY), sy = Math.sin(angleY);
    const cz = Math.cos(angleZ), sz = Math.sin(angleZ);

    return new Matrix4([
      cy * cz, -cy * sz, sy, 0,
      cx * sz + sx * sy * cz, cx * cz - sx * sy * sz, -sx * cy, 0,
      sx * sz - cx * sy * cz, sx * cz + cx * sy * sz, cx * cy, 0,
      0, 0, 0, 1
    ]);
  }

  static scale(x: number, y: number, z: number): Matrix4 {
    return new Matrix4([
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    ]);
  }

  static perspective(fov: number, aspect: number, near: number, far: number): Matrix4 {
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1.0 / (near - far);

    return new Matrix4([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, 2 * far * near * nf,
      0, 0, -1, 0
    ]);
  }

  multiply(other: Matrix4): Matrix4 {
    const result = new Array(16);
    const a = this.elements;
    const b = other.elements;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += a[i * 4 + k] * b[k * 4 + j];
        }
        result[i * 4 + j] = sum;
      }
    }

    return new Matrix4(result);
  }

  transformPoint(point: Vector3): Vector3 {
    const m = this.elements;
    const x = point.x * m[0] + point.y * m[1] + point.z * m[2] + m[3];
    const y = point.x * m[4] + point.y * m[5] + point.z * m[6] + m[7];
    const z = point.x * m[8] + point.y * m[9] + point.z * m[10] + m[11];
    const w = point.x * m[12] + point.y * m[13] + point.z * m[14] + m[15];

    return new Vector3(x / w, y / w, z / w);
  }
}

// Chart and visualization utilities
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: Color;
    fillColor?: Color;
  }[];
}

export class ChartRenderer {
  constructor(private context: GraphicsContext) {}

  drawLineChart(data: ChartData, rect: Rect): void {
    const { datasets, labels } = data;
    if (!datasets.length || !datasets[0].data.length) return;

    const padding = 40;
    const chartRect = {
      x: rect.x + padding,
      y: rect.y + padding,
      width: rect.width - 2 * padding,
      height: rect.height - 2 * padding
    };

    // Find min/max values
    let minY = Infinity, maxY = -Infinity;
    datasets.forEach(dataset => {
      dataset.data.forEach(value => {
        minY = Math.min(minY, value);
        maxY = Math.max(maxY, value);
      });
    });

    const rangeY = maxY - minY;
    const stepX = chartRect.width / (labels.length - 1);

    // Draw axes
    const axisColor: Color = { r: 100, g: 100, b: 100 };
    this.context.drawLine(
      { x: chartRect.x, y: chartRect.y + chartRect.height },
      { x: chartRect.x + chartRect.width, y: chartRect.y + chartRect.height },
      axisColor
    );
    this.context.drawLine(
      { x: chartRect.x, y: chartRect.y },
      { x: chartRect.x, y: chartRect.y + chartRect.height },
      axisColor
    );

    // Draw data lines
    datasets.forEach(dataset => {
      for (let i = 0; i < dataset.data.length - 1; i++) {
        const x1 = chartRect.x + i * stepX;
        const y1 = chartRect.y + chartRect.height - ((dataset.data[i] - minY) / rangeY) * chartRect.height;
        const x2 = chartRect.x + (i + 1) * stepX;
        const y2 = chartRect.y + chartRect.height - ((dataset.data[i + 1] - minY) / rangeY) * chartRect.height;

        this.context.drawLine({ x: x1, y: y1 }, { x: x2, y: y2 }, dataset.color, 2);
      }
    });

    // Draw labels
    const labelColor: Color = { r: 50, g: 50, b: 50 };
    labels.forEach((label, index) => {
      const x = chartRect.x + index * stepX;
      const y = chartRect.y + chartRect.height + 20;
      this.context.drawText(label, { x: x - 10, y }, labelColor);
    });
  }

  drawBarChart(data: ChartData, rect: Rect): void {
    const { datasets, labels } = data;
    if (!datasets.length || !datasets[0].data.length) return;

    const padding = 40;
    const chartRect = {
      x: rect.x + padding,
      y: rect.y + padding,
      width: rect.width - 2 * padding,
      height: rect.height - 2 * padding
    };

    // Find max value
    let maxY = 0;
    datasets.forEach(dataset => {
      dataset.data.forEach(value => {
        maxY = Math.max(maxY, value);
      });
    });

    const barWidth = chartRect.width / labels.length * 0.8;
    const barSpacing = chartRect.width / labels.length * 0.2;

    // Draw axes
    const axisColor: Color = { r: 100, g: 100, b: 100 };
    this.context.drawLine(
      { x: chartRect.x, y: chartRect.y + chartRect.height },
      { x: chartRect.x + chartRect.width, y: chartRect.y + chartRect.height },
      axisColor
    );
    this.context.drawLine(
      { x: chartRect.x, y: chartRect.y },
      { x: chartRect.x, y: chartRect.y + chartRect.height },
      axisColor
    );

    // Draw bars
    datasets.forEach((dataset, datasetIndex) => {
      dataset.data.forEach((value, index) => {
        const barHeight = (value / maxY) * chartRect.height;
        const x = chartRect.x + index * (barWidth + barSpacing) + datasetIndex * (barWidth / datasets.length);
        const y = chartRect.y + chartRect.height - barHeight;

        this.context.drawRect({
          x,
          y,
          width: barWidth / datasets.length,
          height: barHeight
        }, dataset.color, true);
      });
    });

    // Draw labels
    const labelColor: Color = { r: 50, g: 50, b: 50 };
    labels.forEach((label, index) => {
      const x = chartRect.x + index * (barWidth + barSpacing) + barWidth / 2 - 10;
      const y = chartRect.y + chartRect.height + 20;
      this.context.drawText(label, { x, y }, labelColor);
    });
  }

  drawPieChart(data: ChartData, rect: Rect): void {
    const dataset = data.datasets[0];
    if (!dataset || !dataset.data.length) return;

    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const radius = Math.min(rect.width, rect.height) / 3;

    const total = dataset.data.reduce((sum, value) => sum + value, 0);
    let currentAngle = 0;

    dataset.data.forEach((value, index) => {
      const angle = (value / total) * 2 * Math.PI;
      const color = this.generateColor(index);

      // Draw pie slice (simplified - would need proper arc drawing)
      const points: Point2D[] = [{ x: centerX, y: centerY }];
      const steps = Math.max(3, Math.floor(angle * 20));
      
      for (let i = 0; i <= steps; i++) {
        const a = currentAngle + (angle * i) / steps;
        points.push({
          x: centerX + Math.cos(a) * radius,
          y: centerY + Math.sin(a) * radius
        });
      }

      // Draw as polygon (Canvas2D would handle this better)
      for (let i = 1; i < points.length - 1; i++) {
        const triangle = [points[0], points[i], points[i + 1]];
        this.drawTriangle(triangle, color);
      }

      currentAngle += angle;
    });
  }

  private drawTriangle(points: Point2D[], color: Color): void {
    // Simple triangle fill using line drawing
    const [p1, p2, p3] = points;
    
    // Sort points by y coordinate
    const sortedPoints = [...points].sort((a, b) => a.y - b.y);
    const [top, mid, bottom] = sortedPoints;
    
    // Fill triangle by drawing horizontal lines
    for (let y = Math.floor(top.y); y <= Math.floor(bottom.y); y++) {
      // Find intersections with triangle edges
      const intersections: number[] = [];
      
      // Check each edge
      this.addEdgeIntersection(top, mid, y, intersections);
      this.addEdgeIntersection(mid, bottom, y, intersections);
      this.addEdgeIntersection(top, bottom, y, intersections);
      
      if (intersections.length >= 2) {
        intersections.sort((a, b) => a - b);
        this.context.drawLine(
          { x: intersections[0], y },
          { x: intersections[intersections.length - 1], y },
          color
        );
      }
    }
  }

  private addEdgeIntersection(p1: Point2D, p2: Point2D, y: number, intersections: number[]): void {
    if ((p1.y <= y && y <= p2.y) || (p2.y <= y && y <= p1.y)) {
      if (p1.y === p2.y) return; // Horizontal edge
      
      const t = (y - p1.y) / (p2.y - p1.y);
      const x = p1.x + t * (p2.x - p1.x);
      intersections.push(x);
    }
  }

  private generateColor(index: number): Color {
    const hue = (index * 137.508) % 360; // Golden angle approximation
    const saturation = 70;
    const lightness = 50;
    
    // Convert HSL to RGB (simplified)
    const c = (1 - Math.abs(2 * lightness / 100 - 1)) * saturation / 100;
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = lightness / 100 - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (hue >= 0 && hue < 60) {
      r = c; g = x; b = 0;
    } else if (hue >= 60 && hue < 120) {
      r = x; g = c; b = 0;
    } else if (hue >= 120 && hue < 180) {
      r = 0; g = c; b = x;
    } else if (hue >= 180 && hue < 240) {
      r = 0; g = x; b = c;
    } else if (hue >= 240 && hue < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }
}

// Graphics factory
export class Graphics {
  static createCanvas2D(width: number, height: number): Canvas2D {
    return new Canvas2D(width, height);
  }

  static createSoftwareRenderer(width: number, height: number): SoftwareRenderer {
    return new SoftwareRenderer(width, height);
  }

  static createChartRenderer(context: GraphicsContext): ChartRenderer {
    return new ChartRenderer(context);
  }

  // Color utilities
  static rgb(r: number, g: number, b: number): Color {
    return { r: Math.round(MathUtils.clamp(r, 0, 255)), g: Math.round(MathUtils.clamp(g, 0, 255)), b: Math.round(MathUtils.clamp(b, 0, 255)) };
  }

  static rgba(r: number, g: number, b: number, a: number): Color {
    return { ...Graphics.rgb(r, g, b), a: MathUtils.clamp(a, 0, 1) };
  }

  static hsl(h: number, s: number, l: number): Color {
    h = h % 360;
    s = MathUtils.clamp(s, 0, 100) / 100;
    l = MathUtils.clamp(l, 0, 100) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  static hexToColor(hex: string): Color {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  static colorToHex(color: Color): string {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  }

  // Common colors
  static readonly Colors = {
    BLACK: { r: 0, g: 0, b: 0 },
    WHITE: { r: 255, g: 255, b: 255 },
    RED: { r: 255, g: 0, b: 0 },
    GREEN: { r: 0, g: 255, b: 0 },
    BLUE: { r: 0, g: 0, b: 255 },
    YELLOW: { r: 255, g: 255, b: 0 },
    CYAN: { r: 0, g: 255, b: 255 },
    MAGENTA: { r: 255, g: 0, b: 255 },
    GRAY: { r: 128, g: 128, b: 128 },
    ORANGE: { r: 255, g: 165, b: 0 },
    PURPLE: { r: 128, g: 0, b: 128 }
  };
}

// Only log initialization in non-CLI contexts
if (!process.argv.some(arg => arg.includes('cli.js') || arg.includes('bin/cli'))) {
  logger.info('Graphics library initialized');
}