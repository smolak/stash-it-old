import test from 'ava';
import { Extra, Item } from 'src/createItem';
import { MemoryAdapter } from './MemoryAdapter';

test('setting a value resolves with an item that holds the set value', async t => {
  const memoryAdapter = new MemoryAdapter();
  
  const item = await memoryAdapter.set('key', 'value');

  t.deepEqual(item, { key: 'key', value: 'value', extra: {}, ttl: 3600} as Item);
});

test('setting a new value under an existing key overwrites that item', async t => {
    const memoryAdapter = new MemoryAdapter();
    await memoryAdapter.set('key', 'value');

    const { value } = await memoryAdapter.set('key', 'new value');
  
    t.is(value, 'new value');
});

test('sets ttl for 1 hour if not specified', async t => {
    const memoryAdapter = new MemoryAdapter();
    const { ttl } = await memoryAdapter.set('key', 'value');

    const oneHourInSeconds = 3600;
    t.is(ttl, oneHourInSeconds);
});

test('sets ttl if passed (as a number representing quantity in seconds)', async t => {
    const memoryAdapter = new MemoryAdapter();
    const ttlValue = 5000;
    const { ttl } = await memoryAdapter.set('key', 'value', {}, ttlValue);

    t.is(ttl, ttlValue);
});

test('rejects when ttl is a number but not an intiger', async t => {
    const memoryAdapter = new MemoryAdapter();
    const ttlValue = 1.23;

    const error = await t.throwsAsync(memoryAdapter.set('key', 'value', {}, ttlValue));

	t.is(error.message, "'ttl' needs to be an intiger.");
});

test('rejects when ttl does not have value greater than 0', async t => {
    const memoryAdapter = new MemoryAdapter();
    const ttlValue = 0;

    const error = await t.throwsAsync(memoryAdapter.set('key', 'value', {}, ttlValue));

	t.is(error.message, "'ttl' needs to be greater than 0 (value passed: 0).");
});

test('rejects whe ttl is not a number', async t => {
    const memoryAdapter = new MemoryAdapter();
    const ttlValue = 'abc';

    // @ts-ignore
    const error = await t.throwsAsync(memoryAdapter.set('key', 'value', {}, ttlValue));

	t.is(error.message, "'ttl' needs to be a number.");
});

test('set extra if passed', async t => {
    const memoryAdapter = new MemoryAdapter();
    const extraValue = { tags: [ 'foo', 'bar' ] };

    const { extra } = await memoryAdapter.set('key', 'value', extraValue);

    t.deepEqual(extra, { tags: ['foo', 'bar']} as Extra);
});
