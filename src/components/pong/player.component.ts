import Rect from "./rect";
import Vec from "./vec";

export default class Player extends Rect
{
    vel: Vec;
    score: number;
    private _lastPos: Vec;
    constructor()
    {
        super(20, 100);
        this.vel = new Vec();
        this.score = 0;

        this._lastPos = new Vec();
    }
    update(dt:number)
    {
        this.vel.y = (this.pos.y - this._lastPos.y) / dt;
        this._lastPos.y = this.pos.y;
    }
}