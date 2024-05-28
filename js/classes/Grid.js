class Grid {
  constructor() {
    this.position = {
      x: 0,
      y: 0
    };

    this.velocity = {
      x: 3,
      y: 0
    };

    this.invaders = [];

    const columns = Math.floor(Math.random() * 10 + 5);
    const rows = Math.floor(Math.random() * 5 + 2);

    this.width = columns * 30;
    
    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        this.invaders.push(
          new Invaders({
            position: {
              x: x * 30,
              y: y * 30
            }
          })
        );
      }
    }
  }
}
