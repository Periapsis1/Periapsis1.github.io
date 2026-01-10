/**
 * This js file represents the qsnake game
 */

const GRID_SIZE = 20;
var GRID_WIDTH;
var GRID_HEIGHT;

const SNAKE_EYE_RADIUS = 3;
const CARDS_TO_SPAWN = 3;

const SNAKE_START_LENGTH = 3;
const MAX_SNAKE_LENGTH = 50;  // if the snake gets too big, words will have to be close together which is bad for readability, so we cut it short

const SNAKE_WRONG_ANSWER_PENALTY = 3;

const INACTIVE_CANVAS_BG_COLOR = 'rgb(64, 64, 64)';
const INACTIVE_CANVAS_BORDER_COLOR = 'rgb(0, 0, 0)';
const ACTIVE_CANVAS_BG_COLOR = 'rgb(128, 128, 128)';
const ACTIVE_CANVAS_BORDER_COLOR = 'rgb(0, 0, 0)';
const CANVAS_GAMEOVER_BG_COLOR = 'rgba(64, 64, 64, 64)';
const CANVAS_GAMEOVER_BORDER_COLOR = 'rgb(0, 0, 0)';

const TEXT_START_COLOR = 'rgb(255, 255, 255)';
const TEXT_WORD_COLOR = 'rgb(255, 255, 255)';

const TEXT_OFFSET = -20;

const CARD_MIN_DIST_OTHER = 3;  // minimum distance from another word
const CARD_MIN_DIST_SNAKE = 5;  // minumum distance from snake head
const CARD_MIN_DIST_TOP = 2;  // minimum distance from top of screen
const CARD_MIN_DIST_SIDES = 6;  // could be dependant on word length but that's too much for now

let canvas = document.getElementById('qsnake-canvas');

let test_deck = {
    topic: 'Japanese',
    name: 'hiragana-a',
    desc: 'Learn the \'a\' row of hiragana (vowels)',
    cards: [
        {
            word: 'あ',
            def: 'a',
        },
        {
            word: 'い',
            def: 'i'
        },
        {
            word: 'う',
            def: 'u'
        },
        {
            word: 'え',
            def: 'e'
        },
        {
            word: 'お',
            def: 'o'
        }
    ]
}

let range = n => [...Array(n).keys()]

class Snake {
    /**
     * Create a snake objects
     * @param {[[int, int], ...]} segments - a list of snake segments
     * @param {[int, int]} direction - the starting direction of the snake
     */
    constructor (segments, direction) {
        this.segments = segments;
        this.old_dir = direction;
        this.direction = direction;
        this.food = 0;  // If the snake has food, it will grow. This could technically be a bool since it can only ever be 0 or 1
    }

    turn (new_dir) {
        if (posEqual(new_dir, this.old_dir) || posEqual(posScale(new_dir, -1), this.old_dir)) {
            return;
        } else {
            this.direction = new_dir;
        }
    }

    /**
     * moves the snake according to its direction
     */
    move () {
        this.old_dir = this.direction;
        if (this.segments.length == 0)
            return;
        
        var old_head = this.segments[0];

        if (this.food > 0) {
            --this.food;
        } else {
            this.segments.pop();
        }

        var new_head = {
            x: old_head.x + this.direction.x,
            y: old_head.y + this.direction.y
        };

        this.segments.unshift(new_head);
    }

    draw_eyes(ctx, pos) {
        var center = {
            x: pos.x + Math.floor(GRID_SIZE / 2),
            y: pos.y + Math.floor(GRID_SIZE / 2)
        };

        var dir = this.direction;
        var offset = {
            x: -SNAKE_EYE_RADIUS,
            y: -SNAKE_EYE_RADIUS
        };
        var cw = posRotateCW(dir);
        var ccw = posRotateCCW(dir);
        var left_eye = posAdd(offset, posAdd(center, posScale(posAdd(ccw, dir), SNAKE_EYE_RADIUS + 1)));
        var right_eye = posAdd(offset, posAdd(center, posScale(posAdd(cw, dir), SNAKE_EYE_RADIUS + 1)));

        ctx.fillRect(left_eye.x, left_eye.y, SNAKE_EYE_RADIUS * 2, SNAKE_EYE_RADIUS * 2);
        ctx.fillRect(right_eye.x, right_eye.y, SNAKE_EYE_RADIUS * 2, SNAKE_EYE_RADIUS * 2);
    }

    /**
     * Draws the snake to the canvas
     * @param {CanvasRenderingContext2D} ctx - the canvas context
     */
    draw (ctx) {
        ctx.fillStyle = 'lightblue';
        ctx.strokeStyle = 'darkblue';
        this.segments.forEach((segment, idx) => {
            
            ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            ctx.strokeRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            if (idx === 0) {
                ctx.fillStyle = 'darkblue';
                this.draw_eyes(ctx, posScale(segment, GRID_SIZE));
                ctx.fillStyle = 'lightblue';
            }
        }, this);
    }

    is_self_colliding () {
        let segments = this.segments;
        for (var i = 0; i < this.segments.length; ++i) {
            if (this.segments.slice(i + 1).some(function (segment) {
                return segment.x === segments[i].x && segment.y === segments[i].y;
            })) {
                return true;
            }
        }
        return false;
        
    }

    out_of_bounds(width, height) {
        return this.segments.some(function (segment) {
            return !(
                0 <= segment.x && segment.x < width
             && 0 <= segment.y && segment.y < height
            );
        });
    }

    on_wrong_answer() {
        this.segments = this.segments.slice(0, -SNAKE_WRONG_ANSWER_PENALTY);
    }

    static create(starting_pos, starting_length, starting_direction) {
        var segments = [];
        var dir = {
            x: starting_direction[0],
            y: starting_direction[1]
        };
        var pos = {
            x: starting_pos[0],
            y: starting_pos[1]
        };

        range(starting_length).forEach(() => {
            segments.push(pos);
            pos = {
                x: pos.x - dir.x,
                y: pos.y - dir.y
            };
        });

        return new Snake(segments, dir);
    }
}

class QSnakeGame {
    constructor (deck, width, height, bg_color, border_color) {
        this.deck = deck;
        this.width = width;
        this.height = height;
        this.cards = [];
        this.bg_color = bg_color;
        this.border_color = border_color;
        this.score = SNAKE_START_LENGTH;
    }

    on_start () {
        this.snake = Snake.create([Math.floor(GRID_WIDTH / 2), Math.floor(GRID_HEIGHT / 2)], SNAKE_START_LENGTH, [1, 0]);
        this.spawn_cards(CARDS_TO_SPAWN);
        
        document.addEventListener('keypress', evt => this.on_keypress(evt));
    }
    
    on_keypress (evt) {
        if (!this.snake) {
            return;
        }

        var char_code = evt.charCode || evt.which;
        var char_str = String.fromCharCode(char_code);
        var new_dir;

        if (char_str == 'w') {
            new_dir = {x: 0, y: -1};
        } else if (char_str == 'a') {
            new_dir = {x: -1, y: 0};
        } else if (char_str == 's') {
            new_dir = {x: 0, y: 1};
        } else if (char_str == 'd') {
            new_dir = {x: 1, y: 0};
        } else {
            return;
        }
        if (new_dir !== this.snake.direction) {
            this.snake.turn(new_dir);
        }
    }

    /**
     * Places a card on the grid
     * 
     * Params:
     *  card - the card object to place ({word:..., def:...})
     *  isTarget - whether or not this card is a target card
     *  max_attempts - how many attempts to not get the card near the head or in its body
     */
    place_card(card, isTarget) {  // uses snake parameter to check whether card is inside snake or too close to its head
        var position;
        var attempts = 0;
        var max_attempts = 1000;
        var new_card;
        var valid_spot = false;
        do {
            position = {x: randRange(0, GRID_WIDTH), y: randRange(0, GRID_HEIGHT)};
            valid_spot = (
                !(posDist(position, this.snake.segments[0]) < CARD_MIN_DIST_SNAKE) &&  // Word isn't too close to the snake's head
                !(position.y < CARD_MIN_DIST_TOP) &&  // Word isn't too close to the top
                !(position.x < CARD_MIN_DIST_SIDES || position.x >= GRID_WIDTH - CARD_MIN_DIST_SIDES) &&  // Word isn't too close to the sides
                !(this.cards.some(existing_card => posDist(position, existing_card.pos) < CARD_MIN_DIST_OTHER)) && // Word isn't too close to another word
                !(this.snake.segments.some(segment => posEqual(segment, position))));  // Word isn't in snake
            
        } while (++attempts < max_attempts && !valid_spot);
        if (valid_spot) {
            new_card = {
                word: card.word,
                def: card.def,
                pos: position,
                isTarget: isTarget
            };
            this.cards.push(new_card);
        }
    }

    update_def(card, score) {  // Update definition in the side panel with the definition of the card
        document.getElementById("qsnake-score-string").innerText = `Your score: ${score}`
        document.getElementById("qsnake-def-string").innerText = `Your definition is: ${card.def}`
    }

    spawn_cards(count) {  // generates count number of cards and returns one as the correct card
        this.cards = []
        var sample = _.sampleSize(this.deck.cards, count);
        sample.forEach((card, idx) => {
            this.place_card(card, idx === 0);
        }, this);
        this.update_def(sample[0], this.score);
    }

    draw_cards (ctx) {  // renders cards
        let center;
        this.cards.forEach(card => {
            center = {
                x: card.pos.x * GRID_SIZE + Math.floor(GRID_SIZE / 2),
                y: card.pos.y * GRID_SIZE + Math.floor(GRID_SIZE / 2)
            }
            ctx.fillStyle = 'rgb(255, 0, 0)';
            ctx.strokeStyle = 'rgb(127, 0, 0)';
            ctx.fillRect(card.pos.x * GRID_SIZE, card.pos.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            ctx.strokeRect(card.pos.x * GRID_SIZE, card.pos.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            ctx.fillSyle = TEXT_WORD_COLOR;
            ctx.font = "30px Roboto";
            ctx.textAlign = "center";

            ctx.fillText(card.word, center.x, center.y + TEXT_OFFSET);
        });
    }

    collect_cards() {
        var snakeHead = this.snake.segments[0];
        var card = this.cards.find(card_ => posEqual(card_.pos, snakeHead));
        if (!card) {
            return;
        }

        if (card.isTarget) {
            this.snake.food++;
            this.score++;
            this.spawn_cards(CARDS_TO_SPAWN);
        } else {
            this.score = Math.max(0, this.score - SNAKE_WRONG_ANSWER_PENALTY);
            this.cards = _.filter(this.cards, card_ => !posEqual(card_.pos, snakeHead));
            this.snake.on_wrong_answer();
            this.update_def(this.cards[0], this.score);
        }
    }

    on_step (ctx) {
        this.snake.move();
        if (this.check_collisions()) {
            return false;
        }
        this.collect_cards();
        if (this.snake.segments.length === 0) {
            return false;
        }
        draw_canvas_bg(ctx, ACTIVE_CANVAS_BG_COLOR, ACTIVE_CANVAS_BORDER_COLOR);
        this.snake.draw(ctx);
        this.draw_cards(ctx);
        return true;
    }

    on_end () {
        document.removeEventListener('keypress', evt => this.on_keypress(evt));
    }

    check_collisions () {
        return this.snake.is_self_colliding() || this.snake.out_of_bounds(GRID_WIDTH, GRID_HEIGHT);
    }

    is_done() {
        return this.check_collisions();
    }
}

// #region Helper functions
function posRotateCW(pos) {
    return {x: -pos.y, y: pos.x};
}

function posRotateCCW(pos) {
    return {x: pos.y, y: -pos.x};
}

function posScale(pos, factor) {
    return {x: pos.x * factor, y: pos.y * factor};
}

function posAdd(a, b) {
    return {x: a.x + b.x, y: a.y + b.y};
}

function posEqual(a, b) {
    return a.x == b.x && a.y == b.y;
}

function posDist(a, b) {
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function randRange(min, max) {  // generate integer on interval [min, max)
    return Math.floor(Math.random() * (max - min) + min);
}

function randInt(min, max) {  // generate integer between min and max inclusive
    return randRange(min, max + 1);
}
// #endregion

function game_loop (game, ctx) {
    if (!game.on_step(ctx)) {
        display_end(game.score);
        document.addEventListener('keypress', start_game_on_enter);
        return;
    }
    setTimeout(() => game_loop(game, ctx), 100);
}

function draw_canvas_bg(ctx, bg_color, border_color) {
    ctx.fillStyle = bg_color;
    ctx.strokeStyle = border_color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(-5, -5, canvas.width + 5, canvas.height + 5);

}

function display_start() {
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        draw_canvas_bg(ctx, INACTIVE_CANVAS_BG_COLOR, INACTIVE_CANVAS_BORDER_COLOR);
        ctx.font = "30px Roboto";
        ctx.textAlign = "center";
        ctx.fillStyle = TEXT_START_COLOR;
        ctx.fillText("Press enter to start", Math.round(canvas.width / 2), 50);
    }
}

function display_end(final_score) {
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        draw_canvas_bg(ctx, CANVAS_GAMEOVER_BG_COLOR, CANVAS_GAMEOVER_BORDER_COLOR);
        ctx.font = "30px Roboto";
        ctx.textAlign = "center";
        ctx.fillStyle = TEXT_START_COLOR;
        ctx.fillText(`Game over! Your final score was ${final_score}`, Math.round(canvas.width / 2), 50);
    }
}

function do_game() {
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        GRID_WIDTH = canvas.width / GRID_SIZE;
        GRID_HEIGHT = canvas.height / GRID_SIZE;

        var game = new QSnakeGame(test_deck, canvas.width, canvas.height, 'rgb(127, 127, 127)', 'rgb(0, 0, 0)');
        game.on_start();
        game_loop(game, ctx);
        return game.score;
    }
}

function start_game_on_enter(evt) {
    if(evt.code === 'Enter') {
        document.removeEventListener('keypress', start_game_on_enter);
        do_game();
    }
}

function main () {
    display_start();
    document.addEventListener('keypress', start_game_on_enter);
}

main();