const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let raf;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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

	gravityInput.value = gravity;
	sizeInput.value = fireworkSize;
	delayInput.value = fireworkDelay;
	explodeToggle.checked = mouseExplode;
});

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
});

class Firework {
	constructor(x, y, velocity) {
		this.x = x;
		this.y = y;
		this.velocity = velocity;
		this.color = [rand(0, 255), rand(0, 255), rand(0, 255)];
		this.alpha = 1;
		this.addSize = 0;
	}

	draw() {
		ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.alpha})`;
		ctx.beginPath();
		ctx.arc(this.x, this.y, fireworkSize + this.addSize, 0, 2 * Math.PI);
		ctx.fill();
	}

	update() {
		if (this.explode) {
			this.alpha -= 0.07;
			this.addSize += 10;
			createSubFireworks(this.x, this.y, this.color);
		}

		if (this.alpha <= 0) {
			fireworks.splice(fireworks.indexOf(this), 1);
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
	}

	draw() {
		ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.alpha})`;
		ctx.beginPath();
		ctx.arc(this.x, this.y, fireworkSize / 2, 0, 2 * Math.PI);
		ctx.fill();
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

window.addEventListener('mousemove', (e) => {
	mouseX = e.clientX;
	mouseY = e.clientY;
});

let delta = 0;
function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (mouseExplode) {
		ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
		ctx.beginPath();
		ctx.arc(mouseX, mouseY, 50, 0, 2 * Math.PI);
		ctx.fill();
	}

	if (delta >= fireworkDelay * 60) {
		fireworks.push(
			new Firework(
				Math.floor(Math.random() * canvas.width),
				canvas.height,
				rand(fireworkVelocity / 2, fireworkVelocity)
			)
		);
		delta = 0;
	}

	delta += 1;

	for (let firework of fireworks) {
		firework.draw();
		firework.update();
	}

	for (let firework of subFireworks) {
		firework.draw();
		firework.update();
	}

	raf = window.requestAnimationFrame(animate);
}

raf = window.requestAnimationFrame(animate);

const rand = (min, max) => Math.random() * (max - min) + min;

window.addEventListener('resize', () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});
