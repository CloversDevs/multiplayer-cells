function rpcHealthCheck(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string) : string {
    logger.info(`Javacript module loaded. Hello World!`);
    return JSON.stringify({ success: true});
}