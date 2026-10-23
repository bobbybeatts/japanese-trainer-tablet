const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

function reviewWordIds(words, attempts) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const progress = new Map();
  for (const attempt of attempts) {
    const last = progress.get(attempt.wordId);
    const seenAt = new Date(attempt.createdAt);
    progress.set(attempt.wordId, {
      day: seenAt,
      streak: attempt.correct ? (last?.streak || 0) + 1 : 0
    });
  }
  return new Set(words.filter(word => {
    if (word.pending > 0) return true;
    const last = progress.get(word.id);
    if (!last || !last.streak || Number.isNaN(last.day.getTime())) return false;
    const due = new Date(last.day);
    due.setHours(0, 0, 0, 0);
    due.setDate(due.getDate() + REVIEW_INTERVALS[Math.min(last.streak, 5) - 1]);
    return due <= today;
  }).map(word => word.id));
}

export { reviewWordIds };
