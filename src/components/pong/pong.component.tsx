import React from 'react';
import Player from './player.component';
import Ball from './ball.component';
import Rect from './rect';


export default class Pong extends React.Component
{
    initialSpeed: number = 0.6;
    ball: Ball;
    players: Player[];
    state = {
        canvasWidth: 800,
        canvasHeight: 800
    };
    lastTime: number= 0;
    canvasRef: any;
    CHAR_PIXEL = 10;
    CHARS = [
    '111101101101111',
    '010010010010010',
    '111001111100111',
    '111001111001111',
    '101101111001001',
    '111100111001111',
    '111100111101111',
    '111001001001001',
    '111101111101111',
    '111101111001111',
        ].map(str => {
            const canvas = document.createElement('canvas');
            const s = this.CHAR_PIXEL;
            canvas.height = s * 5;
            canvas.width = s * 3;
            const context = canvas.getContext('2d');
            if (context) {
                context.fillStyle = '#fff';
                str.split('').forEach((fill, i) => {
                    if (fill === '1') {
                        context.fillRect((i % 3) * s, (i / 3 | 0) * s, s, s);
                    }
                });
            }
            return canvas;
        });


    constructor(props: {}) {
        super(props);
        this.canvasRef = React.createRef();
        this.ball = new Ball();
        this.players = [
            new Player(),
            new Player(),
        ];
    }


   animate = (time: number) => {
    if (this.lastTime !== undefined) {
        const deltaTime = time - this.lastTime;
        this.update(deltaTime);
    }
    this.lastTime = time;
    requestAnimationFrame(this.animate);
  }
  

    componentDidMount() {
        const canvas = this.canvasRef.current;
        this.context =  canvas.getContext('2d');
        this.players[0].pos.x = 40;
        this.players[1].pos.x = canvas.width - 40;
        this.players.forEach(p => p.pos.y = canvas.height / 2);
        this.context.fillRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);
        this.reset();
        this.draw();

        canvas.addEventListener('click', () => this.play());
        canvas.addEventListener('mousemove', (event: MouseEvent) => {
            this.players[0].pos.y = event.clientY;
        });
        this.animate(0);
    }
    render() {
        return (
            <div>
                <canvas ref={this.canvasRef} 
                width={this.state.canvasWidth} height={this.state.canvasHeight}/>
            </div>
        );
    }
    clear()
    {
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvasRef.current.width, this.canvasRef.current.height);
    }
    collide(player: Player, ball : Ball)
    {
        if (player.left < ball.right && player.right > ball.left &&
            player.top < ball.bottom && player.bottom > ball.top) {
            ball.vel.x = -ball.vel.x * 1.05;
            const len = ball.vel.len;
            ball.vel.y += this.initialSpeed * (Math.random() - .5);
            ball.vel.len = len;
        }
    }
    draw()
    {
        this.clear();
        this.drawRect(this.ball);
        this.players.forEach(player => this.drawRect(player));
        this.drawScore()
    }
    drawScore()
    {
        const align = this.canvasRef.current.width / 3;
        const cw = this.CHAR_PIXEL * 4;
        this.players.forEach((player, index) => {
            const chars = player.score.toString().split('');
            const offset = align * (index + 1) - (cw * chars.length / 2) + this.CHAR_PIXEL / 2;
            chars.forEach((char, pos) => {
                this.context.drawImage(this.CHARS[+char], offset + pos * cw, 20);
            });
        });
    }
    drawRect(rect: Rect)
    {
        this.context.fillStyle = '#fff';
        this.context.fillRect(rect.left, rect.top, rect.size.x, rect.size.y);
    }
    play()
    {
        if (this.ball.vel.x === 0 && this.ball.vel.y === 0) {
            this.ball.vel.x = 1 * (Math.random() > .5 ? 1 : -1);
            this.ball.vel.y = 1 * (Math.random() * 2 - 1);
            this.ball.vel.len = this.initialSpeed;
        }
    }
    reset()
    {
        this.ball.vel.x = 0;
        this.ball.vel.y = 0;
        this.ball.pos.x = this.canvasRef.current.width / 2;
        this.ball.pos.y = this.canvasRef.current.height / 2;
    }
    update(dt:number)
    {
        const cvs = this.canvasRef.current;
        const ball = this.ball;
        ball.pos.x += ball.vel.x * dt;
        ball.pos.y += ball.vel.y * dt;

        if (ball.right < 0 || ball.left > cvs.width) {
            ++this.players[+(ball.vel.x < 0)].score;
            this.reset();
        }

        if (ball.vel.y < 0 && ball.top < 0 ? true : 
            ball.vel.y > 0 && ball.bottom > cvs.height ? true : false) {
            ball.vel.y = -ball.vel.y;
        }

        this.players[1].pos.y = ball.pos.y;

        this.players.forEach(player => {
            player.update(dt);
            this.collide(player, ball);
        });

        this.draw();
    }
}
