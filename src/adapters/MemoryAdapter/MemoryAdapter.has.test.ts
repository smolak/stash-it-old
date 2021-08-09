import test from 'ava';
import { MemoryAdapter } from './MemoryAdapter';

test('resolves with true if item is found', async t => {
  const memoryAdapter = new MemoryAdapter();
  memoryAdapter.set('key', 'value');
  
  const result = await memoryAdapter.has('key');

  t.true(result);
});

test('resolves with false if item is not found', async t => {
    const memoryAdapter = new MemoryAdapter();
    
    const result = await memoryAdapter.has('key');
  
    t.false(result);
});
