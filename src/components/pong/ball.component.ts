import Rect from "./rect";
import Vec from "./vec";

export default class Ball extends Rect
{
    vel: Vec;

    constructor()
    {
        super(20, 20);
        this.vel = new Vec();
    }
}