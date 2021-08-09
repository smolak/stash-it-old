import test from 'ava';
import { MemoryAdapter } from './MemoryAdapter';

test('resolves with true if item was deleted', async t => {
  const memoryAdapter = new MemoryAdapter();
  memoryAdapter.set('key', 'value');
  
  const result = await memoryAdapter.delete('key');

  t.true(result);
});

test('resolves with false if item was not removed (e.g. was not found)', async t => {
    const memoryAdapter = new MemoryAdapter();
    
    const result = await memoryAdapter.delete('key');
  
    t.false(result);
});
