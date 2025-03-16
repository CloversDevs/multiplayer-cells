import { MatchData, MatchPresenceEvent, User } from "@heroiclabs/nakama-js";
import { myNakama, NakamaOpCode, sanitizeString } from "./myNakama";
import { ApiAccount } from "@heroiclabs/nakama-js/dist/api.gen";

class MatchOpCode {
    static position = 1;
    static vote = 2;
}

export class MatchPlayer
{
    user:User = null;
    userId:string;

    x:number = 0;
    y:number = 0;
    radius:number = 20;
    color:string = "yellow";
    speed:number = 4;
    text:string = "O";

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
        this.text = sanitizeString(this.user.display_name, 10);
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
        // TODO: Does not seem to work.
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
            //console.log(`[NAKAMA] Received op code from '${userId}' ${matchData.op_code}: ${receivedData}`);

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
        let player = this.LocalPlayer;
        const dx = this.targetX - player.x;
        const dy = this.targetY - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 1) {
            player.x += (dx / distance) * player.speed;
            player.y += (dy / distance) * player.speed;
        }
    }

    public async SendState():Promise<void> {
        let localPlayer = this.LocalPlayer;
        await this.nk.sendMatchMessage(MatchOpCode.position,{ x : Math.round(localPlayer.x), y : Math.round(localPlayer.y)});
    }
}