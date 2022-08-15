const canvas = document.getElementById('canvas');
const app = new PIXI.Application({
	width: window.innerWidth,
	height: window.innerHeight,
	view: canvas
});

const fireworks = [];
const subFireworks = [];

const gravityInput = document.getElementById('gravity');
const velocityInput = document.getElementById('velocity');
const sizeInput = document.getElementById('size');
const reset = document.getElementById('reset');

let gravity = 0.2;
let fireworkVelocity = 18;
let fireworkSize = 15;
let mouseX = 0;
let mouseY = 0;

reset.addEventListener('click', () => {
	gravity = 0.2;
	fireworkVelocity = 18;
	fireworkSize = 15;

	gravityInput.value = gravity;
	velocityInput.value = fireworkVelocity;
	sizeInput.value = fireworkSize;
});

gravityInput.addEventListener('change', () => {
	gravity = Number(gravityInput.value);
});

velocityInput.addEventListener('change', () => {
	fireworkVelocity = Number(velocityInput.value);
});

sizeInput.addEventListener('change', () => {
	fireworkSize = Number(sizeInput.value);
});

const g = new PIXI.Graphics();
app.stage.addChild(g);

class Firework {
	constructor(x, y, velocity) {
		this.x = x;
		this.y = y;
		this.velocity = velocity;
		this.color = Math.floor(Math.random() * 0xffffff);
		this.alpha = 1;
		this.addSize = 0;
	}

	draw() {
		if (this.explode) {
			this.alpha -= 0.07;
			this.addSize += 10;
			createSubFireworks(this.x + Math.sin(this.addSize) * 5, this.y + Math.sin(this.addSize) * 5, this.color);
		}

		if (this.alpha <= 0) {
			fireworks.splice(fireworks.indexOf(this), 1);
		}

		g.beginFill(this.color, this.alpha);
		g.drawCircle(this.x, this.y, fireworkSize + this.addSize);
		g.endFill();
	}

	update() {
		if (!this.explode) {
			this.y -= this.velocity;
			this.velocity -= gravity;
		}

		const mouseTouch =
			mouseX + 50 >= this.x - fireworkSize &&
			mouseX - 50 <= this.x + fireworkSize &&
			mouseY + 50 >= this.y - fireworkSize &&
			mouseY - 50 <= this.y + fireworkSize;

		if (this.velocity <= 0 || this.y <= 0 || mouseTouch) {
			this.explode = true;
		}
	}
}

class SubFirework {
	constructor(x, y, hVelocity, vVelocity, color) {
		this.x = x;
		this.y = y;
		this.hVelocity = hVelocity;
		this.vVelocity = vVelocity;
		this.color = color;
		this.alpha = 1;
	}

	draw() {
		g.beginFill(this.color, this.alpha);
		g.drawCircle(this.x, this.y, fireworkSize / 2);
		g.endFill();
	}

	update() {
		this.x += this.hVelocity;
		this.y += this.vVelocity;
		this.alpha -= 0.015;

		if (this.hVelocity > 0) {
			this.hVelocity -= 0.1;
		} else {
			this.hVelocity += 0.1;
		}

		this.vVelocity += gravity;

		if (this.alpha <= 0) {
			subFireworks.splice(subFireworks.indexOf(this), 1);
		}
	}
}

const createSubFireworks = (x, y, color) => {
	subFireworks.push(
		new SubFirework(x, y, -fireworkVelocity / 2, -fireworkVelocity / 2, color),
		new SubFirework(x, y, -fireworkVelocity / 2, 0, color),
		new SubFirework(x, y, -fireworkVelocity / 2, fireworkVelocity / 2, color),
		new SubFirework(x, y, fireworkVelocity / 2, -fireworkVelocity / 2, color),
		new SubFirework(x, y, fireworkVelocity / 2, 0, color),
		new SubFirework(x, y, fireworkVelocity / 2, fireworkVelocity / 2, color),
		new SubFirework(x, y, -fireworkVelocity / 3, -fireworkVelocity / 3, color),
		new SubFirework(x, y, -fireworkVelocity / 3, 0, color),
		new SubFirework(x, y, -fireworkVelocity / 3, fireworkVelocity / 3, color),
		new SubFirework(x, y, fireworkVelocity / 3, -fireworkVelocity / 3, color),
		new SubFirework(x, y, fireworkVelocity / 3, 0, color),
		new SubFirework(x, y, fireworkVelocity / 3, fireworkVelocity / 3, color)
	);
};

app.renderer.plugins.interaction.on('pointermove', (e) => {
	mouseX = e.data.global.x;
	mouseY = e.data.global.y;
});

let delta = 0;
const animate = () => {
	g.clear();

	g.beginFill(0xffffff, 0.2);
	g.drawCircle(mouseX, mouseY, 50);

	if (delta > 1) {
		fireworks.push(
			new Firework(Math.floor(Math.random() * app.renderer.width), app.renderer.height, fireworkVelocity)
		);
		delta = 0;
	}

	delta += 0.012;

	for (let firework of fireworks) {
		firework.draw();
		firework.update();
	}

	for (let firework of subFireworks) {
		firework.draw();
		firework.update();
	}
};
app.ticker.add(animate);

window.addEventListener('resize', () => {
	app.renderer.resize(window.innerWidth, window.innerHeight);
});
