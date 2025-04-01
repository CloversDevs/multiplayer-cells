function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, intializer: nkruntime.Initializer) {
    logger.info(`Javacript module loaded. Hello World!`);
    intializer.registerRpc(`healthcheck`, rpcHealthCheck);
}