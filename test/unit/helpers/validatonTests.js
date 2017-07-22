const baseValues = [ 0, 1, -1, 1.23, -1.23, Infinity, -Infinity, true, false, null, undefined ];

export const nonObjectValues = [ 'someString', [], () => {}, function () {}, ...baseValues ];

export const nonFunctionValues = [ 'someString', {}, [], ...baseValues ];

export const nonStringValues = [ {}, [], () => {}, function () {}, ...baseValues ];

export const nonArrayValues = [ 'someString', {}, () => {}, function () {}, ...baseValues ];
