import test from 'ava';
import { MemoryAdapter } from './MemoryAdapter';

test('cleares all items set in cache', async t => {
  const memoryAdapter = new MemoryAdapter();
  memoryAdapter.set('key1', 'value1');
  memoryAdapter.set('key2', 'value2');
  memoryAdapter.set('key3', 'value3');

  t.true(await memoryAdapter.has('key1'));
  t.true(await memoryAdapter.has('key2'));
  t.true(await memoryAdapter.has('key3'));
  
  await memoryAdapter.clear();

  t.false(await memoryAdapter.has('key1'));
  t.false(await memoryAdapter.has('key2'));
  t.false(await memoryAdapter.has('key3'));
});

test('resolves with number of items cleared', async t => {
  const memoryAdapter = new MemoryAdapter();
  memoryAdapter.set('key1', 'value1');
  memoryAdapter.set('key2', 'value2');
  memoryAdapter.set('key3', 'value3');
    
  const result = await memoryAdapter.clear();
  
  t.is(result, 3);
});
