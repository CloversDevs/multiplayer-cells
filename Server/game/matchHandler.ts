const gameName:string = "tictactoe";

function matchInit(
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    params: { [key: string]: string }
  ) {
    logger.info("Dummy match initialized");
  
    const state: {
      tick: number;
      presences: { [sessionId: string]: nkruntime.Presence };
      label: string;
    } = {
      tick: 0,
      presences: {},
      label: "dummy_match_" + Math.floor(Math.random() * 100000),
    };
  
    return {
      state,
      tickRate: 1,
      label: state.label,
    };
  }
  
  function matchJoinAttempt(
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: any,
    presence: nkruntime.Presence,
    metadata: { [key: string]: any }
  ) {
    logger.debug("Join attempt from user: %s", presence.userId);
    return {
      state,
      accept: true,
      reason: "",
    };
  }
  
  function matchJoin(
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: any,
    presences: nkruntime.Presence[]
  ) {
    for (const presence of presences) {
      state.presences[presence.sessionId] = presence;
      logger.info("User joined match: %s", presence.userId);
    }
    return { state };
  }
  
  function matchLeave(
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: any,
    presences: nkruntime.Presence[]
  ) {
    for (const presence of presences) {
      delete state.presences[presence.sessionId];
      logger.info("User left match: %s", presence.userId);
    }
    return { state };
  }
  
  function matchLoop(
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: any,
    messages: nkruntime.MatchMessage[]
  ) {
    state.tick++;
  
    if (state.tick % 10 === 0) {
      logger.debug("Tick %d", state.tick);
    }
  
    return { state };
  }
  
  function matchTerminate(
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: any,
    graceSeconds: number
  ) {
    logger.info("Match terminated: %s", state.label);
    return { state };
  }
  
  function matchSignal(
    ctx: nkruntime.Context,
    logger: nkruntime.Logger,
    nk: nkruntime.Nakama,
    dispatcher: nkruntime.MatchDispatcher,
    tick: number,
    state: any,
    data: string
  ) {
    logger.info("Received signal: %s", data);
  
    // Do something based on the signal
    if (data === "shutdown") {
      logger.info("Match shutting down on signal.");
      return {
        state,
        close: true, // ends the match
      };
    }
  
    return { state };
  }