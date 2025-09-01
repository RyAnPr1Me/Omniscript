/**
 * OmniScript Genetic Algorithm Module
 * 
 * Implements an automatic parameter optimization system using genetic algorithms.
 * Supports single and multi-objective optimization with various selection, crossover,
 * and mutation strategies.
 * 
 * Features:
 * - Population-based parameter optimization
 * - Configurable selection strategies
 * - Multiple crossover and mutation operators
 * - Parameter bounds and constraints
 * - Elitism support
 * - Generation logging and statistics
 * - Multi-objective optimization
 * - Adaptive mutation rates
 */

import { MathUtils } from './math';
import { debug } from '../debug';

// ================================
// TYPE DEFINITIONS
// ================================

export interface ParameterBounds {
  min: number;
  max: number;
  type?: 'continuous' | 'integer' | 'discrete';
  discreteValues?: number[];
}

export interface OptimizationOptions {
  populationSize?: number;
  maxGenerations?: number;
  mutationRate?: number;
  crossoverRate?: number;
  elitismCount?: number;
  targetFitness?: number;
  selectionStrategy?: 'roulette' | 'tournament' | 'rank';
  crossoverStrategy?: 'uniform' | 'arithmetic' | 'blend';
  mutationStrategy?: 'gaussian' | 'uniform' | 'polynomial';
  adaptiveMutation?: boolean;
  verbose?: boolean;
  bounds?: ParameterBounds[];
  constraints?: Array<(params: number[]) => boolean>;
}

export interface Individual {
  params: number[];
  fitness: number | number[]; // Single or multi-objective
  age: number;
  id: string;
}

export interface GenerationStats {
  generation: number;
  bestFitness: number | number[];
  averageFitness: number | number[];
  worstFitness: number | number[];
  diversity: number;
  mutationRate: number;
  convergenceMetric: number;
}

export interface OptimizationResult {
  bestParams: number[];
  bestFitness: number | number[];
  generations: number;
  convergenceHistory: GenerationStats[];
  finalPopulation: Individual[];
  totalEvaluations: number;
}

// ================================
// GENETIC ALGORITHM IMPLEMENTATION
// ================================

export class GeneticOptimizer {
  private options: Required<OptimizationOptions>;
  private population: Individual[];
  private generation: number = 0;
  private evaluationCount: number = 0;
  private convergenceHistory: GenerationStats[] = [];
  private bestIndividual: Individual | null = null;
  private fitnessFunction: (params: number[]) => number | number[];
  private isMultiObjective: boolean = false;

  constructor(
    fitnessFunction: (params: number[]) => number | number[],
    options: OptimizationOptions = {}
  ) {
    this.fitnessFunction = fitnessFunction;
    this.options = this.setDefaultOptions(options);
    this.population = [];
    
    // Determine if this is multi-objective optimization
    // We'll check this when we evaluate the first individual
    
    debug.info('Genetic', `Created genetic optimizer with population size: ${this.options.populationSize}`);
  }

  private setDefaultOptions(options: OptimizationOptions): Required<OptimizationOptions> {
    const populationSize = options.populationSize || 50;
    const defaultElitismCount = Math.max(1, Math.floor(populationSize * 0.1));
    
    return {
      populationSize,
      maxGenerations: options.maxGenerations || 100,
      mutationRate: options.mutationRate || 0.1,
      crossoverRate: options.crossoverRate || 0.8,
      elitismCount: options.elitismCount || defaultElitismCount,
      targetFitness: options.targetFitness || Infinity,
      selectionStrategy: options.selectionStrategy || 'tournament',
      crossoverStrategy: options.crossoverStrategy || 'uniform',
      mutationStrategy: options.mutationStrategy || 'gaussian',
      adaptiveMutation: options.adaptiveMutation || false,
      verbose: options.verbose || false,
      bounds: options.bounds || [],
      constraints: options.constraints || []
    };
  }

  /**
   * Main optimization function
   */
  optimize(parameterCount: number): OptimizationResult {
    debug.info('Genetic', 'Starting genetic optimization');
    debug.time('Genetic', 'optimization');

    // Initialize population
    this.initializePopulation(parameterCount);
    
    // Check if multi-objective after first evaluation
    this.checkMultiObjective();

    // Evolution loop
    for (this.generation = 0; this.generation < this.options.maxGenerations; this.generation++) {
      // Evaluate population fitness
      this.evaluatePopulation();
      
      // Update statistics
      this.updateStatistics();
      
      // Check termination conditions
      if (this.shouldTerminate()) {
        break;
      }
      
      // Create new generation
      this.evolveGeneration();
      
      // Adaptive mutation rate
      if (this.options.adaptiveMutation) {
        this.updateMutationRate();
      }
      
      // Log progress
      if (this.options.verbose && (this.generation + 1) % 10 === 0) {
        this.logProgress();
      }
    }

    debug.timeEnd('Genetic', 'optimization');
    debug.info('Genetic', `Optimization completed after ${this.generation + 1} generations`);

    return this.createResult();
  }

  /**
   * Initialize random population with parameter bounds
   */
  private initializePopulation(parameterCount: number): void {
    this.population = [];
    
    for (let i = 0; i < this.options.populationSize; i++) {
      const individual: Individual = {
        params: this.generateRandomParams(parameterCount),
        fitness: 0,
        age: 0,
        id: this.generateId()
      };
      
      // Apply constraints if any
      if (!this.satisfiesConstraints(individual.params)) {
        // Try a few times to generate valid parameters
        let attempts = 0;
        while (!this.satisfiesConstraints(individual.params) && attempts < 10) {
          individual.params = this.generateRandomParams(parameterCount);
          attempts++;
        }
      }
      
      this.population.push(individual);
    }
    
    debug.debug('Genetic', `Initialized population of ${this.population.length} individuals`);
  }

  /**
   * Generate random parameters within bounds
   */
  private generateRandomParams(parameterCount: number): number[] {
    const params: number[] = [];
    
    for (let i = 0; i < parameterCount; i++) {
      const bounds = this.options.bounds[i];
      
      if (bounds) {
        if (bounds.type === 'discrete' && bounds.discreteValues) {
          params.push(MathUtils.randomChoice(bounds.discreteValues));
        } else if (bounds.type === 'integer') {
          params.push(MathUtils.randomInt(bounds.min, bounds.max));
        } else {
          params.push(MathUtils.random(bounds.min, bounds.max));
        }
      } else {
        // Default bounds: [0, 1]
        params.push(MathUtils.random(0, 1));
      }
    }
    
    return params;
  }

  /**
   * Check if parameters satisfy all constraints
   */
  private satisfiesConstraints(params: number[]): boolean {
    return this.options.constraints.every(constraint => constraint(params));
  }

  /**
   * Determine if this is multi-objective optimization
   */
  private checkMultiObjective(): void {
    if (this.population.length === 0) return;
    
    const sampleFitness = this.evaluateIndividual(this.population[0]);
    this.isMultiObjective = Array.isArray(sampleFitness);
    
    debug.debug('Genetic', `Multi-objective optimization: ${this.isMultiObjective}`);
  }

  /**
   * Evaluate the fitness of an individual
   */
  private evaluateIndividual(individual: Individual): number | number[] {
    this.evaluationCount++;
    try {
      return this.fitnessFunction(individual.params);
    } catch (error) {
      debug.warn('Genetic', `Fitness evaluation failed for individual ${individual.id}: ${error}`);
      return this.isMultiObjective ? [Number.NEGATIVE_INFINITY] : Number.NEGATIVE_INFINITY;
    }
  }

  /**
   * Evaluate the entire population
   */
  private evaluatePopulation(): void {
    for (const individual of this.population) {
      individual.fitness = this.evaluateIndividual(individual);
      individual.age++;
    }
  }

  /**
   * Create new generation through selection, crossover, and mutation
   */
  private evolveGeneration(): void {
    const newPopulation: Individual[] = [];
    
    // Elitism: Keep best individuals
    const elite = this.selectElite();
    newPopulation.push(...elite);
    
    // Generate offspring to fill remaining population
    while (newPopulation.length < this.options.populationSize) {
      // Selection
      const parent1 = this.selectParent();
      const parent2 = this.selectParent();
      
      // Crossover
      let offspring: Individual[];
      if (MathUtils.random() < this.options.crossoverRate) {
        offspring = this.crossover(parent1, parent2);
      } else {
        offspring = [this.cloneIndividual(parent1), this.cloneIndividual(parent2)];
      }
      
      // Mutation
      for (const child of offspring) {
        if (MathUtils.random() < this.options.mutationRate) {
          this.mutate(child);
        }
        
        // Apply bounds and constraints
        this.enforceConstraints(child);
        
        // Reset age for new individuals
        child.age = 0;
        child.id = this.generateId();
      }
      
      newPopulation.push(...offspring);
    }
    
    // Trim to exact population size
    this.population = newPopulation.slice(0, this.options.populationSize);
  }

  /**
   * Select elite individuals for next generation
   */
  private selectElite(): Individual[] {
    const sorted = this.sortPopulation();
    return sorted.slice(0, this.options.elitismCount).map(ind => this.cloneIndividual(ind));
  }

  /**
   * Select a parent using the configured selection strategy
   */
  private selectParent(): Individual {
    switch (this.options.selectionStrategy) {
      case 'roulette':
        return this.rouletteSelection();
      case 'tournament':
        return this.tournamentSelection();
      case 'rank':
        return this.rankSelection();
      default:
        return this.tournamentSelection();
    }
  }

  /**
   * Fitness-proportionate (roulette wheel) selection
   */
  private rouletteSelection(): Individual {
    if (this.isMultiObjective) {
      // For multi-objective, use first objective for selection
      const fitnesses = this.population.map(ind => Array.isArray(ind.fitness) ? ind.fitness[0] : ind.fitness);
      const minFitness = Math.min(...fitnesses);
      const adjustedFitnesses = fitnesses.map(f => f - minFitness + 1);
      const totalFitness = adjustedFitnesses.reduce((sum, f) => sum + f, 0);
      
      if (totalFitness === 0) {
        return MathUtils.randomChoice(this.population);
      }
      
      const random = MathUtils.random(0, totalFitness);
      let accumulated = 0;
      
      for (let i = 0; i < this.population.length; i++) {
        accumulated += adjustedFitnesses[i];
        if (accumulated >= random) {
          return this.population[i];
        }
      }
    } else {
      const fitnesses = this.population.map(ind => ind.fitness as number);
      const minFitness = Math.min(...fitnesses);
      const adjustedFitnesses = fitnesses.map(f => f - minFitness + 1);
      const totalFitness = adjustedFitnesses.reduce((sum, f) => sum + f, 0);
      
      if (totalFitness === 0) {
        return MathUtils.randomChoice(this.population);
      }
      
      const random = MathUtils.random(0, totalFitness);
      let accumulated = 0;
      
      for (let i = 0; i < this.population.length; i++) {
        accumulated += adjustedFitnesses[i];
        if (accumulated >= random) {
          return this.population[i];
        }
      }
    }
    
    return this.population[this.population.length - 1];
  }

  /**
   * Tournament selection
   */
  private tournamentSelection(tournamentSize: number = 3): Individual {
    const tournament: Individual[] = [];
    
    for (let i = 0; i < Math.min(tournamentSize, this.population.length); i++) {
      tournament.push(MathUtils.randomChoice(this.population));
    }
    
    return this.getBestIndividual(tournament);
  }

  /**
   * Rank-based selection
   */
  private rankSelection(): Individual {
    const sorted = this.sortPopulation();
    const ranks = sorted.map((_, i) => i + 1);
    const totalRank = ranks.reduce((sum, rank) => sum + rank, 0);
    
    const random = MathUtils.random(0, totalRank);
    let accumulated = 0;
    
    for (let i = 0; i < sorted.length; i++) {
      accumulated += ranks[i];
      if (accumulated >= random) {
        return sorted[i];
      }
    }
    
    return sorted[sorted.length - 1];
  }

  /**
   * Crossover operation between two parents
   */
  private crossover(parent1: Individual, parent2: Individual): Individual[] {
    switch (this.options.crossoverStrategy) {
      case 'uniform':
        return this.uniformCrossover(parent1, parent2);
      case 'arithmetic':
        return this.arithmeticCrossover(parent1, parent2);
      case 'blend':
        return this.blendCrossover(parent1, parent2);
      default:
        return this.uniformCrossover(parent1, parent2);
    }
  }

  /**
   * Uniform crossover
   */
  private uniformCrossover(parent1: Individual, parent2: Individual): Individual[] {
    const child1Params: number[] = [];
    const child2Params: number[] = [];
    
    for (let i = 0; i < parent1.params.length; i++) {
      if (MathUtils.random() < 0.5) {
        child1Params.push(parent1.params[i]);
        child2Params.push(parent2.params[i]);
      } else {
        child1Params.push(parent2.params[i]);
        child2Params.push(parent1.params[i]);
      }
    }
    
    return [
      { params: child1Params, fitness: 0, age: 0, id: this.generateId() },
      { params: child2Params, fitness: 0, age: 0, id: this.generateId() }
    ];
  }

  /**
   * Arithmetic crossover (blending)
   */
  private arithmeticCrossover(parent1: Individual, parent2: Individual): Individual[] {
    const alpha = MathUtils.random(0, 1);
    const child1Params: number[] = [];
    const child2Params: number[] = [];
    
    for (let i = 0; i < parent1.params.length; i++) {
      child1Params.push(alpha * parent1.params[i] + (1 - alpha) * parent2.params[i]);
      child2Params.push((1 - alpha) * parent1.params[i] + alpha * parent2.params[i]);
    }
    
    return [
      { params: child1Params, fitness: 0, age: 0, id: this.generateId() },
      { params: child2Params, fitness: 0, age: 0, id: this.generateId() }
    ];
  }

  /**
   * Blend crossover (BLX-α)
   */
  private blendCrossover(parent1: Individual, parent2: Individual, alpha: number = 0.5): Individual[] {
    const child1Params: number[] = [];
    const child2Params: number[] = [];
    
    for (let i = 0; i < parent1.params.length; i++) {
      const min = Math.min(parent1.params[i], parent2.params[i]);
      const max = Math.max(parent1.params[i], parent2.params[i]);
      const range = max - min;
      
      const newMin = min - alpha * range;
      const newMax = max + alpha * range;
      
      child1Params.push(MathUtils.random(newMin, newMax));
      child2Params.push(MathUtils.random(newMin, newMax));
    }
    
    return [
      { params: child1Params, fitness: 0, age: 0, id: this.generateId() },
      { params: child2Params, fitness: 0, age: 0, id: this.generateId() }
    ];
  }

  /**
   * Mutation operation
   */
  private mutate(individual: Individual): void {
    switch (this.options.mutationStrategy) {
      case 'gaussian':
        this.gaussianMutation(individual);
        break;
      case 'uniform':
        this.uniformMutation(individual);
        break;
      case 'polynomial':
        this.polynomialMutation(individual);
        break;
      default:
        this.gaussianMutation(individual);
    }
  }

  /**
   * Gaussian mutation
   */
  private gaussianMutation(individual: Individual, strength: number = 0.1): void {
    for (let i = 0; i < individual.params.length; i++) {
      const bounds = this.options.bounds[i];
      const range = bounds ? (bounds.max - bounds.min) : 1;
      const sigma = strength * range;
      
      // Box-Muller transform for normal distribution
      const u1 = MathUtils.random();
      const u2 = MathUtils.random();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      
      individual.params[i] += z0 * sigma;
    }
  }

  /**
   * Uniform mutation
   */
  private uniformMutation(individual: Individual, strength: number = 0.1): void {
    for (let i = 0; i < individual.params.length; i++) {
      const bounds = this.options.bounds[i];
      const range = bounds ? (bounds.max - bounds.min) : 1;
      const delta = MathUtils.random(-strength * range, strength * range);
      
      individual.params[i] += delta;
    }
  }

  /**
   * Polynomial mutation
   */
  private polynomialMutation(individual: Individual, eta: number = 20): void {
    for (let i = 0; i < individual.params.length; i++) {
      const bounds = this.options.bounds[i];
      if (!bounds) continue;
      
      const y = individual.params[i];
      const yl = bounds.min;
      const yu = bounds.max;
      
      if (y <= yl || y >= yu) continue;
      
      const delta1 = (y - yl) / (yu - yl);
      const delta2 = (yu - y) / (yu - yl);
      
      const rnd = MathUtils.random();
      const mut_pow = 1.0 / (eta + 1.0);
      
      let deltaq: number;
      if (rnd <= 0.5) {
        const xy = 1.0 - delta1;
        const val = 2.0 * rnd + (1.0 - 2.0 * rnd) * Math.pow(xy, eta + 1.0);
        deltaq = Math.pow(val, mut_pow) - 1.0;
      } else {
        const xy = 1.0 - delta2;
        const val = 2.0 * (1.0 - rnd) + 2.0 * (rnd - 0.5) * Math.pow(xy, eta + 1.0);
        deltaq = 1.0 - Math.pow(val, mut_pow);
      }
      
      individual.params[i] = y + deltaq * (yu - yl);
    }
  }

  /**
   * Enforce parameter bounds and constraints
   */
  private enforceConstraints(individual: Individual): void {
    // Apply bounds
    for (let i = 0; i < individual.params.length; i++) {
      const bounds = this.options.bounds[i];
      if (bounds) {
        if (bounds.type === 'discrete' && bounds.discreteValues) {
          // Find closest discrete value
          const closest = bounds.discreteValues.reduce((prev, curr) => 
            Math.abs(curr - individual.params[i]) < Math.abs(prev - individual.params[i]) ? curr : prev
          );
          individual.params[i] = closest;
        } else if (bounds.type === 'integer') {
          individual.params[i] = Math.round(Math.max(bounds.min, Math.min(bounds.max, individual.params[i])));
        } else {
          individual.params[i] = Math.max(bounds.min, Math.min(bounds.max, individual.params[i]));
        }
      } else {
        // Apply default bounds [0, 1] if no bounds specified
        individual.params[i] = Math.max(0, Math.min(1, individual.params[i]));
      }
    }
    
    // Apply custom constraints (repair method - try to fix violations)
    if (!this.satisfiesConstraints(individual.params)) {
      // Try to repair constraint violations
      let attempts = 0;
      while (!this.satisfiesConstraints(individual.params) && attempts < 10) {
        // Small random perturbation to try to satisfy constraints
        for (let i = 0; i < individual.params.length; i++) {
          const bounds = this.options.bounds[i] || { min: 0, max: 1 };
          const range = bounds.max - bounds.min;
          const perturbation = MathUtils.random(-0.1 * range, 0.1 * range);
          individual.params[i] += perturbation;
          
          // Re-apply bounds
          if (bounds.type === 'integer') {
            individual.params[i] = Math.round(Math.max(bounds.min, Math.min(bounds.max, individual.params[i])));
          } else {
            individual.params[i] = Math.max(bounds.min, Math.min(bounds.max, individual.params[i]));
          }
        }
        attempts++;
      }
      
      // If still not satisfied, apply penalty
      if (!this.satisfiesConstraints(individual.params)) {
        if (Array.isArray(individual.fitness)) {
          individual.fitness = individual.fitness.map(f => f * 0.1);
        } else {
          individual.fitness = (individual.fitness as number) * 0.1;
        }
      }
    }
  }

  /**
   * Update statistics for current generation
   */
  private updateStatistics(): void {
    const fitnesses = this.population.map(ind => ind.fitness);
    
    let bestFitness: number | number[];
    let averageFitness: number | number[];
    let worstFitness: number | number[];
    
    if (this.isMultiObjective) {
      const objectives = (fitnesses[0] as number[]).length;
      bestFitness = new Array(objectives).fill(Number.NEGATIVE_INFINITY);
      averageFitness = new Array(objectives).fill(0);
      worstFitness = new Array(objectives).fill(Number.POSITIVE_INFINITY);
      
      for (const fitness of fitnesses as number[][]) {
        for (let i = 0; i < objectives; i++) {
          (bestFitness as number[])[i] = Math.max((bestFitness as number[])[i], fitness[i]);
          (averageFitness as number[])[i] += fitness[i];
          (worstFitness as number[])[i] = Math.min((worstFitness as number[])[i], fitness[i]);
        }
      }
      
      for (let i = 0; i < objectives; i++) {
        (averageFitness as number[])[i] /= this.population.length;
      }
    } else {
      const singleFitnesses = fitnesses as number[];
      bestFitness = Math.max(...singleFitnesses);
      averageFitness = singleFitnesses.reduce((sum, f) => sum + f, 0) / singleFitnesses.length;
      worstFitness = Math.min(...singleFitnesses);
    }
    
    // Calculate diversity (average pairwise distance)
    const diversity = this.calculateDiversity();
    
    // Calculate convergence metric
    const convergenceMetric = this.calculateConvergence();
    
    const stats: GenerationStats = {
      generation: this.generation,
      bestFitness,
      averageFitness,
      worstFitness,
      diversity,
      mutationRate: this.options.mutationRate,
      convergenceMetric
    };
    
    this.convergenceHistory.push(stats);
    
    // Update best individual
    const currentBest = this.getBestIndividual(this.population);
    if (!this.bestIndividual || this.isBetter(currentBest, this.bestIndividual)) {
      this.bestIndividual = this.cloneIndividual(currentBest);
    }
  }

  /**
   * Calculate population diversity
   */
  private calculateDiversity(): number {
    if (this.population.length < 2) return 0;
    
    let totalDistance = 0;
    let pairCount = 0;
    
    for (let i = 0; i < this.population.length; i++) {
      for (let j = i + 1; j < this.population.length; j++) {
        const distance = this.euclideanDistance(this.population[i].params, this.population[j].params);
        totalDistance += distance;
        pairCount++;
      }
    }
    
    return pairCount > 0 ? totalDistance / pairCount : 0;
  }

  /**
   * Calculate convergence metric
   */
  private calculateConvergence(): number {
    if (this.convergenceHistory.length < 2) return 1;
    
    const current = this.convergenceHistory[this.convergenceHistory.length - 1];
    const previous = this.convergenceHistory[this.convergenceHistory.length - 2];
    
    if (this.isMultiObjective) {
      const currentBest = current.bestFitness as number[];
      const previousBest = previous.bestFitness as number[];
      
      let improvement = 0;
      for (let i = 0; i < currentBest.length; i++) {
        improvement += Math.abs(currentBest[i] - previousBest[i]);
      }
      return improvement / currentBest.length;
    } else {
      return Math.abs((current.bestFitness as number) - (previous.bestFitness as number));
    }
  }

  /**
   * Update mutation rate based on population diversity (adaptive mutation)
   */
  private updateMutationRate(): void {
    const diversity = this.convergenceHistory[this.convergenceHistory.length - 1].diversity;
    const avgDiversity = this.convergenceHistory.length > 10 
      ? this.convergenceHistory.slice(-10).reduce((sum, s) => sum + s.diversity, 0) / 10
      : diversity;
    
    if (diversity < avgDiversity * 0.5) {
      // Low diversity, increase mutation
      this.options.mutationRate = Math.min(0.5, this.options.mutationRate * 1.1);
    } else if (diversity > avgDiversity * 1.5) {
      // High diversity, decrease mutation
      this.options.mutationRate = Math.max(0.01, this.options.mutationRate * 0.9);
    }
  }

  /**
   * Check termination conditions
   */
  private shouldTerminate(): boolean {
    if (this.generation >= this.options.maxGenerations - 1) {
      return true;
    }
    
    if (this.bestIndividual) {
      if (this.isMultiObjective) {
        // For multi-objective, check if any objective reached target
        const fitness = this.bestIndividual.fitness as number[];
        return fitness.some(f => f >= this.options.targetFitness);
      } else {
        return (this.bestIndividual.fitness as number) >= this.options.targetFitness;
      }
    }
    
    return false;
  }

  /**
   * Sort population by fitness (descending)
   */
  private sortPopulation(): Individual[] {
    return [...this.population].sort((a, b) => {
      if (this.isMultiObjective) {
        // Use dominant sorting for multi-objective
        return this.dominates(b, a) ? 1 : -1;
      } else {
        return (b.fitness as number) - (a.fitness as number);
      }
    });
  }

  /**
   * Check if individual a dominates individual b (for multi-objective)
   */
  private dominates(a: Individual, b: Individual): boolean {
    if (!this.isMultiObjective) {
      return (a.fitness as number) > (b.fitness as number);
    }
    
    const aFit = a.fitness as number[];
    const bFit = b.fitness as number[];
    
    let aBetter = false;
    for (let i = 0; i < aFit.length; i++) {
      if (aFit[i] < bFit[i]) return false;
      if (aFit[i] > bFit[i]) aBetter = true;
    }
    
    return aBetter;
  }

  /**
   * Get the best individual from a collection
   */
  private getBestIndividual(individuals: Individual[]): Individual {
    if (individuals.length === 0) {
      throw new Error('Cannot get best individual from empty collection');
    }
    
    if (this.isMultiObjective) {
      // For multi-objective, use Pareto front or sum of objectives
      return individuals.reduce((best, current) => {
        const bestSum = (best.fitness as number[]).reduce((sum, f) => sum + f, 0);
        const currentSum = (current.fitness as number[]).reduce((sum, f) => sum + f, 0);
        return currentSum > bestSum ? current : best;
      });
    } else {
      return individuals.reduce((best, current) => 
        (current.fitness as number) > (best.fitness as number) ? current : best
      );
    }
  }

  /**
   * Check if individual a is better than individual b
   */
  private isBetter(a: Individual, b: Individual): boolean {
    if (this.isMultiObjective) {
      return this.dominates(a, b);
    } else {
      return (a.fitness as number) > (b.fitness as number);
    }
  }

  /**
   * Clone an individual
   */
  private cloneIndividual(individual: Individual): Individual {
    return {
      params: [...individual.params],
      fitness: Array.isArray(individual.fitness) ? [...individual.fitness] : individual.fitness,
      age: individual.age,
      id: individual.id
    };
  }

  /**
   * Calculate Euclidean distance between two parameter vectors
   */
  private euclideanDistance(params1: number[], params2: number[]): number {
    let sumSquares = 0;
    for (let i = 0; i < params1.length; i++) {
      sumSquares += Math.pow(params1[i] - params2[i], 2);
    }
    return Math.sqrt(sumSquares);
  }

  /**
   * Generate unique identifier for individuals
   */
  private generateId(): string {
    return `ind_${this.generation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log optimization progress
   */
  private logProgress(): void {
    const stats = this.convergenceHistory[this.convergenceHistory.length - 1];
    
    if (this.isMultiObjective) {
      const bestFit = stats.bestFitness as number[];
      const avgFit = stats.averageFitness as number[];
      console.log(
        `Generation ${this.generation + 1}: ` +
        `Best: [${bestFit.map(f => f.toFixed(4)).join(', ')}], ` +
        `Avg: [${avgFit.map(f => f.toFixed(4)).join(', ')}], ` +
        `Diversity: ${stats.diversity.toFixed(4)}`
      );
    } else {
      console.log(
        `Generation ${this.generation + 1}: ` +
        `Best: ${(stats.bestFitness as number).toFixed(6)}, ` +
        `Avg: ${(stats.averageFitness as number).toFixed(6)}, ` +
        `Diversity: ${stats.diversity.toFixed(4)}`
      );
    }
  }

  /**
   * Create optimization result
   */
  private createResult(): OptimizationResult {
    if (!this.bestIndividual) {
      throw new Error('No best individual found');
    }
    
    return {
      bestParams: [...this.bestIndividual.params],
      bestFitness: Array.isArray(this.bestIndividual.fitness) 
        ? [...this.bestIndividual.fitness] 
        : this.bestIndividual.fitness,
      generations: this.generation + 1,
      convergenceHistory: [...this.convergenceHistory],
      finalPopulation: this.population.map(ind => this.cloneIndividual(ind)),
      totalEvaluations: this.evaluationCount
    };
  }
}

// ================================
// CONVENIENCE FUNCTION
// ================================

/**
 * Main optimization function for easy use
 */
export function optimize(
  fn: (params: number[]) => number | number[],
  options: OptimizationOptions & { parameterCount: number }
): OptimizationResult {
  const optimizer = new GeneticOptimizer(fn, options);
  return optimizer.optimize(options.parameterCount);
}

// ================================
// EXPORTS
// ================================

export const Genetic = {
  GeneticOptimizer,
  optimize
};

export default Genetic;