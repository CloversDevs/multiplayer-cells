import {Client, Friend, Match, MatchData, MatchPresenceEvent, Session, Socket, StatusPresenceEvent} from "@heroiclabs/nakama-js";
import { ApiAccount, ApiUpdateAccountRequest } from "@heroiclabs/nakama-js/dist/api.gen";
import { EventHandler } from "./EventHandler";


export class NakamaOpCode {
    static accountUpdated = -1;
}

const RPC_ID_HEALTHCHECK:string = "healthcheck";
const RPC_ID_FINDMATCH:string = "findmatch";

export function sanitizeString(text: string, maxLength: number = 10): string {
    return text
        .normalize("NFKC") // Normalize Unicode to prevent homoglyph attacks
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove ASCII control characters
        .replace(/[\u200B-\u200D\u2028\u2029\u2060\uFEFF]/g, "") // Remove zero-width and separator characters
        .trim() // Trim spaces
        .slice(0, maxLength); // Limit length
}

export function generateRandomString(length: number): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function getFromQuery(id:string): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(id);
}

export class myNakama
{
    session: Session = null;
    client : Client = null;
    socket : Socket = null;
    match : Match = null;
    account : ApiAccount = null;
    sendingMatchState:boolean = false;
    public onMatchData:EventHandler<MatchData> = new EventHandler<MatchData>();
    public onMatchPresenceEvent:EventHandler<MatchPresenceEvent> = new EventHandler<MatchPresenceEvent>();
    public onAccountUpdated:EventHandler<ApiAccount> = new EventHandler<ApiAccount>();

    public async connect(deviceId:string, url:string, key:string, port:string, useSsl:boolean) : Promise<void>
    {
        console.info("[NAKAMA] Connect to backend...");
        this.client = new Client(key, url, port, useSsl);
        
        console.info(`[NAKAMA] Authenticat with device id '${deviceId}'..`);

        this.session = await this.client.authenticateDevice(deviceId);
        console.info(`[NAKAMA] Connected as '${this.session.username}' UserId:'${this.session.user_id}'!`);

        console.info("[NAKAMA] Get account data...");
        this.account = await this.client.getAccount(this.session);
        this.onAccountUpdated.invoke(this.account);

        console.info("[NAKAMA] Connect to socket...");
        var appearOnline = true;
        this.socket = this.client.createSocket();
        await this.socket.connect(this.session, appearOnline);
        console.info("[NAKAMA] ☆★☆★☆★☆★☆★☆★☆★☆★☆★☆★☆★");

        console.info("[NAKAMA] Register events...");
        this.socket.onmatchdata = this.onMatchData.invoke;
        this.socket.onmatchpresence = this.onMatchPresenceEvent.invoke;
    }

    async setDisplayName(newDisplayName:string):Promise<void> {
        let request:ApiUpdateAccountRequest = {
            display_name : sanitizeString(newDisplayName, 10)
        }
        console.log(`[NAKAMA] Update display name from '${this.account.user.display_name}' to '${newDisplayName}'`);
        try
        {
            await this.client.updateAccount(this.session,request);
        } catch (error) {
            console.error("[NAKAMA] Error updating account:", error);
        }
        this.account = await this.client.getAccount(this.session);
        console.log(`[NAKAMA] Updated display name to: '${this.account.user.display_name}'`);

        // TODO: If in match, send message letting peers know your account changed.
        this.forceSendMatchMessage(NakamaOpCode.accountUpdated, {});
        this.onAccountUpdated.invoke(this.account);
    }

    async joinMatch(id:string):Promise<void> {
        console.info(`[NAKAMA] Joining match ★ id:'${id}'`);
        this.match = await this.socket.joinMatch(id);
        console.info(`★ ★ ★ ★ ★ CONNECTED TO MATCH ★ id:'${this.match.match_id}'`);
    }

    async createMatch(matchName:string):Promise<void> {
        console.info(`[NAKAMA] Creating or joining relayed match ★ name '${matchName}'`);
        this.match = await this.socket.createMatch(matchName);
        console.info("★☆★☆★☆★☆★☆★☆★☆★☆★☆★☆★☆");
        console.info(`★ ★ ★ ★ ★ CONNECTED TO MATCH ★ id:'${this.match.match_id}'`);
    }

    async createAuthMatch():Promise<void> {
        this.match = await this.socket.createMatch();
    }

    // Send a priority message.
    async forceSendMatchMessage(opcode:number, obj:any):Promise<void> {
        if(!this.socket || !this.match) return;

        const encodedMessage = new TextEncoder().encode(JSON.stringify(obj));
        await this.socket.sendMatchState(this.match.match_id, opcode, encodedMessage);
    }

    // Send a message only if we aren't already sending another.
    async sendMatchMessage(opcode:number, obj:any):Promise<void> {
        if(this.sendingMatchState || !this.socket || !this.match) return;

        this.sendingMatchState = true;
        const encodedMessage = new TextEncoder().encode(JSON.stringify(obj));
        await this.socket.sendMatchState(this.match.match_id, opcode, encodedMessage);
        this.sendingMatchState = false;
    }

    async rpcHealthCheck() : Promise<HealthCheckResponse>
    {
        console.log("heath check")
        const response = await this.client.rpc(this.session, RPC_ID_HEALTHCHECK, {});
        console.log(response);
        return response.payload as HealthCheckResponse;
    }

    async rpcFindMatch() : Promise<FindMatchResponse>
    {
        console.log("find match")
        const response = await this.client.rpc(this.session, RPC_ID_FINDMATCH, {});
        console.log(response);
        return response.payload as FindMatchResponse;
    }
}

class HealthCheckResponse
{
    public id:string;
    public success:boolean;
}

class FindMatchResponse
{
    public id:string;
    public success:boolean;
}