# Genetic Algorithm Optimization Module

The OmniScript Genetic Algorithm module provides a comprehensive parameter optimization system using evolutionary algorithms. It supports both single and multi-objective optimization with various genetic operators and configuration options.

## Features

- **Population-based optimization** with configurable population sizes
- **Multiple selection strategies**: Tournament, Roulette wheel, Rank-based
- **Various crossover operators**: Uniform, Arithmetic, Blend (BLX-α)
- **Multiple mutation strategies**: Gaussian, Uniform, Polynomial
- **Parameter constraints and bounds** support (continuous, integer, discrete)
- **Multi-objective optimization** with Pareto dominance
- **Adaptive mutation rates** based on population diversity
- **Elitism** to preserve best solutions
- **Comprehensive logging** and convergence tracking
- **Custom constraint handling** with repair and penalty methods

## Basic Usage

```typescript
import { optimize } from 'stdlib/genetic';

// Simple function optimization
const result = optimize(
  (params: number[]) => -(params[0] - 5)**2, // Function to maximize
  {
    parameterCount: 1,
    populationSize: 30,
    maxGenerations: 50,
    bounds: [{ min: 0, max: 10, type: 'continuous' }]
  }
);

console.log(`Optimal parameter: ${result.bestParams[0]}`);
console.log(`Best fitness: ${result.bestFitness}`);
```

## Advanced Configuration

```typescript
import { GeneticOptimizer, ParameterBounds } from 'stdlib/genetic';

// Define parameter bounds
const bounds: ParameterBounds[] = [
  { min: 0.001, max: 0.1, type: 'continuous' },    // learning rate
  { min: 10, max: 200, type: 'integer' },          // hidden size
  { min: 16, max: 128, type: 'integer' }           // batch size
];

// Define constraints
const constraints = [
  (params: number[]) => params[0] > 0,              // positive learning rate
  (params: number[]) => params[1] % 2 === 0         // even hidden size
];

const optimizer = new GeneticOptimizer(fitnessFunction, {
  populationSize: 100,
  maxGenerations: 200,
  bounds,
  constraints,
  selectionStrategy: 'tournament',
  crossoverStrategy: 'arithmetic',
  mutationStrategy: 'gaussian',
  mutationRate: 0.1,
  crossoverRate: 0.8,
  elitismCount: 10,
  adaptiveMutation: true,
  verbose: true
});

const result = optimizer.optimize(3);
```

## Multi-objective Optimization

```typescript
// Optimize multiple conflicting objectives
const result = optimize(
  (params: number[]) => {
    const x = params[0];
    return [
      -(x - 1)**2,  // Objective 1: maximize at x = 1
      -(x - 5)**2   // Objective 2: maximize at x = 5
    ];
  },
  {
    parameterCount: 1,
    populationSize: 50,
    maxGenerations: 100,
    bounds: [{ min: 0, max: 6, type: 'continuous' }]
  }
);

console.log(`Pareto solution: ${result.bestParams[0]}`);
console.log(`Objective values: ${result.bestFitness}`);
```

## Parameter Types

### Continuous Parameters
```typescript
{ min: 0.0, max: 1.0, type: 'continuous' }
```

### Integer Parameters
```typescript
{ min: 1, max: 100, type: 'integer' }
```

### Discrete Parameters
```typescript
{ 
  min: 0, 
  max: 1, 
  type: 'discrete',
  discreteValues: [0.1, 0.3, 0.5, 0.7, 0.9]
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `populationSize` | number | 50 | Number of individuals in population |
| `maxGenerations` | number | 100 | Maximum number of generations |
| `mutationRate` | number | 0.1 | Probability of mutation |
| `crossoverRate` | number | 0.8 | Probability of crossover |
| `elitismCount` | number | 10% of population | Number of elite individuals to preserve |
| `targetFitness` | number | Infinity | Target fitness for early termination |
| `selectionStrategy` | string | 'tournament' | Selection method ('tournament', 'roulette', 'rank') |
| `crossoverStrategy` | string | 'uniform' | Crossover method ('uniform', 'arithmetic', 'blend') |
| `mutationStrategy` | string | 'gaussian' | Mutation method ('gaussian', 'uniform', 'polynomial') |
| `adaptiveMutation` | boolean | false | Enable adaptive mutation rates |
| `verbose` | boolean | false | Enable progress logging |

## Real-world Examples

### Hyperparameter Optimization
```typescript
const optimizeNeuralNetwork = (params: number[]) => {
  const [lr, hiddenSize, batchSize] = params;
  
  // Simulate training and return validation accuracy
  const model = trainModel({ lr, hiddenSize, batchSize });
  return model.accuracy;
};

const result = optimize(optimizeNeuralNetwork, {
  parameterCount: 3,
  bounds: [
    { min: 0.001, max: 0.1, type: 'continuous' },
    { min: 10, max: 500, type: 'integer' },
    { min: 16, max: 256, type: 'integer' }
  ],
  populationSize: 50,
  maxGenerations: 100
});
```

### Portfolio Optimization
```typescript
const optimizePortfolio = (weights: number[]) => {
  const returns = calculateReturns(weights);
  const risk = calculateRisk(weights);
  
  // Multi-objective: maximize returns, minimize risk
  return [returns, -risk];
};

const result = optimize(optimizePortfolio, {
  parameterCount: 10, // 10 assets
  bounds: Array(10).fill({ min: 0, max: 1, type: 'continuous' }),
  constraints: [
    (weights) => weights.reduce((sum, w) => sum + w, 0) === 1 // sum to 1
  ],
  populationSize: 100,
  maxGenerations: 200
});
```

## Results and Analysis

The optimization result includes:

```typescript
interface OptimizationResult {
  bestParams: number[];           // Best parameter values found
  bestFitness: number | number[]; // Best fitness value(s)
  generations: number;            // Number of generations run
  convergenceHistory: GenerationStats[]; // Evolution statistics
  finalPopulation: Individual[];  // Final population
  totalEvaluations: number;       // Total function evaluations
}
```

### Convergence Analysis
```typescript
// Analyze convergence
result.convergenceHistory.forEach((gen, i) => {
  console.log(`Gen ${i}: Best=${gen.bestFitness}, Avg=${gen.averageFitness}, Diversity=${gen.diversity}`);
});

// Plot convergence curve
const bestFitnesses = result.convergenceHistory.map(gen => gen.bestFitness);
plotConvergence(bestFitnesses);
```

## Best Practices

1. **Population Size**: Use 20-100 individuals depending on problem complexity
2. **Generations**: Start with 50-200 generations, increase for complex problems
3. **Mutation Rate**: Begin with 0.1-0.2, use adaptive mutation for dynamic adjustment
4. **Selection Pressure**: Tournament selection with size 3-7 works well for most problems
5. **Elitism**: Keep 5-15% of best individuals to ensure progress
6. **Bounds**: Always specify parameter bounds for better convergence
7. **Constraints**: Use repair methods when possible, penalties as fallback

## Performance Tips

- Use `verbose: false` for production runs
- Start with smaller populations for quick testing
- Enable `adaptiveMutation` for better exploration/exploitation balance
- Use appropriate parameter types (integer vs continuous) for efficiency
- Consider problem-specific crossover/mutation operators for specialized domains

## Integration with Existing Code

The genetic algorithm integrates seamlessly with other OmniScript modules:

```typescript
import { AI, Genetic, Math } from 'stdlib';

// Optimize neural network architecture
const optimizeArchitecture = (params: number[]) => {
  const [layers, neurons, dropout] = params;
  
  const model = new AI.Sequential([
    new AI.Linear(784, neurons),
    new AI.ReLU(),
    // ... build model based on params
  ]);
  
  const trainer = new AI.Trainer(model, new AI.Adam());
  const accuracy = trainer.evaluate(testData).accuracy;
  
  return accuracy;
};

const result = Genetic.optimize(optimizeArchitecture, {
  parameterCount: 3,
  bounds: [
    { min: 1, max: 5, type: 'integer' },      // layers
    { min: 32, max: 512, type: 'integer' },   // neurons
    { min: 0, max: 0.5, type: 'continuous' }  // dropout
  ]
});
```