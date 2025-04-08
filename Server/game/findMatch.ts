function rpcFindMatch(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string) : string {
    const id = nk.matchCreate(gameName);
    return JSON.stringify({ success: true, id: id});
}