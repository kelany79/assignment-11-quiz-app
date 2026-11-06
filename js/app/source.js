import { settings } from './settings.js';
import { ChoiceRound } from './round.js';

export class TriviaSource {
  constructor(root = settings.api) {
    this.root = root;
  }

  async pull(profile) {
    let response;
    try {
      response = await fetch(this.address(profile));
    } catch {
      throw new Error('Failed to load questions. Please try again.');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const payload = await response.json();
    if (payload.response_code !== 0) {
      throw new Error(settings.faults[payload.response_code] || 'An unknown error occurred.');
    }

    return payload.results.map((item) => new ChoiceRound(item));
  }

  address(profile) {
    const params = new URLSearchParams({
      amount: String(profile.amount),
      difficulty: profile.difficulty,
    });
    if (profile.category) params.set('category', profile.category);
    return `${this.root}?${params.toString()}`;
  }
}
