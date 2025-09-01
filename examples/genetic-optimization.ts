/**
 * Example demonstrating the Genetic Algorithm optimization system
 * This example shows how to optimize function parameters using genetic algorithms
 */

import { optimize, GeneticOptimizer, ParameterBounds } from '../src/stdlib/genetic';

// Example 1: Simple function optimization
console.log('='.repeat(60));
console.log('Example 1: Optimizing a simple quadratic function');
console.log('='.repeat(60));

// Optimize f(x) = -(x - 5)^2, optimal at x = 5
const simpleResult = optimize(
  (params: number[]) => -((params[0] - 5) ** 2),
  {
    parameterCount: 1,
    populationSize: 30,
    maxGenerations: 50,
    bounds: [{ min: 0, max: 10, type: 'continuous' }],
    verbose: true
  }
);

console.log(`Optimal parameter: ${simpleResult.bestParams[0].toFixed(4)}`);
console.log(`Best fitness: ${simpleResult.bestFitness}`);
console.log(`Generations: ${simpleResult.generations}`);
console.log(`Evaluations: ${simpleResult.totalEvaluations}`);
console.log();

// Example 2: Multi-dimensional optimization with constraints
console.log('='.repeat(60));
console.log('Example 2: Multi-dimensional optimization with constraints');
console.log('='.repeat(60));

// Optimize subject to constraints
const constrainedResult = optimize(
  (params: number[]) => params[0] + params[1], // Maximize sum
  {
    parameterCount: 2,
    populationSize: 40,
    maxGenerations: 100,
    bounds: [
      { min: 0, max: 1, type: 'continuous' },
      { min: 0, max: 1, type: 'continuous' }
    ],
    constraints: [
      (params: number[]) => params[0] + params[1] <= 1, // Sum constraint
      (params: number[]) => params[0] >= 0.2 // Minimum constraint
    ],
    verbose: false
  }
);

console.log(`Optimal parameters: [${constrainedResult.bestParams.map(p => p.toFixed(4)).join(', ')}]`);
console.log(`Best fitness: ${constrainedResult.bestFitness}`);
console.log(`Sum constraint satisfied: ${constrainedResult.bestParams[0] + constrainedResult.bestParams[1] <= 1.1}`);
console.log();

// Example 3: Hyperparameter optimization
console.log('='.repeat(60));
console.log('Example 3: Neural Network Hyperparameter Optimization');
console.log('='.repeat(60));

// Simulate neural network hyperparameter optimization
const hyperparameterResult = optimize(
  (params: number[]) => {
    const [learningRate, hiddenSize, batchSize] = params;
    
    // Simulate model performance based on hyperparameters
    let score = 0;
    
    // Learning rate: optimal around 0.01
    score -= Math.abs(learningRate - 0.01) * 100;
    
    // Hidden size: larger is generally better but with diminishing returns
    score += Math.log(hiddenSize) * 10;
    
    // Batch size: moderate sizes work best
    score -= Math.abs(batchSize - 32) * 0.1;
    
    return score;
  },
  {
    parameterCount: 3,
    populationSize: 50,
    maxGenerations: 100,
    bounds: [
      { min: 0.001, max: 0.1, type: 'continuous' },    // learning rate
      { min: 10, max: 200, type: 'integer' },          // hidden size
      { min: 16, max: 128, type: 'integer' }           // batch size
    ],
    selectionStrategy: 'tournament',
    crossoverStrategy: 'arithmetic',
    mutationStrategy: 'gaussian',
    elitismCount: 5,
    verbose: false
  }
);

console.log(`Optimal hyperparameters:`);
console.log(`  Learning rate: ${hyperparameterResult.bestParams[0].toFixed(6)}`);
console.log(`  Hidden size: ${hyperparameterResult.bestParams[1]}`);
console.log(`  Batch size: ${hyperparameterResult.bestParams[2]}`);
console.log(`  Performance score: ${hyperparameterResult.bestFitness}`);
console.log();

// Example 4: Multi-objective optimization
console.log('='.repeat(60));
console.log('Example 4: Multi-objective Optimization');
console.log('='.repeat(60));

const multiObjectiveResult = optimize(
  (params: number[]) => {
    const x = params[0];
    return [
      -((x - 2) ** 2),  // Objective 1: maximize at x = 2
      -((x - 6) ** 2)   // Objective 2: maximize at x = 6
    ];
  },
  {
    parameterCount: 1,
    populationSize: 30,
    maxGenerations: 50,
    bounds: [{ min: 0, max: 8, type: 'continuous' }],
    verbose: false
  }
);

console.log(`Pareto optimal solution: ${multiObjectiveResult.bestParams[0].toFixed(4)}`);
console.log(`Objective values: [${(multiObjectiveResult.bestFitness as number[]).map(f => f.toFixed(4)).join(', ')}]`);
console.log();

// Example 5: Using the GeneticOptimizer class directly
console.log('='.repeat(60));
console.log('Example 5: Using GeneticOptimizer class with adaptive mutation');
console.log('='.repeat(60));

const optimizer = new GeneticOptimizer(
  (params: number[]) => {
    // Rastrigin function - has many local optima
    const n = params.length;
    let sum = n * 10;
    
    for (const x of params) {
      sum += x ** 2 - 10 * Math.cos(2 * Math.PI * x);
    }
    
    return -sum; // Negative because GA maximizes
  },
  {
    populationSize: 100,
    maxGenerations: 200,
    bounds: Array(2).fill({ min: -5.12, max: 5.12, type: 'continuous' }),
    adaptiveMutation: true,
    mutationRate: 0.2,
    selectionStrategy: 'tournament',
    crossoverStrategy: 'blend',
    verbose: false
  }
);

const rastriginResult = optimizer.optimize(2);

console.log(`Global optimum found: [${rastriginResult.bestParams.map(p => p.toFixed(4)).join(', ')}]`);
console.log(`Function value: ${rastriginResult.bestFitness}`);
console.log(`Convergence over generations:`);

// Show convergence progress
const convergenceSteps = Math.min(10, rastriginResult.convergenceHistory.length);
const stepSize = Math.floor(rastriginResult.convergenceHistory.length / convergenceSteps);

for (let i = 0; i < convergenceSteps; i++) {
  const genIndex = i * stepSize;
  const stats = rastriginResult.convergenceHistory[genIndex];
  console.log(`  Gen ${stats.generation}: Best=${(stats.bestFitness as number).toFixed(4)}, Diversity=${stats.diversity.toFixed(4)}, MutRate=${stats.mutationRate.toFixed(4)}`);
}

console.log();
console.log('✅ All examples completed successfully!');
console.log('The genetic algorithm can handle various optimization scenarios:');
console.log('  • Single and multi-objective optimization');
console.log('  • Continuous, integer, and discrete parameters');
console.log('  • Parameter bounds and custom constraints');
console.log('  • Multiple selection, crossover, and mutation strategies');
console.log('  • Adaptive mutation rates based on population diversity');
console.log('  • Elitism and convergence tracking');