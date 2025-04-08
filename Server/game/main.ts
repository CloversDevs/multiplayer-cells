function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
    logger.info(`Javacript module loaded. Hello World!`);
    initializer.registerRpc(`healthcheck`, rpcHealthCheck);
    initializer.registerRpc(`findmatch`, rpcFindMatch);

    initializer.registerMatch(gameName, {
        matchInit,
        matchJoinAttempt,
        matchJoin,
        matchLeave,
        matchLoop,
        matchTerminate,
        matchSignal,
    });

    logger.info('JavaScript logic loaded.');
}