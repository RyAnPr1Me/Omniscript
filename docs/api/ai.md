# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [ai](#ai)

## ai

**File**: `src/stdlib/ai.ts`

### Classes

#### TensorPool

**Properties**:

- `pools: Map<string, number[][]>` - 
- `maxPoolSize: number` - 

**Methods**:

##### getPooledArray

**Signature**: `static getPooledArray(size: number): number[]`

##### returnToPool

**Signature**: `static returnToPool(array: number[], size: number): void`

##### clearPools

**Signature**: `static clearPools(): void`

#### Tensor

**Properties**:

- `data: number[]` - 
- `shape: TensorShape` - 
- `dtype: 'float32' | 'float64' | 'int32'` - 
- `device: 'cpu' | 'gpu'` - 
- `gradInfo: GradientInfo` - 
- `randomSeed: number | undefined` - 

**Methods**:

##### zeros

**Signature**: `static zeros(shape: number[], options: any =`

##### ones

**Signature**: `static ones(shape: number[], options: any =`

##### randn

**Signature**: `static randn(shape: number[], options: any =`

##### uniform

**Signature**: `static uniform(shape: number[], low: number = 0, high: number = 1, options: any =`

##### randomNormal

**Signature**: `private static randomNormal(mean: number = 0, std: number = 1): number`

##### resetRandomSeed

**Signature**: `static resetRandomSeed(seed: number = 12345): void`

##### add

**Signature**: `add(other: Tensor | number): Tensor`

##### mul

**Signature**: `mul(other: Tensor | number): Tensor`

##### matmul

**Signature**: `matmul(other: Tensor): Tensor`

##### transpose

**Signature**: `transpose(): Tensor`

##### reshape

**Signature**: `reshape(newShape: number[]): Tensor`

##### sum

**Signature**: `sum(axis?: number): Tensor`

##### mean

**Signature**: `mean(axis?: number): Tensor`

##### backward

**Signature**: `backward(gradient?: Tensor): void`

##### zeroGrad

**Signature**: `zeroGrad(): void`

##### broadcastable

**Signature**: `private broadcastable(other: Tensor): boolean`

##### toMatrix

**Signature**: `toMatrix(): number[][]`

##### fromMatrix

**Signature**: `static fromMatrix(matrix: number[][]): Tensor`

##### clone

**Signature**: `clone(): Tensor`

##### toString

**Signature**: `toString(): string`

##### dispose

**Signature**: `dispose(): void`

##### getMemoryUsage

**Signature**: `getMemoryUsage():`

#### Activations

**Methods**:

##### relu

**Signature**: `static relu(tensor: Tensor): Tensor`

##### sigmoid

**Signature**: `static sigmoid(tensor: Tensor): Tensor`

##### tanh

**Signature**: `static tanh(tensor: Tensor): Tensor`

##### softmax

**Signature**: `static softmax(tensor: Tensor): Tensor`

#### Layer

**Properties**:

- `parameters: Tensor[]` - 
- `training: boolean` - 

**Methods**:

##### forward

**Signature**: `abstract forward(input: Tensor): Tensor;`

##### train

**Signature**: `train(): void`

##### eval

**Signature**: `eval(): void`

##### getParameters

**Signature**: `getParameters(): Tensor[]`

##### zeroGrad

**Signature**: `zeroGrad(): void`

#### Linear

**Extends**: `Layer`

**Properties**:

- `weight: Tensor` - 
- `bias: Tensor` - 

**Methods**:

##### forward

**Signature**: `forward(input: Tensor): Tensor`

#### Sequential

**Extends**: `Layer`

**Properties**:

- `layers: Layer[]` - 

**Methods**:

##### forward

**Signature**: `forward(input: Tensor): Tensor`

##### train

**Signature**: `train(): void`

##### eval

**Signature**: `eval(): void`

#### ReLU

**Extends**: `Layer`

**Methods**:

##### forward

**Signature**: `forward(input: Tensor): Tensor`

#### Sigmoid

**Extends**: `Layer`

**Methods**:

##### forward

**Signature**: `forward(input: Tensor): Tensor`

#### Tanh

**Extends**: `Layer`

**Methods**:

##### forward

**Signature**: `forward(input: Tensor): Tensor`

#### Softmax

**Extends**: `Layer`

**Methods**:

##### forward

**Signature**: `forward(input: Tensor): Tensor`

#### LossFunctions

**Methods**:

##### mse

**Signature**: `static mse(predictions: Tensor, targets: Tensor): Tensor`

##### crossEntropy

**Signature**: `static crossEntropy(predictions: Tensor, targets: Tensor): Tensor`

##### binaryCrossEntropy

**Signature**: `static binaryCrossEntropy(predictions: Tensor, targets: Tensor): Tensor`

#### Optimizer

**Properties**:

- `parameters: Tensor[]` - 
- `lr: number` - 

**Methods**:

##### step

**Signature**: `abstract step(): void;`

##### zeroGrad

**Signature**: `zeroGrad(): void`

#### SGD

**Extends**: `Optimizer`

**Properties**:

- `momentum: number` - 
- `velocities: Map<Tensor, Tensor>` - 

**Methods**:

##### step

**Signature**: `step(): void`

#### Adam

**Extends**: `Optimizer`

**Properties**:

- `beta1: number` - 
- `beta2: number` - 
- `eps: number` - 
- `t: number` - 
- `m: Map<Tensor, Tensor>` - 
- `v: Map<Tensor, Tensor>` - 

**Methods**:

##### step

**Signature**: `step(): void`

#### ModelUtils

**Methods**:

##### saveModel

**Signature**: `static saveModel(model: Layer, path: string): any`

##### loadModel

**Signature**: `static loadModel(state: any): any`

##### countParameters

**Signature**: `static countParameters(model: Layer): number`

##### printModelSummary

**Signature**: `static printModelSummary(model: Layer): void`

#### Trainer

**Properties**:

- `model: Layer` - 
- `optimizer: Optimizer` - 
- `lossFunction: (pred: Tensor, target: Tensor) => Tensor` - 

**Methods**:

##### train

**Signature**: `train(
    trainData:`

##### evaluate

**Signature**: `evaluate(testData:`

#### AIUtils

**Methods**:

##### cleanup

**Signature**: `static cleanup(): void`

##### getMemoryStats

**Signature**: `static getMemoryStats():`

##### optimizeMemory

**Signature**: `static optimizeMemory(): void`

### Interfaces

#### TensorShape

**Properties**:

- `dimensions: number[]` - 
- `size: number` - 
- `ndim: number` - 

#### GradientInfo

**Properties**:

- `requiresGrad: boolean` - 
- `grad: Tensor` - 
- `gradFn: Function` - 
- `retainGraph: boolean` - 


