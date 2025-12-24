# DomainTransaction - Transaction Management System

## Overview

The `DomainTransaction` system provides transparent transaction management for Knex database operations without requiring explicit transaction parameters in your function signatures. It uses Node.js's `AsyncLocalStorage` to maintain transaction context across asynchronous operations.

## Features

- **Transparent Transaction Management**: Repository functions automatically use the active transaction when available
- **No Parameter Passing**: No need to add transaction parameters to function signatures
- **Nested Transaction Support**: Automatically reuses the same transaction in nested calls
- **Backward Compatible**: Works seamlessly with existing code that doesn't use transactions
- **Automatic Rollback**: Transactions are automatically rolled back on errors

## Usage

### Basic Usage in Repositories

In your repository files, replace direct `knex` imports with `DomainTransaction.getConnection()`:

```javascript
import { DomainTransaction } from "../../shared/infrastructure/DomainTransaction.js";

async function createUser(userData) {
  const knex = DomainTransaction.getConnection();
  const [user] = await knex("users")
    .insert(userData)
    .returning("*");
  return user;
}

async function findUserById(userId) {
  const knex = DomainTransaction.getConnection();
  return await knex("users").where({ id: userId }).first();
}
```

### Using Transactions in Use Cases

#### Method 1: Using `DomainTransaction.execute()`

```javascript
import { DomainTransaction } from "../shared/infrastructure/DomainTransaction.js";
import * as userRepository from "../repositories/user-repository.js";

async function registerAndActivateUser(userData) {
  return DomainTransaction.execute(async () => {
    const userId = await userRepository.createUser(userData);
    await userRepository.activateUser(userId);
    return userId;
  });
}
```

#### Method 2: Using `withTransaction()` Wrapper

```javascript
import { withTransaction } from "../shared/infrastructure/DomainTransaction.js";
import * as userRepository from "../repositories/user-repository.js";

const registerAndActivateUser = withTransaction(async (userData) => {
  const userId = await userRepository.createUser(userData);
  await userRepository.activateUser(userId);
  return userId;
});
```

### Nested Transactions

Nested transaction calls automatically reuse the parent transaction:

```javascript
import { DomainTransaction } from "../shared/infrastructure/DomainTransaction.js";

async function createUserWithProfile(userData, profileData) {
  return DomainTransaction.execute(async () => {
    // This uses the outer transaction
    const userId = await createUser(userData);
    
    // This also uses the same transaction (nested call)
    await DomainTransaction.execute(async () => {
      await createProfile({ ...profileData, userId });
    });
    
    return userId;
  });
}
```

### Error Handling and Rollback

Transactions automatically rollback on errors:

```javascript
try {
  await DomainTransaction.execute(async () => {
    await userRepository.createUser(userData);
    await userRepository.sendWelcomeEmail(userData.email);
    throw new Error("Something went wrong");
    // The user creation will be rolled back
  });
} catch (error) {
  console.error("Transaction failed:", error);
}
```

### Working Without Transactions

Repository functions work normally when called outside a transaction context:

```javascript
// This works without explicit transaction
const user = await userRepository.createUser(userData);

// This also works and uses a transaction
await DomainTransaction.execute(async () => {
  const user = await userRepository.createUser(userData);
});
```

## Implementation Details

### How It Works

1. `DomainTransaction.getConnection()` checks if there's an active transaction in the current async context
2. If a transaction exists, it returns the transaction connection
3. If no transaction exists, it returns the standard Knex connection
4. This allows repository functions to work transparently with or without transactions

### AsyncLocalStorage

The system uses Node.js's `AsyncLocalStorage` to maintain transaction context across asynchronous operations. This ensures that:
- Each async operation chain maintains its own transaction context
- Nested function calls automatically use the parent's transaction
- No explicit parameter passing is required

## Benefits

1. **Clean Code**: No need to pass transaction parameters through multiple layers
2. **Flexible**: Works with or without transactions
3. **Safe**: Automatic rollback on errors
4. **Composable**: Easy to combine multiple operations in a transaction
5. **Type-Safe**: TypeScript support with proper typing

## Migration Guide

To migrate existing repositories:

1. Replace direct `knex` import:
   ```javascript
   // Before
   import { knex } from "../../../db/knex-database-connection.js";
   
   // After
   import { DomainTransaction } from "../../shared/infrastructure/DomainTransaction.js";
   ```

2. Replace `knex` with `DomainTransaction.getConnection()` in functions:
   ```javascript
   // Before
   async function findUser(id) {
     return await knex("users").where({ id }).first();
   }
   
   // After
   async function findUser(id) {
     const knex = DomainTransaction.getConnection();
     return await knex("users").where({ id }).first();
   }
   ```

3. Wrap operations that need transactions:
   ```javascript
   // Use DomainTransaction.execute() in use cases
   await DomainTransaction.execute(async () => {
     await repository.operation1();
     await repository.operation2();
   });
   ```


## References

This implementation is inspired by the [Pix](https://github.com/1024pix/pix) project's transaction management system.
