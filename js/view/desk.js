import { settings } from '../app/settings.js';
import { icon, node } from './nodes.js';

class Picker {
  constructor(root) {
    this.root = root;
    this.trigger = root.querySelector('.custom-select-trigger');
    this.choices = [...root.querySelectorAll('.custom-select-option')];
    this.hidden = root.parentElement.querySelector('input[type="hidden"]');
    this.label = this.trigger.querySelector('.custom-select-text');
    this.icon = this.trigger.querySelector('.custom-select-icon');
    this.trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      document.querySelectorAll('.custom-select.open').forEach((open) => {
        if (open !== root) open.classList.remove('open');
      });
      root.classList.toggle('open');
    });
    this.choices.forEach((choice) => {
      choice.addEventListener('click', () => this.apply(choice));
    });
  }

  apply(choice) {
    const value = choice.dataset.value ?? '';
    const glyph = choice.querySelector('i');
    this.root.dataset.value = value;
    if (this.hidden) this.hidden.value = value;
    this.label.textContent = choice.textContent.trim();
    if (glyph) this.icon.replaceChildren(glyph.cloneNode(true));
    this.choices.forEach((item) => item.classList.remove('selected'));
    choice.classList.add('selected');
    this.root.classList.remove('open');
  }

  selectValue(value) {
    const choice = this.choices.find((item) => item.dataset.value === value);
    if (choice) this.apply(choice);
  }
}

class Stepper {
  constructor(button) {
    this.button = button;
    this.input = button.closest('.number-input-wrapper').querySelector('input[type="number"]');
    button.addEventListener('click', () => this.nudge());
  }

  nudge() {
    const min = Number(this.input.min) || settings.bounds.min;
    const max = Number(this.input.max) || settings.bounds.max;
    const current = Number(this.input.value) || min;
    const next = current + (this.button.dataset.action === 'increment' ? 1 : -1);
    if (next < min || next > max) return;
    this.input.value = String(next);
  }
}

export class SetupDesk {
  constructor(form) {
    this.form = form;
    this.name = form.querySelector('#playerName');
    this.amount = form.querySelector('#questionsNumber');
    this.category = form.querySelector('#categoryMenu');
    this.level = form.querySelector('#difficultyOptions');
    this.launch = form.querySelector('#startQuiz');
    this.pickers = [...form.querySelectorAll('.custom-select')].map((item) => new Picker(item));
    [...form.querySelectorAll('.number-btn')].forEach((button) => new Stepper(button));
    document.addEventListener('click', () => {
      document.querySelectorAll('.custom-select.open').forEach((item) => item.classList.remove('open'));
    });
  }

  validate() {
    const raw = this.amount.value.trim();
    const count = Number(raw);
    if (!raw || Number.isNaN(count)) {
      return { ok: false, reason: 'Please enter the number of questions.' };
    }
    if (count < settings.bounds.min) {
      return { ok: false, reason: `Minimum ${settings.bounds.min} question required.` };
    }
    if (count > settings.bounds.max) {
      return { ok: false, reason: `Maximum ${settings.bounds.max} questions allowed.` };
    }
    return { ok: true };
  }

  profile() {
    return {
      name: this.name.value.trim() || settings.guestName,
      category: this.category.value,
      difficulty: this.level.value || settings.defaultDifficulty,
      amount: Number(this.amount.value),
    };
  }

  flash(reason) {
    this.form.querySelector('.form-error')?.remove();
    const banner = node('div', { class: 'form-error' }, [
      icon('fa-solid fa-circle-exclamation'),
      document.createTextNode(` ${reason}`),
    ]);
    this.launch.before(banner);
    setTimeout(() => {
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(-10px)';
      setTimeout(() => banner.remove(), 300);
    }, 3000);
  }

  restore() {
    this.amount.value = String(settings.bounds.fallback);
    this.pickers.forEach((picker) => {
      if (picker.root.id === 'categorySelect') picker.selectValue('');
      if (picker.root.id === 'difficultySelect') picker.selectValue(settings.defaultDifficulty);
    });
    this.form.querySelector('.form-error')?.remove();
    this.form.classList.remove('hidden');
  }
}
