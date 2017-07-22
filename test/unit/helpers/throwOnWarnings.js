/* eslint-disable no-console, no-process-exit, no-param-reassign */

export default console => {
    const consoleError = console.error;

    console.error = function(firstMessage, ...rest) {
        if (firstMessage.startsWith('Warning:')) {
            throw new Error(`Unexpected Warning: ${firstMessage}`);
        }

        return consoleError(firstMessage, ...rest);
    };

    process.once('unhandledRejection', error => {
        console.error(`Unhandled rejection: ${error.stack}`);

        process.exit(1);
    });
};
