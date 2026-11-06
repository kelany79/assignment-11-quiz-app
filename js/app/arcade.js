import { settings } from './settings.js';
import { AudioBoard } from './audio.js';
import { TriviaSource } from './source.js';
import { Match } from './match.js';
import { RecordBook } from './records.js';
import { RoundPlay } from './play.js';
import { Screen } from '../view/screen.js';
import { SetupDesk } from '../view/desk.js';

export class Arcade {
  constructor() {
    this.form = document.getElementById('quizOptions');
    this.stage = document.querySelector('.questions-container');
    this.desk = new SetupDesk(this.form);
    this.screen = new Screen(this.stage);
    this.audio = new AudioBoard();
    this.source = new TriviaSource();
    this.records = new RecordBook(settings.recordsKey, settings.recordLimit);
    this.match = null;
    this.busy = false;
  }

  mount() {
    this.desk.launch.addEventListener('click', () => this.launch());
    this.form.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      this.launch();
    });
  }

  async launch() {
    if (this.busy) return;
    this.form.querySelector('.form-error')?.remove();
    const check = this.desk.validate();
    if (!check.ok) {
      this.desk.flash(check.reason);
      return;
    }

    this.audio.arm();
    const profile = this.desk.profile();
    this.match = new Match(profile);
    this.busy = true;
    this.form.classList.add('hidden');
    this.screen.loading();

    try {
      this.match.load(await this.source.pull(profile));
      this.screen.clear();
      this.present();
    } catch (error) {
      this.screen.fault(error.message || 'Failed to load questions. Please try again.', () => this.home());
    } finally {
      this.busy = false;
    }
  }

  present() {
    if (this.match.done) {
      this.finish();
      return;
    }
    new RoundPlay({
      match: this.match,
      mount: this.stage,
      audio: this.audio,
      onAdvance: () => this.present(),
    }).open();
  }

  finish() {
    this.audio.play('finale');
    const percentage = this.match.ratio;
    const isRecord = this.records.qualifies(percentage);
    if (isRecord) {
      this.records.commit({
        name: this.match.profile.name,
        score: this.match.points,
        total: this.match.total,
        percentage,
        difficulty: this.match.profile.difficulty,
        date: new Date().toLocaleDateString(),
      });
    }
    this.screen.finale(this.match, this.records.list(), isRecord, () => this.home());
  }

  home() {
    this.screen.clear();
    this.desk.restore();
    this.match = null;
  }
}
