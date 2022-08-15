const canvas = document.getElementById('canvas');
const app = new PIXI.Application({
	width: window.innerWidth,
	height: window.innerHeight,
	view: canvas,
	antialias: true
});

const fireworks = [];
const subFireworks = [];

const gravityInput = document.getElementById('gravity');
const sizeInput = document.getElementById('size');
const delayInput = document.getElementById('delay');
const explodeToggle = document.getElementById('explode');
const reset = document.getElementById('reset');

const fireworkVelocity = 18;
let gravity = Number(gravityInput.value);
let fireworkSize = Number(sizeInput.value);
let fireworkDelay = Number(delayInput.value);
let mouseExplode = explodeToggle.checked;
let mouseX = 0;
let mouseY = 0;

reset.addEventListener('click', () => {
	gravity = 0.2;
	fireworkSize = 15;
	fireworkDelay = 1;
	mouseExplode = false;

	if (!mouseExplode) {
		app.stage.removeChild(mouseCircle);
	} else {
		app.stage.addChild(mouseCircle);
	}

	gravityInput.value = gravity;
	sizeInput.value = fireworkSize;
	delayInput.value = fireworkDelay;
	explodeToggle.checked = mouseExplode;
});

const mouseCircle = new PIXI.Graphics();
if (mouseExplode) {
	app.stage.addChild(mouseCircle);
}

gravityInput.addEventListener('change', () => {
	gravity = Number(gravityInput.value);
});

sizeInput.addEventListener('change', () => {
	fireworkSize = Number(sizeInput.value);
});

delayInput.addEventListener('change', () => {
	fireworkDelay = Number(delayInput.value);
});

explodeToggle.addEventListener('change', () => {
	mouseExplode = explodeToggle.checked;

	if (!mouseExplode) {
		app.stage.removeChild(mouseCircle);
	} else {
		app.stage.addChild(mouseCircle);
	}
});

class Firework {
	constructor(x, y, velocity) {
		this.x = x;
		this.y = y;
		this.velocity = velocity;
		this.color = Math.floor(Math.random() * 0xffffff);
		this.alpha = 1;
		this.addSize = 0;
		this.g = new PIXI.Graphics();
		app.stage.addChild(this.g);
	}

	draw() {
		this.g.clear();
		this.g.beginFill(this.color, this.alpha);
		this.g.drawCircle(this.x, this.y, fireworkSize + this.addSize);
		this.g.endFill();
	}

	update() {
		if (this.explode) {
			this.alpha -= 0.07;
			this.addSize += 10;
			createSubFireworks(this.x, this.y, this.color);
		}

		if (this.alpha <= 0) {
			fireworks.splice(fireworks.indexOf(this), 1);
			app.stage.removeChild(this.g);
		}

		if (!this.explode) {
			this.y -= this.velocity;
			this.velocity -= gravity;
		}

		const mouseTouch =
			mouseX + 50 >= this.x - fireworkSize &&
			mouseX - 50 <= this.x + fireworkSize &&
			mouseY + 50 >= this.y - fireworkSize &&
			mouseY - 50 <= this.y + fireworkSize;

		if (this.velocity <= 0 || this.y <= 0 || (mouseTouch && mouseExplode)) {
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
		this.g = new PIXI.Graphics();
		app.stage.addChild(this.g);
	}

	draw() {
		this.g.clear();
		this.g.beginFill(this.color, this.alpha);
		this.g.drawCircle(this.x, this.y, fireworkSize / 2);
		this.g.endFill();
	}

	update() {
		this.x += this.hVelocity;
		this.y += this.vVelocity;
		this.alpha -= rand(0.02, 0.08);

		if (this.hVelocity > 0) {
			this.hVelocity -= 0.1;
		} else {
			this.hVelocity += 0.1;
		}

		this.vVelocity += gravity;

		if (this.alpha <= 0) {
			subFireworks.splice(subFireworks.indexOf(this), 1);
			app.stage.removeChild(this.g);
		}
	}
}

const createSubFireworks = (x, y, color) => {
	for (let i = 1; i <= 6; i++) {
		subFireworks.push(
			new SubFirework(x, y, -Math.sin(i) * 12, Math.sin(i) * 10, color),
			new SubFirework(x, y, Math.sin(i) * 12, Math.sin(i) * 10, color),
			new SubFirework(x, y, -Math.sin(i * 5) * 10, Math.sin(i) * 13, color),
			new SubFirework(x, y, Math.sin(i * 5) * 10, Math.sin(i) * 13, color),
			new SubFirework(x, y, Math.sin(i) * 15, 0, color)
		);
	}
};

app.renderer.plugins.interaction.on('pointermove', (e) => {
	mouseX = e.data.global.x;
	mouseY = e.data.global.y;
});

let delta = 0;
const animate = () => {
	mouseCircle.clear();
	mouseCircle.beginFill(0xffffff, 0.2);
	mouseCircle.drawCircle(mouseX, mouseY, 50);
	mouseCircle.endFill();

	if (delta > fireworkDelay) {
		fireworks.push(
			new Firework(
				Math.floor(Math.random() * app.renderer.width),
				app.renderer.height,
				rand(fireworkVelocity / 2, fireworkVelocity)
			)
		);
		delta = 0;
	}

	delta += 0.01;

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

const rand = (min, max) => Math.random() * (max - min) + min;

window.addEventListener('resize', () => {
	app.renderer.resize(window.innerWidth, window.innerHeight);
});
