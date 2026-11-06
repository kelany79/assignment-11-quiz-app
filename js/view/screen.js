import { icon, node } from './nodes.js';

export class Screen {
  constructor(mount) {
    this.mount = mount;
  }

  clear() {
    this.mount.replaceChildren();
  }

  loading() {
    this.mount.replaceChildren(
      node('div', { class: 'loading-overlay' }, [
        node('div', { class: 'loading-spinner' }),
        node('p', { class: 'loading-text', text: 'Loading Questions...' }),
      ])
    );
  }

  fault(message, onRetry) {
    const retry = node('button', { class: 'btn-play retry-btn', type: 'button' }, [
      icon('fa-solid fa-rotate-right'),
      document.createTextNode(' Try Again'),
    ]);
    retry.addEventListener('click', onRetry);
    this.mount.replaceChildren(
      node('div', { class: 'game-card error-card' }, [
        node('div', { class: 'error-icon' }, [icon('fa-solid fa-triangle-exclamation')]),
        node('h3', { class: 'error-title', text: 'Oops! Something went wrong' }),
        node('p', { class: 'error-message', text: message }),
        retry,
      ])
    );
  }

  finale(match, rows, isRecord, onAgain) {
    const again = node('button', { class: 'btn-restart', type: 'button', 'aria-label': 'Play again' }, [
      icon('fa-solid fa-rotate-right'),
      document.createTextNode(' Play Again'),
    ]);
    again.addEventListener('click', () => {
      again.classList.add('loading');
      again.disabled = true;
      again.replaceChildren(icon('fa-solid fa-spinner'), document.createTextNode(' Loading...'));
      setTimeout(onAgain, 500);
    });

    this.mount.replaceChildren(
      node('div', { class: 'game-card results-card', role: 'dialog', 'aria-labelledby': 'gameResult' }, [
        node('h2', { id: 'gameResult', class: 'results-title', text: 'Quiz Complete!' }),
        node('p', { class: 'results-score-display', text: `${match.points}/${match.total}` }),
        node('p', { class: 'results-percentage', text: `${match.ratio}% Accuracy` }),
        isRecord
          ? node('div', { class: 'new-record-badge' }, [
              icon('fa-solid fa-star'),
              document.createTextNode(' New High Score!'),
            ])
          : null,
        rows.length ? this.board(rows) : null,
        node('div', { class: 'action-buttons' }, [again]),
      ])
    );
  }

  board(rows) {
    const ranks = ['gold', 'silver', 'bronze'];
    return node('div', { class: 'leaderboard' }, [
      node('h4', { class: 'leaderboard-title' }, [
        icon('fa-solid fa-trophy'),
        document.createTextNode(' Leaderboard'),
      ]),
      node(
        'ul',
        { class: 'leaderboard-list' },
        rows.map((entry, index) =>
          node('li', { class: `leaderboard-item ${ranks[index] || ''}`.trim() }, [
            node('span', { class: 'leaderboard-rank', text: `#${index + 1}` }),
            node('span', { class: 'leaderboard-name', text: entry.name }),
            node('span', { class: 'leaderboard-score', text: `${entry.percentage}%` }),
          ])
        )
      ),
    ]);
  }
}
