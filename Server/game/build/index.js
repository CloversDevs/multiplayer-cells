"use strict";
function InitModule(ctx, logger, nk, intializer) {
    logger.info("Javacript module loaded. Hello World!");
    intializer.registerRpc("healthcheck", rpcHealthCheck);
}
function rpcHealthCheck(ctx, logger, nk, payload) {
    logger.info("Javacript module loaded. Hello World!");
    return JSON.stringify({ success: true });
}
