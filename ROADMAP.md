# Omniscript Feature Parity Roadmap

This document enumerates tasks required to reach 100% of the public README feature claims.

## 1. Core Language
- [ ] Full parser (statements, blocks, modules, imports/exports)
- [ ] Type system (inference, generics, variance checks)
- [ ] Pattern matching with exhaustive checking & guards
- [ ] Decorators (class/method/property) execution semantics
- [ ] Operator overloading (dispatch table, precedence integration)
- [ ] Async/await lowering and scheduler integration
- [ ] Macro / compile-time evaluation (if planned)

## 2. Runtime
- [ ] Bytecode VM or JIT baseline
- [ ] Optimizations: inlining, constant folding, dead code elim
- [ ] SIMD & parallel primitives (thread pool abstraction)
- [ ] GC (generational or reference counting + cycle detection)
- [ ] Module loader & caching

## 3. Standard Library
- [ ] Collections (List/Map/Set + algorithms)
- [ ] Reactive system (signals, effects, computed)
- [ ] Networking (HTTP server/client, WebSocket)
- [ ] Crypto (hash, HMAC, symmetric/asymmetric)
- [ ] DateTime utilities
- [ ] Math (linear algebra, statistics)
- [ ] Threading / actors / channels
- [ ] Database ORM (schema, migrations, query builder, relations)

## 4. Tooling / CLI
- [ ] omni new (project scaffolding)
- [ ] omni dev (watch + incremental compile)
- [ ] omni build (binary / bundle)
- [ ] omni test (wrapper around jest)
- [ ] omni add / install / enable (package manager + stdlib modules)
- [ ] REPL with multiline editing & history persistence

## 5. Package Manager
- [ ] Manifest format (omni.json enhancement)
- [ ] Dependency resolution (version ranges, lockfile)
- [ ] Remote registry client
- [ ] Stdlib feature flags enable/disable

## 6. Decorators & Metadata
- [ ] Metadata storage (reflect API)
- [ ] Lifecycle hooks (@component, @state, @effect, @computed)
- [ ] Validation & transformation pipeline

## 7. Frontend/Full-Stack Model
- [ ] Virtual DOM or reactive DOM binding
- [ ] Server/client boundary & data sync
- [ ] SSR pipeline

## 8. ORM
- [ ] Model definition decorators (@id, @field, @relation, @timestamp)
- [ ] Query builder AST & translator (SQL initial target)
- [ ] Migrations
- [ ] Connection pooling & transactions

## 9. Testing & Quality
- [ ] Comprehensive unit tests for parser, type checker, runtime
- [ ] Conformance test suite for stdlib
- [ ] Performance benchmarks
- [ ] Fuzzing for parser/runtime safety

## 10. Documentation Alignment
- [ ] README status badge & feature matrix
- [ ] Versioned docs site
- [ ] API reference generator

## 11. Distribution
- [ ] Prebuilt binaries for major platforms
- [ ] Installer script (interactive)
- [ ] Version management (semver tagging, changelog)

## 12. Security / Stability
- [ ] Sandboxed execution mode
- [ ] Resource limits (CPU, memory, IO)
- [ ] Audit logging hooks

---
Prioritize: Parser completion -> Type system -> Runtime optimization -> ORM & decorators -> Networking/reactive -> Package manager.
