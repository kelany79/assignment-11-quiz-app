export class Match {
  constructor(profile) {
    this.profile = profile;
    this.points = 0;
    this.cursor = 0;
    this.rounds = [];
  }

  load(rounds) {
    this.rounds = rounds;
    if (!this.rounds.length) {
      throw new Error('No questions received from the API.');
    }
  }

  get active() {
    return this.rounds[this.cursor] || null;
  }

  get done() {
    return this.cursor >= this.rounds.length;
  }

  get total() {
    return this.rounds.length;
  }

  get ratio() {
    if (!this.total) return 0;
    return Math.round((this.points / this.total) * 100);
  }

  grant() {
    this.points += 1;
  }

  step() {
    this.cursor += 1;
  }
}
