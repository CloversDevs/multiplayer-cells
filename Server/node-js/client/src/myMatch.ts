import { MatchData, MatchPresenceEvent, User } from "@heroiclabs/nakama-js";
import { myNakama, NakamaOpCode, sanitizeString } from "./myNakama";

class MatchOpCode {
    static position = 1;
    static vote = 2;
    static userState = 3;
}

class UserState
{
    public x: number;
    public y: number;
    public color: string;
}

export class MatchPlayer
{
    user:User = null;
    userId:string;

    x:number = 0;
    y:number = 0;
    target_x:number = 0;
    target_y:number = 0;
    radius:number = 20;
    color:string = "yellow";
    speed:number = 4;
    text:string = "anonymous";

    constructor(userId:string)
    {
        this.userId = userId;
    }

    public async RefreshUser(nk:myNakama) : Promise<void>
    {
        let ids = new Array<string>();
        ids.push(this.userId);
        let users = await nk.client.getUsers(nk.session, ids);
        this.user = users.users[0];

        //TODO: There seems to be some issue with the logic for the local player the first time where this is null.
        this.text = sanitizeString(this.user.display_name ?? "unknown", 10);
    }
}

export class MatchController
{
    private nk:myNakama;
    public players: Record<string, MatchPlayer> = {};
    public localPlayerId: string;
    private targetX:number = 0;
    private targetY:number = 0;

    public get LocalPlayer():MatchPlayer {
        return this.players[this.localPlayerId];
    } 

    constructor(nakamaAPI:myNakama)
    {
        this.nk = nakamaAPI;
        this.nk.onMatchData.addListener(this.onReceiveMatchData.bind(this));
        this.nk.onMatchPresenceEvent.addListener(this.onMatchPresenceEvent.bind(this))
    }

    public async StartMatch()
    {
        this.localPlayerId = this.nk.session.user_id;
        let player = new MatchPlayer(this.localPlayerId);
        this.players[this.localPlayerId] = player;
        await player.RefreshUser(this.nk);
    }

    public async GetUser(userId:string) : Promise<void>
    {
        let ids = new Array<string>();
        ids.push(userId);
        let users = await this.nk.client.getUsers(this.nk.session, ids);
        this.players[userId].user = users.users[0];
    }

    public onMatchPresenceEvent(presenceEvent:MatchPresenceEvent):void
    {
        // TODO: Does not seem to work... or does it?
        // Maybe keep some local heartbeat for other players and hide them until they disconnect officialy.
        if(presenceEvent.leaves)
        {
            presenceEvent.leaves.forEach(element => {
                delete this.players[element.user_id];
            });
        }
    }

    public onReceiveMatchData(matchData:MatchData): void
    {
        const receivedData = new TextDecoder().decode(matchData.data);
        try
        {
            const parsed = JSON.parse(receivedData);
            let userId:string = matchData.presence.user_id;
            
            let player:MatchPlayer = null;
            if (!this.players.hasOwnProperty(userId)) {
                console.log(`[NAKAMA] New presence '${userId}' ${matchData.op_code}: ${receivedData}`);
                player = new MatchPlayer(userId);
                player.RefreshUser(this.nk);
                this.players[userId] = player;
            }
            player = this.players[userId];
            if(player.userId === this.localPlayerId)
            {
                console.log(`[NAKAMA] MESSAGE FROM SELF!`);
                return;
            }
            
            switch (matchData.op_code)
            {
                case NakamaOpCode.accountUpdated:
                    console.log(`[NAKAMA] Refresh account request: '${matchData.op_code}'`);
                    player.RefreshUser(this.nk);
                    break;
                case MatchOpCode.position:
                    player.x = parsed.x;
                    player.y = parsed.y;
                    break;
                case MatchOpCode.userState:
                    player.target_x = parsed.x;
                    player.target_y = parsed.y;
                    player.color = parsed.color;
                    break;
                default:
                    console.log(`[NAKAMA] Unknown op code: '${matchData.op_code}'`);
                    break;
            }
        }
        catch (error)
        {
            console.log(`[NAKAMA] Exception on received op code '${matchData.op_code}', Error: ${error}`);
        }
    }

    public OnPlayerClick(x:number, y:number)
    {
        this.targetX = x;
        this.targetY = y;
    }

    public Update() {
        // move player
        let localPlayer = this.LocalPlayer;
        const dx = this.targetX - localPlayer.x;
        const dy = this.targetY - localPlayer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 1) {
            localPlayer.x += (dx / distance) * localPlayer.speed;
            localPlayer.y += (dy / distance) * localPlayer.speed;
            localPlayer.x = Math.floor(localPlayer.x);
            localPlayer.y = Math.floor(localPlayer.y);
        }

        const moveTowards =(current: number, target: number, maxDelta: number) => {
            const delta = target - current;
            if (Math.abs(delta) <= maxDelta) {
                return target; // Already at or within the max distance
            }
            return current + Math.sign(delta) * maxDelta;
        }

        const playerIds = Object.keys(this.players)

        playerIds.forEach(playerId => {
            const player = this.players[playerId];
            if(player !== localPlayer) 
            {
                player.x = moveTowards(player.x, player.target_x, player.speed * 2);
                player.y = moveTowards(player.y, player.target_y, player.speed * 2);
            }
        });
    }

    public async SendState():Promise<void> {
        const localPlayer = this.LocalPlayer;

        const userState:UserState = {
            x: Math.floor(localPlayer.x),
            y: Math.floor(localPlayer.y),
            color: localPlayer.color
        }
        
        await this.nk.sendMatchMessage(MatchOpCode.userState, userState);
    }
}