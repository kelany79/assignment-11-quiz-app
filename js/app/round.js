import { decodeEntities } from '../view/nodes.js';

export class ChoiceRound {
  constructor(raw) {
    this.prompt = decodeEntities(raw.question);
    this.answer = decodeEntities(raw.correct_answer);
    this.topic = decodeEntities(raw.category);
    this.options = ChoiceRound.shuffle(
      raw.incorrect_answers.map((item) => decodeEntities(item)).concat(this.answer)
    );
  }

  holds(value) {
    return String(value).toLowerCase() === this.answer.toLowerCase();
  }

  static shuffle(list) {
    const bag = list.slice();
    let cursor = bag.length;
    while (cursor > 1) {
      const swap = Math.floor(Math.random() * cursor);
      cursor -= 1;
      const hold = bag[cursor];
      bag[cursor] = bag[swap];
      bag[swap] = hold;
    }
    return bag;
  }
}
