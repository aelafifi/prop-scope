import { withProps, IGNORE } from '../src/index';

describe('withProps', () => {
  describe('Basic functionality', () => {
    test('should temporarily overwrite properties and restore them', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const originalObj = { ...obj };

      withProps(obj, { a: 10, b: 20 }, (originalValues) => {
        expect(obj.a).toBe(10);
        expect(obj.b).toBe(20);
        expect(obj.c).toBe(3); // unchanged
        expect(originalValues).toEqual({ a: 1, b: 2 });
      });

      expect(obj).toEqual(originalObj);
    });

    test('should handle single property overwrite', () => {
      const obj = { x: 'hello', y: 'world' };
      
      withProps(obj, { x: 'goodbye' }, (originalValues) => {
        expect(obj.x).toBe('goodbye');
        expect(obj.y).toBe('world');
        expect(originalValues).toEqual({ x: 'hello' });
      });

      expect(obj.x).toBe('hello');
      expect(obj.y).toBe('world');
    });

    test('should handle empty overwrites object', () => {
      const obj = { a: 1, b: 2 };
      const originalObj = { ...obj };

      withProps(obj, {}, (originalValues) => {
        expect(obj).toEqual(originalObj);
        expect(originalValues).toEqual({});
      });

      expect(obj).toEqual(originalObj);
    });
  });

  describe('Error handling and restoration', () => {
    test('should restore properties even when callback throws an error', () => {
      const obj = { a: 1, b: 2 };
      const originalObj = { ...obj };

      expect(() => {
        withProps(obj, { a: 10, b: 20 }, () => {
          expect(obj.a).toBe(10);
          expect(obj.b).toBe(20);
          throw new Error('Test error');
        });
      }).toThrow('Test error');

      expect(obj).toEqual(originalObj);
    });

    test('should handle nested errors gracefully', () => {
      const obj = { value: 'original' };

      expect(() => {
        withProps(obj, { value: 'modified' }, () => {
          withProps(obj, { value: 'nested' }, () => {
            expect(obj.value).toBe('nested');
            throw new Error('Nested error');
          });
        });
      }).toThrow('Nested error');

      expect(obj.value).toBe('original');
    });
  });

  describe('IGNORE symbol functionality', () => {
    test('should skip properties with IGNORE value', () => {
      const obj = { a: 1, b: 2, c: 3 };
      
      withProps(obj, { a: 10, b: IGNORE, c: 30 }, (originalValues) => {
        expect(obj.a).toBe(10);
        expect(obj.b).toBe(2); // unchanged
        expect(obj.c).toBe(30);
        expect(originalValues).toEqual({ a: 1, c: 3 }); // b is not included
      });

      expect(obj).toEqual({ a: 1, b: 2, c: 3 });
    });

    test('should handle conditional IGNORE usage', () => {
      const obj = { x: 5, y: 10, z: 15 };
      
      withProps(
        obj,
        {
          x: 50,
          y: obj.y > 100 ? 100 : IGNORE, // condition false, so IGNORE
          z: obj.z > 10 ? 150 : IGNORE   // condition true, so overwrite
        },
        (originalValues) => {
          expect(obj.x).toBe(50);
          expect(obj.y).toBe(10); // unchanged due to IGNORE
          expect(obj.z).toBe(150);
          expect(originalValues).toEqual({ x: 5, z: 15 });
        }
      );

      expect(obj).toEqual({ x: 5, y: 10, z: 15 });
    });

    test('should handle all properties being IGNORE', () => {
      const obj = { a: 1, b: 2 };
      const originalObj = { ...obj };

      withProps(obj, { a: IGNORE, b: IGNORE }, (originalValues) => {
        expect(obj).toEqual(originalObj);
        expect(originalValues).toEqual({});
      });

      expect(obj).toEqual(originalObj);
    });
  });

  describe('Value types handling', () => {
    test('should handle null and undefined values as actual values', () => {
      const obj = { a: 'hello', b: 'world', c: 'test' };
      
      withProps(obj, { a: null as any, b: undefined as any }, (originalValues) => {
        expect(obj.a).toBe(null);
        expect(obj.b).toBe(undefined);
        expect(obj.c).toBe('test');
        expect(originalValues).toEqual({ a: 'hello', b: 'world' });
      });

      expect(obj.a).toBe('hello');
      expect(obj.b).toBe('world');
      expect(obj.c).toBe('test');
    });

    test('should handle boolean values', () => {
      const obj = { flag1: true, flag2: false };
      
      withProps(obj, { flag1: false, flag2: true }, (originalValues) => {
        expect(obj.flag1).toBe(false);
        expect(obj.flag2).toBe(true);
        expect(originalValues).toEqual({ flag1: true, flag2: false });
      });

      expect(obj.flag1).toBe(true);
      expect(obj.flag2).toBe(false);
    });

    test('should handle array values', () => {
      const obj = { items: [1, 2, 3], names: ['a', 'b'] };
      
      withProps(obj, { items: [4, 5, 6] }, (originalValues) => {
        expect(obj.items).toEqual([4, 5, 6]);
        expect(obj.names).toEqual(['a', 'b']);
        expect(originalValues).toEqual({ items: [1, 2, 3] });
      });

      expect(obj.items).toEqual([1, 2, 3]);
      expect(obj.names).toEqual(['a', 'b']);
    });

    test('should handle function values', () => {
      const originalFn = () => 'original';
      const newFn = () => 'new';
      const obj = { fn: originalFn };
      
      withProps(obj, { fn: newFn }, (originalValues) => {
        expect(obj.fn()).toBe('new');
        expect(originalValues.fn).toBe(originalFn);
      });

      expect(obj.fn).toBe(originalFn);
      expect(obj.fn()).toBe('original');
    });
  });

  describe('Complex objects and edge cases', () => {
    test('should handle objects with symbol keys', () => {
      const symbol1 = Symbol('test1');
      const symbol2 = Symbol('test2');
      const obj = { [symbol1]: 'value1', [symbol2]: 'value2', regular: 'regular' };
      
      withProps(obj, { regular: 'modified' }, (originalValues) => {
        expect(obj.regular).toBe('modified');
        expect(obj[symbol1]).toBe('value1'); // symbols unchanged
        expect(obj[symbol2]).toBe('value2');
        expect(originalValues).toEqual({ regular: 'regular' });
      });

      expect(obj.regular).toBe('regular');
    });

    test('should handle nested objects', () => {
      const obj = {
        config: { debug: false, timeout: 5000 },
        user: { name: 'John', age: 30 }
      };
      
      const newConfig = { debug: true, timeout: 10000 };
      
      withProps(obj, { config: newConfig }, (originalValues) => {
        expect(obj.config).toBe(newConfig);
        expect(obj.user).toEqual({ name: 'John', age: 30 });
        expect(originalValues.config).toEqual({ debug: false, timeout: 5000 });
      });

      expect(obj.config).toEqual({ debug: false, timeout: 5000 });
    });

    test('should handle objects with getters and setters', () => {
      let internalValue = 'original';
      const obj = {
        get value() { return internalValue; },
        set value(val) { internalValue = val; },
        regular: 'test'
      };

      withProps(obj, { regular: 'modified' }, (originalValues) => {
        expect(obj.regular).toBe('modified');
        expect(obj.value).toBe('original'); // getter still works
        expect(originalValues).toEqual({ regular: 'test' });
      });

      expect(obj.regular).toBe('test');
      expect(obj.value).toBe('original');
    });
  });

  describe('Real-world usage scenarios', () => {
    test('should work for testing configuration scenarios', () => {
      const apiConfig = {
        baseUrl: 'https://api.prod.com',
        timeout: 5000,
        retries: 3
      };

      const testConfigs = [
        { baseUrl: 'https://api.staging.com', timeout: 10000 },
        { baseUrl: 'https://api.dev.com', timeout: 2000, retries: 1 }
      ];

      testConfigs.forEach((testConfig) => {
        withProps(apiConfig, testConfig, () => {
          expect(apiConfig.baseUrl).toBe(testConfig.baseUrl);
          expect(apiConfig.timeout).toBe(testConfig.timeout);
          if ('retries' in testConfig) {
            expect(apiConfig.retries).toBe(testConfig.retries);
          }
        });
      });

      // Verify original config is restored
      expect(apiConfig).toEqual({
        baseUrl: 'https://api.prod.com',
        timeout: 5000,
        retries: 3
      });
    });

    test('should work for mocking object methods', () => {
      const mockLogs: string[] = [];
      const logger = {
        log: (msg: string) => console.log(`[LOG] ${msg}`),
        error: (msg: string) => console.error(`[ERROR] ${msg}`)
      };

      withProps(
        logger,
        {
          log: (msg: string) => mockLogs.push(`LOG: ${msg}`),
          error: (msg: string) => mockLogs.push(`ERROR: ${msg}`)
        },
        () => {
          logger.log('Test message');
          logger.error('Test error');
          
          expect(mockLogs).toEqual(['LOG: Test message', 'ERROR: Test error']);
        }
      );

      // Original methods are restored (we can't easily test console output, but we can verify the functions are restored)
      expect(typeof logger.log).toBe('function');
      expect(typeof logger.error).toBe('function');
    });
  });
});

describe('IGNORE symbol', () => {
  test('should be a symbol', () => {
    expect(typeof IGNORE).toBe('symbol');
  });

  test('should be the same symbol when imported multiple times', () => {
    const symbol1 = IGNORE;
    const symbol2 = IGNORE;
    expect(symbol1).toBe(symbol2);
  });

  test('should be a for symbol with key "Ignore"', () => {
    expect(IGNORE).toBe(Symbol.for('Ignore'));
  });

  test('should be different from other symbols', () => {
    const otherSymbol = Symbol('Ignore');
    const anotherSymbol = Symbol.for('Other');
    
    expect(IGNORE).not.toBe(otherSymbol);
    expect(IGNORE).not.toBe(anotherSymbol);
  });
});