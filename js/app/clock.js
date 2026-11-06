export class Countdown {
  constructor(seconds) {
    this.left = seconds;
    this.handle = null;
  }

  run(onTick, onDone) {
    this.stop();
    this.handle = setInterval(() => {
      this.left -= 1;
      if (this.left <= 0) {
        this.stop();
        onDone();
        return;
      }
      onTick(this.left);
    }, 1000);
  }

  stop() {
    if (this.handle === null) return;
    clearInterval(this.handle);
    this.handle = null;
  }
}
