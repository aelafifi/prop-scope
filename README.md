# prop-scope

A lightweight TypeScript library for temporarily overwriting object properties during callback execution with automatic restoration.

## 🚀 Features

- **Safe Property Overwriting**: Temporarily modify object properties with automatic restoration
- **Error-Safe**: Properties are restored even if the callback throws an error
- **Conditional Overwriting**: Use the `IGNORE` symbol to conditionally skip property overwrites
- **Type-Safe**: Full TypeScript support with proper type inference
- **Zero Dependencies**: Lightweight with no external dependencies

## 📦 Installation

```bash
npm install prop-scope
```

## 🔧 Basic Usage

### Simple Property Overwriting

```typescript
import { withProps } from 'prop-scope';

const config = { debug: false, timeout: 5000 };

withProps(config, { debug: true, timeout: 10000 }, (originalValues) => {
    console.log(config); // { debug: true, timeout: 10000 }
    console.log(originalValues); // { debug: false, timeout: 5000 }
    
    // Do something with the modified config
    performDebugOperation();
});

console.log(config); // { debug: false, timeout: 5000 } - restored!
```

### Error-Safe Restoration

Properties are automatically restored even when errors occur:

```typescript
import { withProps } from 'prop-scope';

const obj = { a: 1, b: 2 };

try {
    withProps(obj, { a: 10, b: 20 }, (originalValues) => {
        console.log(obj); // { a: 10, b: 20 }
        throw new Error("Something went wrong!");
    });
} catch (error) {
    console.log(error.message); // "Something went wrong!"
    console.log(obj); // { a: 1, b: 2 } - still restored!
}
```

## 🎯 Advanced Usage

### Conditional Overwriting with `IGNORE`

Use the `IGNORE` symbol to conditionally skip property overwrites:

```typescript
import { withProps, IGNORE } from 'prop-scope';

const settings = { theme: 'dark', fontSize: 14, animations: true };

withProps(
    settings,
    {
        theme: 'light',
        fontSize: settings.fontSize > 16 ? 12 : IGNORE, // Only override if > 16
        animations: false
    },
    (originalValues) => {
        console.log(settings); // { theme: 'light', fontSize: 14, animations: false }
        console.log(originalValues); // { theme: 'dark', animations: true }
        // Note: fontSize is not in originalValues since it wasn't overwritten
    }
);

console.log(settings); // { theme: 'dark', fontSize: 14, animations: true }
```

### Testing Configuration Scenarios

Perfect for testing different configurations:

```typescript
import { withProps } from 'prop-scope';

const apiConfig = {
    baseUrl: 'https://api.prod.com',
    timeout: 5000,
    retries: 3
};

// Test with different environments
const testConfigs = [
    { baseUrl: 'https://api.staging.com', timeout: 10000 },
    { baseUrl: 'https://api.dev.com', timeout: 2000, retries: 1 }
];

testConfigs.forEach((testConfig, index) => {
    withProps(apiConfig, testConfig, () => {
        console.log(`Testing config ${index + 1}:`, apiConfig);
        // Run your tests here
        runApiTests();
    });
    // apiConfig is automatically restored after each test
});
```

### Mocking Object Methods

Temporarily replace methods for testing:

```typescript
import { withProps } from 'prop-scope';

const logger = {
    log: (msg: string) => console.log(`[LOG] ${msg}`),
    error: (msg: string) => console.error(`[ERROR] ${msg}`)
};

const mockLogs: string[] = [];

withProps(
    logger,
    {
        log: (msg: string) => mockLogs.push(`LOG: ${msg}`),
        error: (msg: string) => mockLogs.push(`ERROR: ${msg}`)
    },
    () => {
        logger.log('Test message');
        logger.error('Test error');
        
        console.log(mockLogs); // ['LOG: Test message', 'ERROR: Test error']
    }
);

// Original logger methods are restored
logger.log('Back to normal'); // Prints: [LOG] Back to normal
```

## 📚 API Reference

### `withProps<T>(source, overwrites, callback)`

Temporarily overwrites properties on a source object while executing a callback.

#### Parameters

- **`source`** (`T extends object`): The object whose properties will be temporarily overwritten
- **`overwrites`** (`Partial<{ [K in keyof T]: T[K] | typeof IGNORE }>`): Object containing properties and values to overwrite
- **`callback`** (`(originalValues: Partial<T>) => void`): Function to execute with the overwritten properties. Receives the original values as an argument

#### Returns

`void`

### `IGNORE`

A sentinel symbol used to skip overwriting a property. Unlike `null` or `undefined`, which are treated as actual values, `IGNORE` tells `withProps` to leave that property unchanged.

```typescript
const IGNORE: unique symbol
```

## ⚠️ Important Warnings

### Concurrency and Asynchronous Code

**Warning**: Using `withProps` in concurrent or asynchronous contexts may cause race conditions since it mutates the source object temporarily.

```typescript
// ❌ Avoid this - potential race condition
const obj = { value: 1 };

withProps(obj, { value: 2 }, async () => {
    await someAsyncOperation(); // Other code might access obj during this time
});

// ✅ Better approach for async scenarios
const getModifiedObject = (original, overwrites) => ({ ...original, ...overwrites });
const modifiedObj = getModifiedObject(obj, { value: 2 });
await someAsyncOperation(modifiedObj);
```

### Null and Undefined Values

Property values `null` and `undefined` are treated as actual values to set:

```typescript
const obj = { a: 'hello', b: 'world' };

withProps(obj, { a: null, b: undefined }, () => {
    console.log(obj); // { a: null, b: undefined }
});

console.log(obj); // { a: 'hello', b: 'world' } - restored
```

## 💡 Use Cases

- **Testing**: Mock object properties and methods during tests
- **Configuration Management**: Temporarily modify configuration objects
- **Feature Flags**: Conditionally enable/disable features during execution
- **Development Tools**: Create debugging utilities that modify behavior temporarily
- **A/B Testing**: Test different object states without permanent modification

## 🔍 TypeScript Support

This library is written in TypeScript and provides full type safety:

```typescript
interface Config {
    debug: boolean;
    apiUrl: string;
    timeout: number;
}

const config: Config = {
    debug: false,
    apiUrl: 'https://api.example.com',
    timeout: 5000
};

// ✅ Type-safe - all properties match Config interface
withProps(config, { debug: true, timeout: 10000 }, () => {
    // config is properly typed
});

// ❌ TypeScript error - 'invalidProp' doesn't exist on Config
withProps(config, { invalidProp: true }, () => {});
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

ISC License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related

- Looking for immutable alternatives? Consider using libraries like [immer](https://github.com/immerjs/immer) for immutable state updates
- For more complex object manipulation, check out [lodash](https://lodash.com/)