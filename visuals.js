function generateQueryConstructor(query) {
	for (const key in query) {
		this[key] = query[key];
	}
}

function randomNumber(from, to) {
	return Math.floor(Math.random() * (to + 1)) + from;
}

function randomInArray(arr) {
	const index = randomNumber(0, arr.length - 1);
	return arr[index];
}

const hexToRgb = (hex) =>
	hex
		.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
		.substring(1)
		.match(/.{2}/g)
		.map((x) => parseInt(x, 16));

const lorem12 = [
	'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Facere vitae ratione mollitia.',
	'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Exercitationem consequuntur quaerat suscipit',
	'Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi enim quas in?',
	'Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique facilis sed tempore.',
	'Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident ab minima cupiditate.',
	'Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis harum vero voluptas!',
	'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque maiores ad dicta.',
	'Lorem ipsum dolor sit amet consectetur adipisicing elit. At animi dolore molestiae.',
	'Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident ab minima cupiditate.',
	'Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis harum vero voluptas!',
	'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque maiores ad dicta.',
	'Lorem ipsum dolor sit amet consectetur adipisicing elit. At animi dolore molestiae.',
	'Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique facilis sed tempore.',
	'Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident ab minima cupiditate.',
	'Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis harum vero voluptas!',
];

const matrixCharacters = lorem12;

class MatrixEffect {
	constructor() {
		generateQueryConstructor.call(this, ...arguments);
	}
	get ctx() {
		if (this.canvas) {
			return this.canvas.getContext('2d');
		}
	}

	build() {
		this.#buildCanvas();
		this.#buildSymbols();
		this.#buildAnimation();
	}
	#buildCanvas() {
		const { canvas, settings } = this;

		if (canvas) {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			this.totalColumns = Math.round(canvas.width / settings.columnSize);
		}
	}
	#buildSymbols() {
		if (this.canvas) {
			this.symbols = [...new Array(this.totalColumns)].map((_, index) => {
				const randomY = randomNumber(0, Math.round(this.canvas.height / this.settings.columnSize));

				// const randomX = randomNumber(0, Math.round(this.canvas.width / this.settings.columnSize));

				const matrixSymbolSettings = {
					matrixEffect: this,
					text: randomInArray(matrixCharacters),
					x: index,
					y: randomY,
				};
				return new MatrixSymbol(matrixSymbolSettings);
			});
		}
	}
	#buildAnimation() {
		const { ctx } = this;
		if (ctx) {
			ctx.font = `${this.settings.columnSize}px monospace`;
		}
	}

	/////

	startAnimation() {
		const matrixAnimation = new MatrixAnimation({ matrixEffect: this });
		matrixAnimation.animate();
	}
}

class MatrixAnimation {
	constructor() {
		generateQueryConstructor.call(this, ...arguments);
	}
	animate() {
		if (this.matrixEffect.ctx) {
			const { ctx, canvas, symbols, settings } = this.matrixEffect;

			ctx.fillStyle = `rgba( ${settings.backgroundColor}, 0.${settings.fadeOutEffect} )`;
			ctx.textAlign = 'center';

			ctx.fillRect(0, 0, canvas.width, canvas.height);

			symbols.forEach((symbol) => {
				symbol.draw(ctx);
			});

			setTimeout((_) => {
				requestAnimationFrame(this.animate.bind(this));
			}, settings.fallingSpeed);
		}
	}
}

class MatrixSymbol {
	constructor() {
		generateQueryConstructor.call(this, ...arguments);
	}
	draw() {
		const {
			canvas,
			ctx,
			settings: { columnSize, symbolsColors, animationSpeed },
		} = this.matrixEffect;

		ctx.fillStyle = symbolsColors;

		const xPos = this.x * columnSize;
		const yPos = this.y * columnSize;
		ctx.fillText(this.text, xPos, yPos);

		this.#resetText();
		this.#resetToTop({ xPos, yPos, canvas, animationSpeed });
	}
	#resetText() {
		this.text = randomInArray(matrixCharacters);
	}
	#resetToTop({ xPos, yPos, canvas, animationSpeed }) {
		const delayCondition = Math.random() > 0.999;
		this.y = yPos > canvas.height && delayCondition ? 0 : this.y + animationSpeed;
		// this.x = xPos > canvas.width && delayCondition ? 0 : this.x + 0.2;
	}
}
const canvas = document.getElementsByTagName('canvas')[0];
const controller = document.querySelector('#controller');

const animationSpeedInput = document.querySelector('#animation-speed');
const fallingSpeedInput = document.querySelector('#falling-speed');
const fadeOutEffectInput = document.querySelector('#fadeout-effect');
const columnSizeInput = document.querySelector('#column-size');
const symbolsColorInput = document.querySelector('#symbols-color');
const backgroundColorInput = document.querySelector('#background-color');
const ok = document.querySelector('#ok-btn');

controller.addEventListener('change', (e) => {
	const animSpeed = 1500 - parseInt(animationSpeedInput.value);
	const fallSpeed = parseInt(fallingSpeedInput.value) / 10;
	const fadeOut = parseInt(fadeOutEffectInput.value);
	const colSize = parseInt(columnSizeInput.value);
	const symColor = `${symbolsColorInput.value}`;
	const bgColor = `${hexToRgb(backgroundColorInput.value)}`;

	matrixEffect.settings.animationSpeed = fallSpeed;
	matrixEffect.settings.fallingSpeed = animSpeed;
	matrixEffect.settings.fadeOutEffect = fadeOut;
	matrixEffect.settings.columnSize = colSize;
	matrixEffect.settings.symbolsColors = symColor;
	matrixEffect.settings.backgroundColor = bgColor;
});

canvas.addEventListener('click', (e) => {
	e.preventDefault(true);
	controller.classList.remove('hide');
});

ok.addEventListener('click', (e) => {
	e.preventDefault(true);
	controller.classList.add('hide');
});

const matrixEffect = new MatrixEffect({
	canvas,
	settings: {
		animationSpeed: parseInt(fallingSpeedInput.value) / 10,
		columnSize: parseInt(columnSizeInput.value),
		symbolsColors: `${symbolsColorInput.value}`,
		fadeOutEffect: parseInt(fadeOutEffectInput.value),
		fallingSpeed: 1500 - parseInt(animationSpeedInput.value),
		backgroundColor: `${hexToRgb(backgroundColorInput.value)}`,
	},
});

matrixEffect.build();
matrixEffect.startAnimation();
