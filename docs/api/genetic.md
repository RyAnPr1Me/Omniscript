# API Documentation

Auto-generated API documentation for Omniscript.

## Table of Contents

- [genetic](#genetic)

## genetic

**File**: `src/stdlib/genetic.ts`

### Classes

#### GeneticOptimizer

**Properties**:

- `options: Required<OptimizationOptions>` - 
- `population: Individual[]` - 
- `generation: number` - 
- `evaluationCount: number` - 
- `convergenceHistory: GenerationStats[]` - 
- `bestIndividual: Individual | null` - 
- `fitnessFunction: (params: number[]) => number | number[]` - 
- `isMultiObjective: boolean` - 

**Methods**:

##### setDefaultOptions

**Signature**: `private setDefaultOptions(options: OptimizationOptions): Required<OptimizationOptions>`

##### optimize

Main optimization function

**Signature**: `optimize(parameterCount: number): OptimizationResult`

##### initializePopulation

Initialize random population with parameter bounds

**Signature**: `private initializePopulation(parameterCount: number): void`

##### generateRandomParams

Generate random parameters within bounds

**Signature**: `private generateRandomParams(parameterCount: number): number[]`

##### satisfiesConstraints

Check if parameters satisfy all constraints

**Signature**: `private satisfiesConstraints(params: number[]): boolean`

##### checkMultiObjective

Determine if this is multi-objective optimization

**Signature**: `private checkMultiObjective(): void`

##### evaluateIndividual

Evaluate the fitness of an individual

**Signature**: `private evaluateIndividual(individual: Individual): number | number[]`

##### evaluatePopulation

Evaluate the entire population

**Signature**: `private evaluatePopulation(): void`

##### evolveGeneration

Create new generation through selection, crossover, and mutation

**Signature**: `private evolveGeneration(): void`

##### selectElite

Select elite individuals for next generation

**Signature**: `private selectElite(): Individual[]`

##### selectParent

Select a parent using the configured selection strategy

**Signature**: `private selectParent(): Individual`

##### rouletteSelection

Fitness-proportionate (roulette wheel) selection

**Signature**: `private rouletteSelection(): Individual`

##### tournamentSelection

Tournament selection

**Signature**: `private tournamentSelection(tournamentSize: number = 3): Individual`

##### rankSelection

Rank-based selection

**Signature**: `private rankSelection(): Individual`

##### crossover

Crossover operation between two parents

**Signature**: `private crossover(parent1: Individual, parent2: Individual): Individual[]`

##### uniformCrossover

Uniform crossover

**Signature**: `private uniformCrossover(parent1: Individual, parent2: Individual): Individual[]`

##### arithmeticCrossover

Arithmetic crossover (blending)

**Signature**: `private arithmeticCrossover(parent1: Individual, parent2: Individual): Individual[]`

##### blendCrossover

Blend crossover (BLX-α)

**Signature**: `private blendCrossover(parent1: Individual, parent2: Individual, alpha: number = 0.5): Individual[]`

##### mutate

Mutation operation

**Signature**: `private mutate(individual: Individual): void`

##### gaussianMutation

Gaussian mutation

**Signature**: `private gaussianMutation(individual: Individual, strength: number = 0.1): void`

##### uniformMutation

Uniform mutation

**Signature**: `private uniformMutation(individual: Individual, strength: number = 0.1): void`

##### polynomialMutation

Polynomial mutation

**Signature**: `private polynomialMutation(individual: Individual, eta: number = 20): void`

##### enforceConstraints

Enforce parameter bounds and constraints

**Signature**: `private enforceConstraints(individual: Individual): void`

##### updateStatistics

Update statistics for current generation

**Signature**: `private updateStatistics(): void`

##### calculateDiversity

Calculate population diversity

**Signature**: `private calculateDiversity(): number`

##### calculateConvergence

Calculate convergence metric

**Signature**: `private calculateConvergence(): number`

##### updateMutationRate

Update mutation rate based on population diversity (adaptive mutation)

**Signature**: `private updateMutationRate(): void`

##### shouldTerminate

Check termination conditions

**Signature**: `private shouldTerminate(): boolean`

##### sortPopulation

Sort population by fitness (descending)

**Signature**: `private sortPopulation(): Individual[]`

##### dominates

Check if individual a dominates individual b (for multi-objective)

**Signature**: `private dominates(a: Individual, b: Individual): boolean`

##### getBestIndividual

Get the best individual from a collection

**Signature**: `private getBestIndividual(individuals: Individual[]): Individual`

##### isBetter

Check if individual a is better than individual b

**Signature**: `private isBetter(a: Individual, b: Individual): boolean`

##### cloneIndividual

Clone an individual

**Signature**: `private cloneIndividual(individual: Individual): Individual`

##### euclideanDistance

Calculate Euclidean distance between two parameter vectors

**Signature**: `private euclideanDistance(params1: number[], params2: number[]): number`

##### generateId

Generate unique identifier for individuals

**Signature**: `private generateId(): string`

##### logProgress

Log optimization progress

**Signature**: `private logProgress(): void`

##### createResult

Create optimization result

**Signature**: `private createResult(): OptimizationResult`

### Interfaces

#### ParameterBounds

**Properties**:

- `min: number` - 
- `max: number` - 
- `type: 'continuous' | 'integer' | 'discrete'` - 
- `discreteValues: number[]` - 

#### OptimizationOptions

**Properties**:

- `populationSize: number` - 
- `maxGenerations: number` - 
- `mutationRate: number` - 
- `crossoverRate: number` - 
- `elitismCount: number` - 
- `targetFitness: number` - 
- `selectionStrategy: 'roulette' | 'tournament' | 'rank'` - 
- `crossoverStrategy: 'uniform' | 'arithmetic' | 'blend'` - 
- `mutationStrategy: 'gaussian' | 'uniform' | 'polynomial'` - 
- `adaptiveMutation: boolean` - 
- `verbose: boolean` - 
- `bounds: ParameterBounds[]` - 
- `constraints: Array<(params: number[]) => boolean>` - 

#### Individual

**Properties**:

- `params: number[]` - 
- `fitness: number | number[]` - 
- `age: number` - 
- `id: string` - 

#### GenerationStats

**Properties**:

- `generation: number` - 
- `bestFitness: number | number[]` - 
- `averageFitness: number | number[]` - 
- `worstFitness: number | number[]` - 
- `diversity: number` - 
- `mutationRate: number` - 
- `convergenceMetric: number` - 

#### OptimizationResult

**Properties**:

- `bestParams: number[]` - 
- `bestFitness: number | number[]` - 
- `generations: number` - 
- `convergenceHistory: GenerationStats[]` - 
- `finalPopulation: Individual[]` - 
- `totalEvaluations: number` - 

### Functions

#### optimize

Main optimization function for easy use

**Signature**: `export function optimize(
  fn: (params: number[]) => number | number[],
  options: OptimizationOptions &`


