const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 430;

// This is a Phaser 3 application.
class ColorMixingGame extends Phaser.Scene {
  // A level consists of a target color and a list of colors that can be emitted
  LEVELS = [
    // color names from https://colors.artyclick.com/color-name-finder/
    {
      // mango orange
      targetColor: 0xff793f,
      colorsToEmit: ["cyan", "magenta", "yellow"],
    },
    {
      // muesli
      targetColor: 0xa7845f,
      colorsToEmit: ["cyan", "magenta", "yellow"],
    },
    {
      // light plum
      targetColor: 0xa35f7a,
      colorsToEmit: ["cyan", "magenta", "yellow"],
    },
    {
      // yellowy green
      targetColor: 0xc2ec16,
      colorsToEmit: ["cyan", "magenta", "yellow"],
    },
    {
      // fuchsia blue
      targetColor: 0x714cb3,
      colorsToEmit: ["cyan", "magenta", "yellow"],
    }
  ];

  CURRENT_LEVEL = Math.floor(Math.random()*this.LEVELS.length);

  BALL_SCALE = 0.6;
  BEAKER_GLASS_THICKNESS = 10;
  BEAKER_WIDTH = 200;
  BEAKER_HEIGHT = 300;

  MIXING_COLORS = {
    cyan: 0x00b7eb,
    magenta: 0xff0090,
    yellow: 0xffef00,
    black: 0x000000,
    white: 0xffffff,
  };
  DISPLAY_COLORS = {
    ...this.MIXING_COLORS,
    black: 0x444444,
  };
  balls = [];
  liquidHeight = 0.01;

  colorMixingTally = {
    cyan: 0,
    magenta: 0,
    yellow: 0,
    black: 0,
    white: 0,
  };
  colorMixingTotal = 0;

  preload() {
    // this.load.setBaseURL('https://cdn.phaserfiles.com/v385');
    this.load.image("ball", "./pangball_lightgray.png");
  }

  createGauge() {
    var gaugeOpts = {
      angle: 0.1, // The span of the gauge arc
      lineWidth: 0.15, // The line thickness
      radiusScale: 0.5, // Relative radius
      pointer: {
        length: 0.6, // // Relative to gauge radius
        strokeWidth: 0.035, // The thickness
        color: "#000000", // Fill color
      },
      limitMax: true, // If false, max value increases automatically if value > maxValue
      limitMin: true, // If true, the min value of the gauge will be fixed
      highDpiSupport: true, // High resolution support
      staticZones: [
        { strokeStyle: "#F03E3E", min: 0, max: 95 }, // Red from 100 to 130
        { strokeStyle: "#30B32D", min: 95, max: 100 }, // Green
      ],
    };
    var target = document.getElementById("foo"); // your canvas element
    var gauge = new Gauge(target).setOptions(gaugeOpts); // create gauge!
    gauge.maxValue = 100; // set max gauge value
    gauge.setMinValue(0); // Prefer setter over gauge.minValue = 0
    gauge.animationSpeed = 32; // set animation speed (32 is default value)

    this.gauge = gauge;
    this.setGaugeValue(0);
  }

  setGaugeValue(value) {
    if(value >= 99) {
      this.gauge.set(100);
    } else{
      this.gauge.set(Math.max(2.5, Math.ceil(value/5)*5-2.5));
    }
  }

  create() {
    this.createGauge();

    this.matter.world.setBounds(0, 0, 800, 600, 32, true, true, false, true);

    //  Add in a stack of balls

    for (let i = 0; i < 0; i++) {
      // // Create a ball with a random position and with a solid color (no image texture)
      // const x = Phaser.Math.Between(100, 700);
      // const y = Phaser.Math.Between(100, 500);
      // const ball = this.matter.add.image(x, y, 'ball', null, { restitution: 1, friction: 0, density: 0.01 });

      // // Set the color of the ball
      // ball.setTint(Phaser.Display.Color.RandomRGB().color);

      // // Set the size of the ball
      // ball.setScale(Phaser.Math.FloatBetween(0.5, 1.5));

      // // Set the angle of the ball
      // ball.setAngle(Phaser.Math.Between(0, 360));

      // // Set the ball to be interactive
      // ball.setInteractive();

      // // Set the ball to be draggable
      // this.input.setDraggable(ball);

      // const ball = this.matter.add.image(Phaser.Math.Between(100, 700), Phaser.Math.Between(-600, 0), 'ball');
      const ball = this.matter.add.image(
        Phaser.Math.Between(
          CANVAS_WIDTH / 2 - this.BEAKER_WIDTH / 4,
          CANVAS_WIDTH / 2 + this.BEAKER_WIDTH / 4
        ),
        Phaser.Math.Between(-2000, 0),
        "ball"
      );
      ball.setCircle();
      ball.setFriction(0.005);
      ball.setBounce(0.01);

      // pick a random color between cyan, magenta, yellow, black, and white
      const color = Phaser.Utils.Array.GetRandom(
        Object.values(this.DISPLAY_COLORS)
      );
      ball.setTint(color);

      // make the ball a bit smaller
      ball.setScale(this.BALL_SCALE);

      this.balls.push(ball);
    }
    this.wallLeft = this.add.rectangle(
      CANVAS_WIDTH / 2 - this.BEAKER_WIDTH / 2,
      CANVAS_HEIGHT - this.BEAKER_HEIGHT / 2,
      this.BEAKER_GLASS_THICKNESS,
      this.BEAKER_HEIGHT,
      0x000000
    );
    this.matter.add.gameObject(this.wallLeft);
    this.wallLeft.setStatic(true);

    this.wallLeft = this.add.rectangle(
      CANVAS_WIDTH / 2 + this.BEAKER_WIDTH / 2,
      CANVAS_HEIGHT - this.BEAKER_HEIGHT / 2,
      this.BEAKER_GLASS_THICKNESS,
      this.BEAKER_HEIGHT,
      0x000000
    );
    this.matter.add.gameObject(this.wallLeft);
    this.wallLeft.setStatic(true);

    this.wallBottom = this.add.rectangle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - this.BEAKER_GLASS_THICKNESS / 2,
      this.BEAKER_WIDTH,
      this.BEAKER_GLASS_THICKNESS,
      0x000000
    );
    this.matter.add.gameObject(this.wallBottom);
    this.wallBottom.setStatic(true);

    this.liquid = this.add.rectangle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - this.BEAKER_GLASS_THICKNESS,
      this.BEAKER_WIDTH - this.BEAKER_GLASS_THICKNESS,
      this.liquidHeight,
      0x0000ff
    );
    this.matter.add.gameObject(this.liquid);
    this.liquid.setStatic(true);

    // this.glass = this.add.rectangle(CANVAS_WIDTH/2, CANVAS_HEIGHT - this.BEAKER_HEIGHT/2, this.BEAKER_WIDTH - this.BEAKER_GLASS_THICKNESS, this.BEAKER_HEIGHT - this.BEAKER_GLASS_THICKNESS*2, 0xffffff);
    // this.glass.setAlpha(0.5);

    this.add.text(16, 16, "Chroma\nChemist\nChameleon", {
      font: "18px monospace",
      fill: "#000000",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff",
    });

    // this.add.text(16, 105, '"An elegant\nsolution"', {
    //   font: "11px monospace",
    //   fill: "#000000",
    //   padding: { x: 20, y: 10 },
    //   backgroundColor: "#ffffff",
    // });

    this.add.text(16, CANVAS_HEIGHT - 150, "Target Color:", {
      font: "14px monospace",
      fill: "#000000",
      padding: { x: 2, y: 10 },
      backgroundColor: "#ffffff",
    });

    this.targetColorSwatch = this.add.rectangle(
      (CANVAS_WIDTH / 2 -
        this.BEAKER_WIDTH / 2 -
        this.BEAKER_GLASS_THICKNESS / 2) /
        2,
      CANVAS_HEIGHT - 75,
      CANVAS_WIDTH / 2 -
        this.BEAKER_WIDTH / 2 -
        this.BEAKER_GLASS_THICKNESS / 2 -
        this.BEAKER_GLASS_THICKNESS * 4,
      75,
      this.LEVELS[this.CURRENT_LEVEL].targetColor
    );

    document.getElementById("cyan-btn").addEventListener("click", () => {
      this.emitColorBalls([this.DISPLAY_COLORS.cyan]);
    });
    document.getElementById("magenta-btn").addEventListener("click", () => {
      this.emitColorBalls([this.DISPLAY_COLORS.magenta]);
    });
    document.getElementById("yellow-btn").addEventListener("click", () => {
      this.emitColorBalls([this.DISPLAY_COLORS.yellow]);
    });
    document.getElementById("black-btn").addEventListener("click", () => {
      this.emitColorBalls([this.DISPLAY_COLORS.black]);
    });
    document.getElementById("white-btn").addEventListener("click", () => {
      this.emitColorBalls([this.DISPLAY_COLORS.white]);
    });
  }

  update() {
    this.handleInput();

    if (this.liquid.height < this.liquidHeight) {
      this.liquid.height += 1;
      this.liquid.y -= 1;
    }

    // Check if each of the balls is within the bounds of the game based on the y-axis
    // If not, destroy the ball
    for (let i = this.balls.length - 1; i >= 0; i--) {
      // iterate backwards to avoid skipping elements after splice
      const ball = this.balls[i];
      if (ball.y + ball.height / 2 >= this.liquid.y) {
        // ball.setScale(0.3);
        // console.log(ball);

        this.colorMixingTotal += 1;
        if (ball.tint === this.DISPLAY_COLORS.cyan) {
          this.colorMixingTally.cyan += 1;
        } else if (ball.tint === this.DISPLAY_COLORS.magenta) {
          this.colorMixingTally.magenta += 1;
        } else if (ball.tint === this.DISPLAY_COLORS.yellow) {
          this.colorMixingTally.yellow += 1;
        } else if (ball.tint === this.DISPLAY_COLORS.black) {
          this.colorMixingTally.black += 1;
        } else if (ball.tint === this.DISPLAY_COLORS.white) {
          this.colorMixingTally.white += 1;
        }

        ball.destroy();
        this.balls.splice(i, 1);

        // console.log(this.liquid);
        this.liquidHeight += 0.4;
        console.log("0x" + this.getMixedColor().toString(16));
        this.liquid.fillColor = this.getMixedColor();

        document.getElementById("percentage-match").innerText =
          this.getPercentageMatch(this.LEVELS[this.CURRENT_LEVEL].targetColor);
        this.setGaugeValue(this.getPercentageMatch(this.LEVELS[this.CURRENT_LEVEL].targetColor));


        // const body = ball;
        // Body.applyForce(body, body.position, {
        //     x: -gravity.x * gravity.scale * body.mass,
        //     y: -gravity.y * gravity.scale * body.mass
        // });
      }
    }
  }

  getMixedColor() {
    const proportions = {
      cyan: this.colorMixingTally.cyan / this.colorMixingTotal,
      magenta: this.colorMixingTally.magenta / this.colorMixingTotal,
      yellow: this.colorMixingTally.yellow / this.colorMixingTotal,
      black: this.colorMixingTally.black / this.colorMixingTotal,
      white: this.colorMixingTally.white / this.colorMixingTotal,
    };

    //   MULTI-COLOR MIXING
    // Turn the RGB values of the mixing colors into latent vectors
    var z1 = mixbox.rgbToLatent(this.MIXING_COLORS.cyan);
    var z2 = mixbox.rgbToLatent(this.MIXING_COLORS.magenta);
    var z3 = mixbox.rgbToLatent(this.MIXING_COLORS.yellow);
    var z4 = mixbox.rgbToLatent(this.MIXING_COLORS.black);
    var z5 = mixbox.rgbToLatent(this.MIXING_COLORS.white);
    // Now, interpolate the latent vectors to get the latent vector of the mix
    var zMix = new Array(mixbox.LATENT_SIZE);
    for (var i = 0; i < zMix.length; i++) {
      // mix:
      zMix[i] =
        proportions.cyan * z1[i] +
        proportions.magenta * z2[i] +
        proportions.yellow * z3[i] +
        proportions.black * z4[i] +
        proportions.white * z5[i];
    }
    // Finally, convert the latent vector of the mix back to an RGB value
    var rgbMix = mixbox.latentToRgb(zMix);
    return (rgbMix[0] << 16) | (rgbMix[1] << 8) | rgbMix[2];
  }

  getPercentageMatch(targetColor) {
    const mixedColor = this.getMixedColor();
    const targetColorRGB = Phaser.Display.Color.IntegerToRGB(targetColor);
    const mixedColorRGB = Phaser.Display.Color.IntegerToRGB(mixedColor);
    // const deltaR = Math.abs(targetColorRGB.r - mixedColorRGB.r);
    // const deltaG = Math.abs(targetColorRGB.g - mixedColorRGB.g);
    // const deltaB = Math.abs(targetColorRGB.b - mixedColorRGB.b);
    // return 1 - (deltaR + deltaG + deltaB) / 765;

    const percent =
      100 -
      100 *
        (this.getColorDistance(targetColorRGB, mixedColorRGB) /
          this.getColorDistance(
            { r: 255, g: 255, b: 255 },
            { r: 0, g: 0, b: 0 }
          ));
    return Math.max(0, percent);
  }

  // Color distance formula from https://www.compuphase.com/cmetric.htm
  getColorDistance(e1, e2) {
    const rmean = (e1.r + e2.r) / 2;
    const r = e1.r - e2.r;
    const g = e1.g - e2.g;
    const b = e1.b - e2.b;
    return Math.sqrt(
      (((512 + rmean) * r * r) >> 8) +
        4 * g * g +
        (((767 - rmean) * b * b) >> 8)
    );
  }

  emitColorBalls(colorsToEmit) {
    for (const color of colorsToEmit) {
      for (let i = 0; i < 10; i++) {
        // const ball = this.matter.add.image(
        //   Phaser.Math.Between(100, 700),
        //   Phaser.Math.Between(100, 500),
        //   "ball"
        // );
        const ball = this.matter.add.image(
          Phaser.Math.Between(
            CANVAS_WIDTH / 2 - this.BEAKER_WIDTH / 4,
            CANVAS_WIDTH / 2 + this.BEAKER_WIDTH / 4
          ),
          Phaser.Math.Between(-100, 0),
          "ball"
        );
        ball.setCircle();
        ball.setFriction(0.005);
        ball.setBounce(0.01);
        ball.setTint(color);
        ball.setScale(this.BALL_SCALE);
        this.balls.push(ball);
      }
    }
  }

  handleInput() {
    // If the user presses the y button, create a yellow ball, and so on.
    const colorsToEmit = [];
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey("Y"))) {
      colorsToEmit.push(this.DISPLAY_COLORS.yellow);
    }
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey("M"))) {
      colorsToEmit.push(this.DISPLAY_COLORS.magenta);
    }
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey("C"))) {
      colorsToEmit.push(this.DISPLAY_COLORS.cyan);
    }
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey("B"))) {
      colorsToEmit.push(this.DISPLAY_COLORS.black);
    }
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey("W"))) {
      colorsToEmit.push(this.DISPLAY_COLORS.white);
    }

    this.emitColorBalls(colorsToEmit);
  }
}

const config = {
  type: Phaser.AUTO,
  // zoom: 0.5,
  autoFocus: false,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: "#eeeeee",
  parent: "game-container",
  physics: {
    default: "matter",
    matter: {
      enableSleeping: true,
    },
  },
  scene: ColorMixingGame,
  // scale: {
  //     mode: Phaser.Scale.NONE, // we will resize the game with our own code (see Boot.js)
  //     width: CANVAS_WIDTH * window.devicePixelRatio, // set game width by multiplying window width with devicePixelRatio
  //     height: CANVAS_HEIGHT * window.devicePixelRatio, // set game height by multiplying window height with devicePixelRatio
  //     zoom: 1 / window.devicePixelRatio // Set the zoom to the inverse of the devicePixelRatio
  // },
};

const game = new Phaser.Game(config);
