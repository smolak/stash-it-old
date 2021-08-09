import test from 'ava';
import { Item } from 'src/createItem';
import { MemoryAdapter } from './MemoryAdapter';

test('resolves with an item if it (item) is set', async t => {
  const memoryAdapter = new MemoryAdapter();
  memoryAdapter.set('key', 'value');
  
  const item = await memoryAdapter.get('key');

  t.deepEqual(item, { key: 'key', value: 'value', extra: {}, ttl: 3600} as Item);
});

test('resolves with null if item is not found', async t => {
    const memoryAdapter = new MemoryAdapter();
    
    const item = await memoryAdapter.get('key');
  
    t.is(item, null);
});
