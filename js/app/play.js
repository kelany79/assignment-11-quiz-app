import { settings } from './settings.js';
import { Countdown } from './clock.js';
import { icon, node } from '../view/nodes.js';

export class RoundPlay {
  constructor({ match, mount, audio, onAdvance }) {
    this.match = match;
    this.mount = mount;
    this.audio = audio;
    this.onAdvance = onAdvance;
    this.round = match.active;
    this.sealed = false;
    this.buttons = [];
    this.clock = new Countdown(settings.clock);
    this.onPick = (event) => this.choose(event.currentTarget);
    this.onKey = (event) => this.press(event);
  }

  open() {
    const total = this.match.total;
    const step = this.match.cursor + 1;
    const label = `${step}/${total}`;
    const progress = Math.round((step / total) * 100);
    const level = this.match.profile.difficulty;
    const mark = settings.marks[level] || 'fa-gauge-high';

    const card = node('div', { class: 'game-card question-card', role: 'region', 'aria-label': `Round ${label}` }, [
      node('div', { class: 'xp-bar-container' }, [
        node('div', { class: 'xp-bar-header' }, [
          node('span', { class: 'xp-label' }, [icon('fa-solid fa-bolt'), document.createTextNode(' Progress')]),
          node('span', { class: 'xp-value', text: `Round ${label}` }),
        ]),
        node('div', { class: 'xp-bar' }, [
          node('div', {
            class: 'xp-bar-fill',
            style: `width: ${progress}%`,
            role: 'progressbar',
            'aria-valuenow': String(progress),
            'aria-valuemin': '0',
            'aria-valuemax': '100',
          }),
        ]),
      ]),
      node('div', { class: 'stats-row' }, [
        node('div', { class: 'stat-badge category' }, [
          icon('fa-solid fa-bookmark'),
          node('span', { text: this.round.topic }),
        ]),
        node('div', { class: `stat-badge difficulty ${level}` }, [
          icon(`fa-solid ${mark}`),
          node('span', { text: level }),
        ]),
        node('div', { class: 'stat-badge timer', 'aria-live': 'polite', 'aria-label': 'Time remaining' }, [
          icon('fa-solid fa-stopwatch'),
          node('span', { class: 'timer-value', text: String(settings.clock) }),
          document.createTextNode('s'),
        ]),
        node('div', { class: 'stat-badge counter' }, [
          icon('fa-solid fa-gamepad'),
          node('span', { text: label }),
        ]),
      ]),
      node('h2', { class: 'question-text', id: 'questionText', text: this.round.prompt }),
      node(
        'div',
        { class: 'answers-grid', role: 'listbox', 'aria-labelledby': 'questionText' },
        this.round.options.map((choice, index) =>
          node('button', {
            class: 'answer-btn',
            type: 'button',
            role: 'option',
            'data-index': String(index),
            'data-answer': choice,
            'aria-label': `Answer ${index + 1}: ${choice}. Press ${index + 1} to select.`,
          }, [
            node('span', { class: 'answer-key', text: String(index + 1) }),
            node('span', { class: 'answer-text', text: choice }),
          ])
        )
      ),
      node('p', { class: 'keyboard-hint' }, [
        icon('fa-regular fa-keyboard'),
        document.createTextNode(` Press 1-${this.round.options.length} to select`),
      ]),
      node('div', { class: 'score-panel' }, [
        node('div', { class: 'score-item' }, [
          node('div', { class: 'score-item-label', text: 'Score' }),
          node('div', { class: 'score-item-value', text: String(this.match.points) }),
        ]),
      ]),
    ]);

    this.mount.replaceChildren(card);
    this.buttons = [...card.querySelectorAll('.answer-btn')];
    this.buttons.forEach((button) => button.addEventListener('click', this.onPick));
    document.addEventListener('keydown', this.onKey);
    this.clock.run((left) => this.tick(left), () => this.expire());
  }

  tick(left) {
    const readout = this.mount.querySelector('.timer-value');
    const badge = this.mount.querySelector('.stat-badge.timer');
    if (readout) readout.textContent = String(left);
    if (left > settings.hurryAt) return;
    badge?.classList.add('warning');
    this.audio.play('tick');
  }

  press(event) {
    if (!settings.keys.includes(event.key)) return;
    const button = this.buttons[Number(event.key) - 1];
    if (button) this.choose(button);
  }

  choose(button) {
    if (!button || !this.seal()) return;
    const right = this.round.holds(button.dataset.answer || '');
    this.buttons.forEach((item) => {
      if (item !== button) item.classList.add('disabled');
    });
    if (right) {
      button.classList.add('correct');
      this.match.grant();
      this.paintScore();
      this.audio.play('hit');
    } else {
      button.classList.add('wrong');
      this.markAnswer();
      this.audio.play('miss');
    }
    this.leave();
  }

  expire() {
    if (!this.seal()) return;
    const readout = this.mount.querySelector('.timer-value');
    if (readout) readout.textContent = '0';
    this.audio.play('expire');
    this.buttons.forEach((button) => {
      if (this.round.holds(button.dataset.answer || '')) button.classList.add('correct');
      else button.classList.add('disabled');
    });
    const panel = this.mount.querySelector('.score-panel');
    panel?.before(
      node('div', { class: 'time-up-message' }, [
        icon('fa-solid fa-clock'),
        document.createTextNode(" TIME'S UP!"),
      ])
    );
    this.leave();
  }

  markAnswer() {
    this.buttons.forEach((button) => {
      if (!this.round.holds(button.dataset.answer || '')) return;
      button.classList.remove('disabled');
      button.classList.add('correct-reveal');
    });
  }

  paintScore() {
    const slot = this.mount.querySelector('.score-item-value');
    if (!slot) return;
    slot.textContent = String(this.match.points);
    slot.classList.add('score-pop');
  }

  seal() {
    if (this.sealed) return false;
    this.sealed = true;
    this.clock.stop();
    this.buttons.forEach((button) => button.removeEventListener('click', this.onPick));
    document.removeEventListener('keydown', this.onKey);
    return true;
  }

  leave() {
    setTimeout(() => {
      this.mount.querySelector('.question-card')?.classList.add('exit');
      setTimeout(() => {
        this.match.step();
        this.onAdvance();
      }, settings.leaveDuration);
    }, settings.pauseAfterAnswer);
  }
}
