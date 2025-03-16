import { MatchController, MatchPlayer } from "./myMatch";

export class MyMatchRenderer
{
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) throw new Error(`Canvas with ID "${canvasId}" not found.`);
        
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        if (!ctx) throw new Error("Failed to get 2D context.");

        this.canvas = canvas;
        this.ctx = ctx;
    }


    // Draw function
    public Draw(matchController:MatchController) {
        if(!matchController) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawGrid(0,0);
        this.drawMatchPlayers(matchController);
    }

    // Draw background grid.
    private drawGrid(offsetX:number, offsetY:number) {
        const gridSize = 50;
        this.ctx.strokeStyle = "lightgray";
        this.ctx.lineWidth = 1;
        
        for (let x = (offsetX % gridSize) - gridSize; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = (offsetY % gridSize) - gridSize; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    // Draw all match players.
    private drawMatchPlayers(match:MatchController)
    {
        const drawMatchPlayer = (player:MatchPlayer) =>
        {
            // Draw the circle
            this.ctx.beginPath();
            this.ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = player.color;
            this.ctx.fill();
            this.ctx.closePath();

            // Set text style
            this.ctx.fillStyle = "white";
            this.ctx.font = "bold 16px Arial";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";

            // Draw text outline
            this.ctx.strokeStyle = "black";
            this.ctx.lineWidth = 3; 

            // TODO: Make sure this is correctly sanitized.
            let txt = player.text;
            this.ctx.strokeText(txt, player.x, player.y - player.radius - 16);
            this.ctx.fillText(txt, player.x, player.y - player.radius - 16);
        }

        for (const key in match.players) {
            if (match.players.hasOwnProperty(key)) {
                drawMatchPlayer.bind(this)(match.players[key]);
            }
        }
    }
}