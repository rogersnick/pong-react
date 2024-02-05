import React from 'react';
import Player from './player.component';
import Ball from './ball.component';
import Rect from './rect';


export default class Pong extends React.Component
{
    initialSpeed: number = 0.6;
    ball: Ball;
    players: Player[];
    // ai:
    iteration = 0;
    mutationRate = 0.01;
    numberOfRobots = 2; // please make this even
    generations = 0;
    ai: {a: number, b: number, score: number, generation: number}[] = [];
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
        this.initializeRobots(this.numberOfRobots);
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
            this.ai[this.iteration].score +=1;
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
        this.generations.toString().split('')
        .forEach((char, pos) => {
            const offset = - (cw * this.generations.toString().length / 2) + this.CHAR_PIXEL / 2;
                this.context.drawImage(this.CHARS[+char], this.canvasRef.current.width / 2 + offset + pos * cw, 20);
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
        this.iteration +=1;
        if (this.iteration === this.numberOfRobots)
        {
            this.mutate();
        }
        this.ball.vel.x = 0;
        this.ball.vel.y = 0;
        const canvas = this.canvasRef.current;
        this.players[1].pos.y = canvas.height / 2;

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
            this.ai[this.iteration].score +=1;
        }

        this.players[1].pos.y = this.ball.pos.x * this.ai[this.iteration].a + this.ball.pos.y * this.ai[this.iteration].b;
        // ball.pos.y;

        this.players.forEach(player => {
            player.update(dt);
            this.ai[this.iteration].score +=1;
            this.collide(player, ball);
        });

        this.draw();
    }

    initializeRobots(num: number) 
    {
        for (let i = 0; i < num; i++) {
            this.ai[i] = {
                a: Math.random() / 3.5,
                b: (Math.random() + 2.5) / 3.5,
                score: 0,
                generation: 0
            }
          }
    }

    mutate() 
    {
        const NUM_MUTANTS = Math.floor(this.numberOfRobots / 2);
        this.iteration = 0;
        this.generations +=1;
        console.log(this.ai);
        const alphas = this.ai
            .sort((x: {a:number,b:number,score:number} , y:{a:number,b:number,score:number} ) => (x.score > y.score) ? 1 : ((y.score > x.score) ? -1 : 0));
        this.ai = [];
        console.log('ALPHA', alphas);
        alphas.slice(0, NUM_MUTANTS).forEach(ai => {
            const newBreed =  
            {
                a: ai.a + ( Math.random() > 0.5 ? this.mutationRate : -this.mutationRate), // + this.mutationRate * (alphas[Math.floor(Math.random() * this.numberOfRobots / 2)]).a,
                b: ai.b + ( Math.random() > 0.5 ? this.mutationRate : -this.mutationRate), // + this.mutationRate * (alphas[Math.floor(Math.random() * this.numberOfRobots / 2)]).b,
                score: 0,
                generation: this.generations
            };
            this.ai.push(newBreed);
        });
        for (let i = NUM_MUTANTS; i < this.numberOfRobots; i++) {
            this.ai[i] = alphas[this.numberOfRobots - i];
          }
          console.log(this.ai);
          // shuffle them up (for fun)
          this.ai = this.ai.sort(() => Math.random() - 0.5);

    }
}
