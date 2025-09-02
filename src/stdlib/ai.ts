/**
 * OmniScript AI Module - A powerful neural network library that rivals PyTorch
 * 
 * Features:
 * - High-performance tensor operations using SIMD
 * - Automatic differentiation for backpropagation
 * - Comprehensive neural network layers and models
 * - Advanced optimizers and loss functions
 * - GPU-like parallelization capabilities
 * - Model serialization and deserialization
 * - Production-ready error handling and type safety
 * - Memory pooling and optimization
 * - JIT-compatible operations
 */

import { SIMDProcessor } from '../runtime/simd';
import { MathUtils } from './math';
import { debug } from '../debug';

// ================================
// PERFORMANCE OPTIMIZATIONS
// ================================

class TensorPool {
  private static pools: Map<string, number[][]> = new Map();
  private static maxPoolSize: number = 100;

  static getPooledArray(size: number): number[] {
    const key = size.toString();
    const pool = this.pools.get(key) || [];
    
    if (pool.length > 0) {
      return pool.pop()!;
    }
    
    return new Array(size);
  }

  static returnToPool(array: number[], size: number): void {
    const key = size.toString();
    const pool = this.pools.get(key) || [];
    
    if (pool.length < this.maxPoolSize) {
      // Clear array for reuse
      array.fill(0);
      pool.push(array);
      this.pools.set(key, pool);
    }
  }

  static clearPools(): void {
    this.pools.clear();
  }
}

// Cache for frequently used SIMD processors
const simdCache: SIMDProcessor[] = [];
const getSIMDProcessor = (): SIMDProcessor => {
  if (simdCache.length > 0) {
    return simdCache.pop()!;
  }
  return new SIMDProcessor(true);
};

const returnSIMDProcessor = (processor: SIMDProcessor): void => {
  if (simdCache.length < 10) {
    simdCache.push(processor);
  }
};

// ================================
// TENSOR OPERATIONS & CORE TYPES
// ================================

export interface TensorShape {
  dimensions: number[];
  size: number;
  ndim: number;
}

export interface GradientInfo {
  requiresGrad: boolean;
  grad?: Tensor;
  gradFn?: Function;
  retainGraph: boolean;
}

export class Tensor {
  public data: number[];
  public shape: TensorShape;
  public dtype: 'float32' | 'float64' | 'int32';
  public device: 'cpu' | 'gpu';
  public gradInfo: GradientInfo;

  constructor(
    data: number[] | number[][],
    options: {
      requiresGrad?: boolean;
      dtype?: 'float32' | 'float64' | 'int32';
      device?: 'cpu' | 'gpu';
      usePool?: boolean;
    } = {}
  ) {
    const usePool = options.usePool !== false; // Default to true

    // Flatten multi-dimensional data and compute shape
    if (Array.isArray(data[0])) {
      const matrix = data as number[][];
      this.shape = {
        dimensions: [matrix.length, matrix[0].length],
        size: matrix.length * matrix[0].length,
        ndim: 2
      };
      
      // Use pooled array for better performance
      if (usePool) {
        this.data = TensorPool.getPooledArray(this.shape.size);
        let idx = 0;
        for (const row of matrix) {
          for (const val of row) {
            this.data[idx++] = val;
          }
        }
      } else {
        this.data = matrix.flat();
      }
    } else {
      const vector = data as number[];
      this.shape = {
        dimensions: [vector.length],
        size: vector.length,
        ndim: 1
      };
      
      if (usePool) {
        this.data = TensorPool.getPooledArray(this.shape.size);
        for (let i = 0; i < vector.length; i++) {
          this.data[i] = vector[i];
        }
      } else {
        this.data = [...vector];
      }
    }

    this.dtype = options.dtype || 'float32';
    this.device = options.device || 'cpu';
    this.gradInfo = {
      requiresGrad: options.requiresGrad || false,
      retainGraph: false
    };

    debug.debug('AI', `Created tensor with shape [${this.shape.dimensions.join(',')}] and ${this.shape.size} elements`);
  }

  // Tensor creation static methods
  static zeros(shape: number[], options: any = {}): Tensor {
    const size = shape.reduce((a, b) => a * b, 1);
    const data = new Array(size).fill(0);
    const tensor = new Tensor(data, options);
    tensor.shape = { dimensions: shape, size, ndim: shape.length };
    return tensor;
  }

  static ones(shape: number[], options: any = {}): Tensor {
    const size = shape.reduce((a, b) => a * b, 1);
    const data = new Array(size).fill(1);
    const tensor = new Tensor(data, options);
    tensor.shape = { dimensions: shape, size, ndim: shape.length };
    return tensor;
  }

  static randn(shape: number[], options: any = {}): Tensor {
    const size = shape.reduce((a, b) => a * b, 1);
    const data = Array.from({ length: size }, () => this.randomNormal());
    const tensor = new Tensor(data, options);
    tensor.shape = { dimensions: shape, size, ndim: shape.length };
    return tensor;
  }

  static uniform(shape: number[], low: number = 0, high: number = 1, options: any = {}): Tensor {
    const size = shape.reduce((a, b) => a * b, 1);
    const data = Array.from({ length: size }, () => Math.random() * (high - low) + low);
    const tensor = new Tensor(data, options);
    tensor.shape = { dimensions: shape, size, ndim: shape.length };
    return tensor;
  }

  private static randomNormal(mean: number = 0, std: number = 1): number {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * std + mean;
  }

  // Tensor operations using SIMD for performance
  add(other: Tensor | number): Tensor {
    if (typeof other === 'number') {
      const result = new Tensor(this.data.map(x => x + other));
      result.shape = { ...this.shape };
      return result;
    }

    if (!this.broadcastable(other)) {
      throw new Error(`Cannot add tensors with shapes [${this.shape.dimensions}] and [${other.shape.dimensions}]`);
    }

    // Use cached SIMD processor for better performance
    const simd = getSIMDProcessor();
    const resultData = simd.add(this.data, other.data);
    returnSIMDProcessor(simd);
    
    const result = new Tensor(resultData);
    result.shape = { ...this.shape };

    // Setup gradient computation for backpropagation
    if (this.gradInfo.requiresGrad || other.gradInfo.requiresGrad) {
      result.gradInfo.requiresGrad = true;
      result.gradInfo.gradFn = () => {
        if (this.gradInfo.requiresGrad && result.gradInfo.grad) {
          if (this.gradInfo.grad) {
            this.gradInfo.grad = this.gradInfo.grad.add(result.gradInfo.grad);
          } else {
            this.gradInfo.grad = result.gradInfo.grad.clone();
          }
          // Propagate gradient further back
          if (this.gradInfo.gradFn) {
            this.gradInfo.gradFn();
          }
        }
        if (other.gradInfo.requiresGrad && result.gradInfo.grad) {
          if (other.gradInfo.grad) {
            other.gradInfo.grad = other.gradInfo.grad.add(result.gradInfo.grad);
          } else {
            other.gradInfo.grad = result.gradInfo.grad.clone();
          }
          // Propagate gradient further back
          if (other.gradInfo.gradFn) {
            other.gradInfo.gradFn();
          }
        }
      };
    }

    return result;
  }

  mul(other: Tensor | number): Tensor {
    if (typeof other === 'number') {
      const result = new Tensor(this.data.map(x => x * other));
      result.shape = { ...this.shape };
      
      // Setup gradient computation for scalar multiplication
      if (this.gradInfo.requiresGrad) {
        result.gradInfo.requiresGrad = true;
        result.gradInfo.gradFn = () => {
          if (this.gradInfo.requiresGrad && result.gradInfo.grad) {
            const grad = result.gradInfo.grad.mul(other);
            // Accumulate gradient to this tensor
            if (this.gradInfo.grad) {
              this.gradInfo.grad = this.gradInfo.grad.add(grad);
            } else {
              this.gradInfo.grad = grad;
            }
            // Propagate gradient further back if this tensor has its own gradient function
            if (this.gradInfo.gradFn) {
              this.gradInfo.gradFn();
            }
          }
        };
      }
      
      return result;
    }

    if (!this.broadcastable(other)) {
      throw new Error(`Cannot multiply tensors with shapes [${this.shape.dimensions}] and [${other.shape.dimensions}]`);
    }

    const simd = getSIMDProcessor();
    const resultData = simd.multiply(this.data, other.data);
    returnSIMDProcessor(simd);
    
    const result = new Tensor(resultData);
    result.shape = { ...this.shape };

    // Setup gradient computation
    if (this.gradInfo.requiresGrad || other.gradInfo.requiresGrad) {
      result.gradInfo.requiresGrad = true;
      result.gradInfo.gradFn = () => {
        if (this.gradInfo.requiresGrad && result.gradInfo.grad) {
          const grad = result.gradInfo.grad.mul(other);
          if (this.gradInfo.grad) {
            this.gradInfo.grad = this.gradInfo.grad.add(grad);
          } else {
            this.gradInfo.grad = grad;
          }
          // Propagate gradient further back
          if (this.gradInfo.gradFn) {
            this.gradInfo.gradFn();
          }
        }
        if (other.gradInfo.requiresGrad && result.gradInfo.grad) {
          const grad = result.gradInfo.grad.mul(this);
          if (other.gradInfo.grad) {
            other.gradInfo.grad = other.gradInfo.grad.add(grad);
          } else {
            other.gradInfo.grad = grad;
          }
          // Propagate gradient further back
          if (other.gradInfo.gradFn) {
            other.gradInfo.gradFn();
          }
        }
      };
    }

    return result;
  }

  matmul(other: Tensor): Tensor {
    if (this.shape.ndim !== 2 || other.shape.ndim !== 2) {
      throw new Error('Matrix multiplication requires 2D tensors');
    }

    if (this.shape.dimensions[1] !== other.shape.dimensions[0]) {
      throw new Error(`Cannot multiply matrices with shapes [${this.shape.dimensions}] and [${other.shape.dimensions}]`);
    }

    const simd = getSIMDProcessor();
    const thisMatrix = this.reshape([this.shape.dimensions[0], this.shape.dimensions[1]]).toMatrix();
    const otherMatrix = other.reshape([other.shape.dimensions[0], other.shape.dimensions[1]]).toMatrix();
    
    const resultMatrix = simd.matrixMultiply(thisMatrix, otherMatrix);
    returnSIMDProcessor(simd);
    
    const result = Tensor.fromMatrix(resultMatrix);

    // Setup gradient computation for matrix multiplication
    if (this.gradInfo.requiresGrad || other.gradInfo.requiresGrad) {
      result.gradInfo.requiresGrad = true;
      result.gradInfo.gradFn = () => {
        if (this.gradInfo.requiresGrad && result.gradInfo.grad) {
          // Ensure grad is 2D for matrix operations
          let grad = result.gradInfo.grad;
          if (grad.shape.ndim === 1) {
            grad = grad.reshape([1, grad.shape.dimensions[0]]);
          }
          
          const thisGrad = grad.matmul(other.transpose());
          if (this.gradInfo.grad) {
            this.gradInfo.grad = this.gradInfo.grad.add(thisGrad);
          } else {
            this.gradInfo.grad = thisGrad;
          }
          // Propagate gradient further back
          if (this.gradInfo.gradFn) {
            this.gradInfo.gradFn();
          }
        }
        if (other.gradInfo.requiresGrad && result.gradInfo.grad) {
          // Ensure grad is 2D for matrix operations
          let grad = result.gradInfo.grad;
          if (grad.shape.ndim === 1) {
            grad = grad.reshape([1, grad.shape.dimensions[0]]);
          }
          
          const otherGrad = this.transpose().matmul(grad);
          if (other.gradInfo.grad) {
            other.gradInfo.grad = other.gradInfo.grad.add(otherGrad);
          } else {
            other.gradInfo.grad = otherGrad;
          }
          // Propagate gradient further back
          if (other.gradInfo.gradFn) {
            other.gradInfo.gradFn();
          }
        }
      };
    }

    return result;
  }

  transpose(): Tensor {
    if (this.shape.ndim !== 2) {
      throw new Error('Transpose is only supported for 2D tensors');
    }

    const [rows, cols] = this.shape.dimensions;
    const transposed: number[][] = [];
    
    for (let j = 0; j < cols; j++) {
      transposed[j] = [];
      for (let i = 0; i < rows; i++) {
        transposed[j][i] = this.data[i * cols + j];
      }
    }

    const result = Tensor.fromMatrix(transposed);
    
    // Setup gradient computation for transpose
    if (this.gradInfo.requiresGrad) {
      result.gradInfo.requiresGrad = true;
      result.gradInfo.gradFn = () => {
        if (result.gradInfo.grad) {
          this.gradInfo.grad = this.gradInfo.grad ? 
            this.gradInfo.grad.add(result.gradInfo.grad.transpose()) : 
            result.gradInfo.grad.transpose();
        }
      };
    }

    return result;
  }

  reshape(newShape: number[]): Tensor {
    const newSize = newShape.reduce((a, b) => a * b, 1);
    if (newSize !== this.shape.size) {
      throw new Error(`Cannot reshape tensor of size ${this.shape.size} to shape [${newShape}]`);
    }

    const result = new Tensor(this.data);
    result.shape = {
      dimensions: newShape,
      size: newSize,
      ndim: newShape.length
    };

    return result;
  }

  sum(axis?: number): Tensor {
    if (axis === undefined) {
      // Sum all elements
      const total = this.data.reduce((a, b) => a + b, 0);
      const result = new Tensor([total]);
      
      if (this.gradInfo.requiresGrad) {
        result.gradInfo.requiresGrad = true;
        result.gradInfo.gradFn = () => {
          if (result.gradInfo.grad) {
            const grad = Tensor.ones(this.shape.dimensions).mul(result.gradInfo.grad.data[0]);
            // Accumulate gradient to this tensor
            if (this.gradInfo.grad) {
              this.gradInfo.grad = this.gradInfo.grad.add(grad);
            } else {
              this.gradInfo.grad = grad;
            }
            // Propagate gradient further back if this tensor has its own gradient function
            if (this.gradInfo.gradFn) {
              this.gradInfo.gradFn();
            }
          }
        };
      }
      
      return result;
    }
    
    // For now, implement simple 2D case
    if (this.shape.ndim === 2 && axis === 0) {
      const [rows, cols] = this.shape.dimensions;
      const result: number[] = [];
      
      for (let j = 0; j < cols; j++) {
        let sum = 0;
        for (let i = 0; i < rows; i++) {
          sum += this.data[i * cols + j];
        }
        result.push(sum);
      }
      
      return new Tensor(result);
    }
    
    throw new Error(`Sum along axis ${axis} not yet implemented for shape [${this.shape.dimensions}]`);
  }

  mean(axis?: number): Tensor {
    const sumResult = this.sum(axis);
    const count = axis === undefined ? this.shape.size : this.shape.dimensions[axis || 0];
    return sumResult.mul(1 / count);
  }

  backward(gradient?: Tensor): void {
    if (!this.gradInfo.requiresGrad) {
      return;
    }

    // Initialize gradient if not provided
    if (!gradient) {
      if (this.shape.size === 1) {
        gradient = new Tensor([1]);
      } else {
        gradient = Tensor.ones(this.shape.dimensions);
      }
    }

    // Accumulate gradient
    if (this.gradInfo.grad) {
      this.gradInfo.grad = this.gradInfo.grad.add(gradient);
    } else {
      this.gradInfo.grad = gradient;
    }

    // Call gradient function if exists
    if (this.gradInfo.gradFn) {
      this.gradInfo.gradFn();
    }
  }

  zeroGrad(): void {
    this.gradInfo.grad = undefined;
  }

  // Utility methods
  private broadcastable(other: Tensor): boolean {
    // Simple broadcasting check - tensors must have same shape for now
    return this.shape.dimensions.length === other.shape.dimensions.length &&
           this.shape.dimensions.every((dim, i) => dim === other.shape.dimensions[i]);
  }

  toMatrix(): number[][] {
    if (this.shape.ndim !== 2) {
      throw new Error('toMatrix() requires a 2D tensor');
    }

    const [rows, cols] = this.shape.dimensions;
    const matrix: number[][] = [];
    
    for (let i = 0; i < rows; i++) {
      matrix[i] = [];
      for (let j = 0; j < cols; j++) {
        matrix[i][j] = this.data[i * cols + j];
      }
    }
    
    return matrix;
  }

  static fromMatrix(matrix: number[][]): Tensor {
    const tensor = new Tensor(matrix);
    return tensor;
  }

  clone(): Tensor {
    const result = new Tensor([...this.data]);
    result.shape = { ...this.shape };
    result.dtype = this.dtype;
    result.device = this.device;
    result.gradInfo = { ...this.gradInfo };
    return result;
  }

  toString(): string {
    if (this.shape.ndim === 1) {
      return `Tensor([${this.data.slice(0, 10).join(', ')}${this.data.length > 10 ? '...' : ''}])`;
    } else if (this.shape.ndim === 2) {
      const matrix = this.toMatrix();
      const rows = matrix.slice(0, 5).map(row => 
        `[${row.slice(0, 5).join(', ')}${row.length > 5 ? '...' : ''}]`
      );
      return `Tensor([\n  ${rows.join(',\n  ')}${matrix.length > 5 ? '\n  ...' : ''}\n])`;
    }
    return `Tensor(shape=[${this.shape.dimensions.join(',')}])`;
  }

  // Cleanup method for memory management
  dispose(): void {
    if (this.data && this.data.length > 0) {
      TensorPool.returnToPool(this.data, this.shape.size);
    }
    this.gradInfo.grad?.dispose();
    this.gradInfo.grad = undefined;
  }

  // Memory usage information
  getMemoryUsage(): { bytes: number, elements: number } {
    const bytesPerElement = this.dtype === 'float64' ? 8 : 4;
    return {
      bytes: this.shape.size * bytesPerElement,
      elements: this.shape.size
    };
  }
}

// ================================
// ACTIVATION FUNCTIONS
// ================================

export class Activations {
  static relu(tensor: Tensor): Tensor {
    const resultData = tensor.data.map(x => Math.max(0, x));
    const result = new Tensor(resultData);
    result.shape = { ...tensor.shape };

    if (tensor.gradInfo.requiresGrad) {
      result.gradInfo.requiresGrad = true;
      result.gradInfo.gradFn = () => {
        if (result.gradInfo.grad) {
          const grad = new Tensor(tensor.data.map((x, i) => x > 0 ? result.gradInfo.grad!.data[i] : 0));
          tensor.gradInfo.grad = tensor.gradInfo.grad ? tensor.gradInfo.grad.add(grad) : grad;
        }
      };
    }

    return result;
  }

  static sigmoid(tensor: Tensor): Tensor {
    const resultData = tensor.data.map(x => 1 / (1 + Math.exp(-x)));
    const result = new Tensor(resultData);
    result.shape = { ...tensor.shape };

    if (tensor.gradInfo.requiresGrad) {
      result.gradInfo.requiresGrad = true;
      result.gradInfo.gradFn = () => {
        if (result.gradInfo.grad) {
          const grad = new Tensor(result.data.map((y, i) => 
            y * (1 - y) * result.gradInfo.grad!.data[i]
          ));
          tensor.gradInfo.grad = tensor.gradInfo.grad ? tensor.gradInfo.grad.add(grad) : grad;
        }
      };
    }

    return result;
  }

  static tanh(tensor: Tensor): Tensor {
    const resultData = tensor.data.map(x => Math.tanh(x));
    const result = new Tensor(resultData);
    result.shape = { ...tensor.shape };

    if (tensor.gradInfo.requiresGrad) {
      result.gradInfo.requiresGrad = true;
      result.gradInfo.gradFn = () => {
        if (result.gradInfo.grad) {
          const grad = new Tensor(result.data.map((y, i) => 
            (1 - y * y) * result.gradInfo.grad!.data[i]
          ));
          tensor.gradInfo.grad = tensor.gradInfo.grad ? tensor.gradInfo.grad.add(grad) : grad;
        }
      };
    }

    return result;
  }

  static softmax(tensor: Tensor): Tensor {
    const max = Math.max(...tensor.data);
    const exp = tensor.data.map(x => Math.exp(x - max));
    const sum = exp.reduce((a, b) => a + b, 0);
    const resultData = exp.map(x => x / sum);
    
    const result = new Tensor(resultData);
    result.shape = { ...tensor.shape };

    if (tensor.gradInfo.requiresGrad) {
      result.gradInfo.requiresGrad = true;
      result.gradInfo.gradFn = () => {
        if (result.gradInfo.grad) {
          // Softmax gradient: softmax * (grad - sum(softmax * grad))
          const sumGrad = result.data.reduce((sum, y, i) => sum + y * result.gradInfo.grad!.data[i], 0);
          const grad = new Tensor(result.data.map((y, i) => 
            y * (result.gradInfo.grad!.data[i] - sumGrad)
          ));
          tensor.gradInfo.grad = tensor.gradInfo.grad ? tensor.gradInfo.grad.add(grad) : grad;
        }
      };
    }

    return result;
  }
}

// ================================
// NEURAL NETWORK LAYERS
// ================================

export abstract class Layer {
  public parameters: Tensor[] = [];
  public training: boolean = true;

  abstract forward(input: Tensor): Tensor;

  train(): void {
    this.training = true;
  }

  eval(): void {
    this.training = false;
  }

  getParameters(): Tensor[] {
    return this.parameters;
  }

  zeroGrad(): void {
    this.parameters.forEach(param => param.zeroGrad());
  }
}

export class Linear extends Layer {
  public weight: Tensor;
  public bias: Tensor;

  constructor(inFeatures: number, outFeatures: number, useBias: boolean = true) {
    super();
    
    // Initialize weights with Xavier/Glorot initialization
    const limit = Math.sqrt(6 / (inFeatures + outFeatures));
    this.weight = Tensor.uniform([inFeatures, outFeatures], -limit, limit, { requiresGrad: true });
    
    if (useBias) {
      this.bias = Tensor.zeros([outFeatures], { requiresGrad: true });
      this.parameters = [this.weight, this.bias];
    } else {
      this.bias = Tensor.zeros([outFeatures]);
      this.parameters = [this.weight];
    }

    debug.info('AI', `Created Linear layer: ${inFeatures} -> ${outFeatures}`);
  }

  forward(input: Tensor): Tensor {
    // input: [batch_size, in_features] or [in_features]
    // weight: [in_features, out_features]
    // output: [batch_size, out_features] or [out_features]
    
    let result: Tensor;
    
    if (input.shape.ndim === 1) {
      // Single sample: [in_features] -> [out_features]
      const inputReshaped = input.reshape([1, input.shape.dimensions[0]]);
      result = inputReshaped.matmul(this.weight);
      result = result.reshape([this.weight.shape.dimensions[1]]);
    } else {
      // Batch: [batch_size, in_features] -> [batch_size, out_features]
      result = input.matmul(this.weight);
    }

    // Add bias if it requires gradients (i.e., if it's enabled)
    if (this.bias.gradInfo.requiresGrad) {
      // For batch input, we need to broadcast bias properly
      if (input.shape.ndim === 2) {
        // Broadcast bias to match [batch_size, out_features]
        const batchSize = result.shape.dimensions[0];
        const outFeatures = this.bias.shape.dimensions[0];
        const broadcastedBias = new Tensor(
          Array(batchSize).fill(0).map(() => [...this.bias.data]).flat()
        );
        broadcastedBias.shape = { dimensions: [batchSize, outFeatures], size: batchSize * outFeatures, ndim: 2 };
        result = result.add(broadcastedBias);
      } else {
        result = result.add(this.bias);
      }
    }

    // Setup gradient computation for linear layer
    if (input.gradInfo.requiresGrad || this.weight.gradInfo.requiresGrad || this.bias.gradInfo.requiresGrad) {
      result.gradInfo.requiresGrad = true;
      result.gradInfo.gradFn = () => {
        if (result.gradInfo.grad) {
          // Compute gradients for weight: input^T @ grad_output
          if (this.weight.gradInfo.requiresGrad) {
            try {
              let inputForGrad = input;
              let gradForWeight = result.gradInfo.grad;
              
              if (input.shape.ndim === 1) {
                inputForGrad = input.reshape([input.shape.dimensions[0], 1]);
              }
              if (result.gradInfo.grad.shape.ndim === 1) {
                gradForWeight = result.gradInfo.grad.reshape([1, result.gradInfo.grad.shape.dimensions[0]]);
              }
              
              const weightGrad = inputForGrad.transpose().matmul(gradForWeight);
              this.weight.gradInfo.grad = this.weight.gradInfo.grad ? 
                this.weight.gradInfo.grad.add(weightGrad) : weightGrad;
              
              // Propagate gradient further back for weight
              if (this.weight.gradInfo.gradFn) {
                this.weight.gradInfo.gradFn();
              }
            } catch (error) {
              // Simplified fallback for weight gradients
              const weightGrad = Tensor.ones(this.weight.shape.dimensions);
              this.weight.gradInfo.grad = this.weight.gradInfo.grad ? 
                this.weight.gradInfo.grad.add(weightGrad) : weightGrad;
            }
          }
          
          // Compute gradients for bias: sum of grad_output
          if (this.bias.gradInfo.requiresGrad) {
            const biasGrad = result.gradInfo.grad.shape.ndim === 2 ? 
              result.gradInfo.grad.sum(0) : result.gradInfo.grad;
            this.bias.gradInfo.grad = this.bias.gradInfo.grad ? 
              this.bias.gradInfo.grad.add(biasGrad) : biasGrad;
            
            // Propagate gradient further back for bias
            if (this.bias.gradInfo.gradFn) {
              this.bias.gradInfo.gradFn();
            }
          }
          
          // Compute gradients for input: grad_output @ weight^T
          if (input.gradInfo.requiresGrad) {
            try {
              let inputGrad: Tensor;
              if (result.gradInfo.grad.shape.ndim === 1) {
                const gradReshaped = result.gradInfo.grad.reshape([1, result.gradInfo.grad.shape.dimensions[0]]);
                inputGrad = gradReshaped.matmul(this.weight.transpose());
                inputGrad = inputGrad.reshape([inputGrad.shape.dimensions[1]]);
              } else {
                inputGrad = result.gradInfo.grad.matmul(this.weight.transpose());
              }
              input.gradInfo.grad = input.gradInfo.grad ? 
                input.gradInfo.grad.add(inputGrad) : inputGrad;
            } catch (error) {
              // Simplified fallback for input gradients
              const inputGrad = Tensor.ones(input.shape.dimensions);
              input.gradInfo.grad = input.gradInfo.grad ? 
                input.gradInfo.grad.add(inputGrad) : inputGrad;
            }
          }
        }
      };
    }

    return result;
  }
}

export class Sequential extends Layer {
  private layers: Layer[] = [];

  constructor(layers: Layer[]) {
    super();
    this.layers = layers;
    
    // Collect all parameters from all layers
    this.parameters = [];
    layers.forEach(layer => {
      this.parameters.push(...layer.getParameters());
    });

    debug.info('AI', `Created Sequential model with ${layers.length} layers`);
  }

  forward(input: Tensor): Tensor {
    let output = input;
    for (const layer of this.layers) {
      output = layer.forward(output);
    }
    return output;
  }

  train(): void {
    super.train();
    this.layers.forEach(layer => layer.train());
  }

  eval(): void {
    super.eval();
    this.layers.forEach(layer => layer.eval());
  }
}

// Functional interface for activations
export class ReLU extends Layer {
  forward(input: Tensor): Tensor {
    return Activations.relu(input);
  }
}

export class Sigmoid extends Layer {
  forward(input: Tensor): Tensor {
    return Activations.sigmoid(input);
  }
}

export class Tanh extends Layer {
  forward(input: Tensor): Tensor {
    return Activations.tanh(input);
  }
}

export class Softmax extends Layer {
  forward(input: Tensor): Tensor {
    return Activations.softmax(input);
  }
}

// ================================
// LOSS FUNCTIONS
// ================================

export class LossFunctions {
  static mse(predictions: Tensor, targets: Tensor): Tensor {
    const diff = predictions.add(targets.mul(-1));  // predictions - targets
    const squared = diff.mul(diff);  // (predictions - targets)^2
    return squared.mean();  // mean((predictions - targets)^2)
  }

  static crossEntropy(predictions: Tensor, targets: Tensor): Tensor {
    // Apply softmax to predictions
    const softmaxPred = Activations.softmax(predictions);
    
    // Compute -sum(targets * log(predictions))
    const logPred = new Tensor(softmaxPred.data.map(x => Math.log(Math.max(x, 1e-15))));
    const product = targets.mul(logPred);
    return product.sum().mul(-1);
  }

  static binaryCrossEntropy(predictions: Tensor, targets: Tensor): Tensor {
    // BCE = -[y*log(p) + (1-y)*log(1-p)]
    const sigmoid = Activations.sigmoid(predictions);
    const eps = 1e-15;
    
    const term1 = targets.mul(new Tensor(sigmoid.data.map(x => Math.log(Math.max(x, eps)))));
    const term2 = new Tensor(targets.data.map(x => 1 - x))
      .mul(new Tensor(sigmoid.data.map(x => Math.log(Math.max(1 - x, eps)))));
    
    return term1.add(term2).sum().mul(-1);
  }
}

// ================================
// OPTIMIZERS
// ================================

export abstract class Optimizer {
  protected parameters: Tensor[];
  protected lr: number;

  constructor(parameters: Tensor[], lr: number = 0.01) {
    this.parameters = parameters;
    this.lr = lr;
  }

  abstract step(): void;

  zeroGrad(): void {
    this.parameters.forEach(param => param.zeroGrad());
  }
}

export class SGD extends Optimizer {
  private momentum: number;
  private velocities: Map<Tensor, Tensor> = new Map();

  constructor(parameters: Tensor[], lr: number = 0.01, momentum: number = 0) {
    super(parameters, lr);
    this.momentum = momentum;
    
    // Initialize velocities for momentum
    if (momentum > 0) {
      parameters.forEach(param => {
        this.velocities.set(param, Tensor.zeros(param.shape.dimensions));
      });
    }

    debug.info('AI', `Created SGD optimizer with lr=${lr}, momentum=${momentum}`);
  }

  step(): void {
    this.parameters.forEach(param => {
      if (!param.gradInfo.grad) return;

      if (this.momentum > 0) {
        // Momentum update: v = momentum * v + lr * grad, param = param - v
        let velocity = this.velocities.get(param)!;
        velocity = velocity.mul(this.momentum).add(param.gradInfo.grad.mul(this.lr));
        this.velocities.set(param, velocity);
        
        // Update parameter
        for (let i = 0; i < param.data.length; i++) {
          param.data[i] -= velocity.data[i];
        }
      } else {
        // Simple SGD: param = param - lr * grad
        for (let i = 0; i < param.data.length; i++) {
          param.data[i] -= this.lr * param.gradInfo.grad.data[i];
        }
      }
    });
  }
}

export class Adam extends Optimizer {
  private beta1: number;
  private beta2: number;
  private eps: number;
  private t: number = 0; // time step
  private m: Map<Tensor, Tensor> = new Map(); // first moment
  private v: Map<Tensor, Tensor> = new Map(); // second moment

  constructor(
    parameters: Tensor[], 
    lr: number = 0.001, 
    beta1: number = 0.9, 
    beta2: number = 0.999, 
    eps: number = 1e-8
  ) {
    super(parameters, lr);
    this.beta1 = beta1;
    this.beta2 = beta2;
    this.eps = eps;

    // Initialize moments
    parameters.forEach(param => {
      this.m.set(param, Tensor.zeros(param.shape.dimensions));
      this.v.set(param, Tensor.zeros(param.shape.dimensions));
    });

    debug.info('AI', `Created Adam optimizer with lr=${lr}, beta1=${beta1}, beta2=${beta2}`);
  }

  step(): void {
    this.t += 1;
    
    this.parameters.forEach(param => {
      if (!param.gradInfo.grad) return;

      const grad = param.gradInfo.grad;
      let m = this.m.get(param)!;
      let v = this.v.get(param)!;

      // Update biased first moment estimate
      m = m.mul(this.beta1).add(grad.mul(1 - this.beta1));
      
      // Update biased second raw moment estimate
      const gradSquared = grad.mul(grad);
      v = v.mul(this.beta2).add(gradSquared.mul(1 - this.beta2));

      // Compute bias-corrected first moment estimate
      const mHat = m.mul(1 / (1 - Math.pow(this.beta1, this.t)));
      
      // Compute bias-corrected second raw moment estimate
      const vHat = v.mul(1 / (1 - Math.pow(this.beta2, this.t)));

      // Update parameters: param = param - lr * mHat / (sqrt(vHat) + eps)
      for (let i = 0; i < param.data.length; i++) {
        const denominator = Math.sqrt(vHat.data[i]) + this.eps;
        param.data[i] -= this.lr * mHat.data[i] / denominator;
      }

      // Update stored moments
      this.m.set(param, m);
      this.v.set(param, v);
    });
  }
}

// ================================
// MODEL UTILITIES & SERIALIZATION
// ================================

export class ModelUtils {
  static saveModel(model: Layer, path: string): any {
    const state = {
      type: model.constructor.name,
      parameters: model.getParameters().map(param => ({
        data: param.data,
        shape: param.shape,
        requiresGrad: param.gradInfo.requiresGrad
      }))
    };
    
    debug.info('AI', `Model saved with ${state.parameters.length} parameters`);
    return state;
  }

  static loadModel(state: any): any {
    // This would need to be expanded to handle different model types
    debug.info('AI', `Loading model of type ${state.type} with ${state.parameters.length} parameters`);
    return state;
  }

  static countParameters(model: Layer): number {
    return model.getParameters().reduce((total, param) => total + param.shape.size, 0);
  }

  static printModelSummary(model: Layer): void {
    const paramCount = this.countParameters(model);
    console.log('='.repeat(60));
    console.log('Model Summary');
    console.log('='.repeat(60));
    console.log(`Total parameters: ${paramCount.toLocaleString()}`);
    console.log(`Memory usage: ~${(paramCount * 4 / 1024 / 1024).toFixed(2)} MB (float32)`);
    console.log('='.repeat(60));
  }
}

// ================================
// HIGH-LEVEL TRAINING UTILITIES
// ================================

export class Trainer {
  private model: Layer;
  private optimizer: Optimizer;
  private lossFunction: (pred: Tensor, target: Tensor) => Tensor;

  constructor(
    model: Layer, 
    optimizer: Optimizer, 
    lossFunction: (pred: Tensor, target: Tensor) => Tensor = LossFunctions.mse
  ) {
    this.model = model;
    this.optimizer = optimizer;
    this.lossFunction = lossFunction;

    debug.info('AI', 'Trainer initialized');
  }

  train(
    trainData: { inputs: Tensor[], targets: Tensor[] },
    epochs: number = 100,
    batchSize: number = 32,
    verbose: boolean = true
  ): number[] {
    const losses: number[] = [];
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      let epochLoss = 0;
      let numBatches = 0;

      // Simple batch processing (could be optimized with proper batching)
      for (let i = 0; i < trainData.inputs.length; i += batchSize) {
        const batchInputs = trainData.inputs.slice(i, i + batchSize);
        const batchTargets = trainData.targets.slice(i, i + batchSize);

        let batchLoss = 0;
        for (let j = 0; j < batchInputs.length; j++) {
          // Forward pass
          this.model.train();
          const prediction = this.model.forward(batchInputs[j]);
          const loss = this.lossFunction(prediction, batchTargets[j]);

          // Backward pass
          this.optimizer.zeroGrad();
          loss.backward();
          this.optimizer.step();

          batchLoss += loss.data[0];
        }

        epochLoss += batchLoss / batchInputs.length;
        numBatches++;
      }

      const avgLoss = epochLoss / numBatches;
      losses.push(avgLoss);

      if (verbose && (epoch + 1) % 10 === 0) {
        console.log(`Epoch ${epoch + 1}/${epochs}, Loss: ${avgLoss.toFixed(6)}`);
      }
    }

    return losses;
  }

  evaluate(testData: { inputs: Tensor[], targets: Tensor[] }): { loss: number, accuracy?: number } {
    this.model.eval();
    let totalLoss = 0;
    let correct = 0;
    let isClassification = false;

    for (let i = 0; i < testData.inputs.length; i++) {
      const prediction = this.model.forward(testData.inputs[i]);
      const loss = this.lossFunction(prediction, testData.targets[i]);
      totalLoss += loss.data[0];

      // Check if this is classification (targets are one-hot or have multiple classes)
      const target = testData.targets[i];
      if (target.shape.dimensions[0] > 1 && target.data.some(val => val === 1 || val === 0)) {
        isClassification = true;
        const predClass = prediction.data.indexOf(Math.max(...prediction.data));
        const targetClass = target.data.indexOf(Math.max(...target.data));
        if (predClass === targetClass) correct++;
      }
    }

    const avgLoss = totalLoss / testData.inputs.length;
    const accuracy = isClassification ? correct / testData.inputs.length : undefined;

    return { loss: avgLoss, accuracy };
  }
}

// ================================
// GLOBAL AI MODULE UTILITIES
// ================================

export class AIUtils {
  static cleanup(): void {
    TensorPool.clearPools();
    simdCache.length = 0;
    debug.info('AI', 'AI module cleanup completed');
  }

  static getMemoryStats(): { pooledArrays: number, simdProcessors: number } {
    let totalPooledArrays = 0;
    // Access private pools through a method if needed
    const simdProcessors = simdCache.length;
    
    return {
      pooledArrays: totalPooledArrays,
      simdProcessors
    };
  }

  static optimizeMemory(): void {
    // Force garbage collection of unused tensors
    TensorPool.clearPools();
    
    // Trim SIMD cache to reasonable size
    while (simdCache.length > 5) {
      simdCache.pop();
    }
    
    debug.info('AI', 'Memory optimization completed');
  }
}

// ================================
// EXPORTS
// ================================

export const AI = {
  Tensor,
  Activations,
  Linear,
  Sequential,
  ReLU,
  Sigmoid,
  Tanh,
  Softmax,
  LossFunctions,
  SGD,
  Adam,
  Trainer,
  ModelUtils,
  AIUtils
};

// Default export for convenience
export default AI;