export class RecordBook {
  constructor(key, limit) {
    this.key = key;
    this.limit = limit;
  }

  list() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.key) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  qualifies(percentage) {
    const rows = this.list();
    if (rows.length < this.limit) return true;
    return percentage > rows[rows.length - 1].percentage;
  }

  commit(entry) {
    const rows = this.list();
    rows.push(entry);
    rows.sort((left, right) => right.percentage - left.percentage);
    localStorage.setItem(this.key, JSON.stringify(rows.slice(0, this.limit)));
  }
}
