export type StarLevel = 5 | 4 | 3 | 2 | 1;

const STAR_LEVELS: StarLevel[] = [5, 4, 3, 2, 1];

export interface RatingBreakdownRow {
  star: StarLevel;
  count: number;
  percent: number;
}

export interface RatingBreakdown {
  rows: RatingBreakdownRow[];
  total: number;
  average: number;
}

function indexFor(star: StarLevel): number {
  return STAR_LEVELS.indexOf(star);
}

function starPointSum(counts: number[]): number {
  return STAR_LEVELS.reduce((sum, star, index) => sum + star * counts[index], 0);
}

/**
 * Build star counts that sum to `total` and match the product average rating.
 * High averages → mostly 4★ & 5★; low averages → mostly 1★ & 2★.
 */
export function buildRatingBreakdown(rating: number, total: number): RatingBreakdown {
  if (total <= 0) {
    return {
      rows: STAR_LEVELS.map((star) => ({ star, count: 0, percent: 0 })),
      total: 0,
      average: rating,
    };
  }

  const clamped = Math.min(5, Math.max(1, rating));
  const counts = [0, 0, 0, 0, 0];
  const low = Math.floor(clamped) as StarLevel;
  const high = Math.ceil(clamped) as StarLevel;

  if (low === high) {
    counts[indexFor(low)] = total;
  } else {
    const highCount = Math.round(total * (clamped - low));
    counts[indexFor(high)] = highCount;
    counts[indexFor(low)] = total - highCount;
  }

  const targetSum = Math.round(clamped * total);
  let guard = 0;

  while (starPointSum(counts) !== targetSum && guard < total * 50) {
    guard += 1;
    if (starPointSum(counts) < targetSum) {
      // Move one rating up: 1→2, 2→3, 3→4, 4→5
      for (const star of [1, 2, 3, 4] as const) {
        const from = indexFor(star);
        const to = indexFor((star + 1) as StarLevel);
        if (counts[from] > 0) {
          counts[from] -= 1;
          counts[to] += 1;
          break;
        }
      }
    } else {
      // Move one rating down: 5→4, 4→3, 3→2, 2→1
      for (const star of [5, 4, 3, 2] as const) {
        const from = indexFor(star);
        const to = indexFor((star - 1) as StarLevel);
        if (counts[from] > 0) {
          counts[from] -= 1;
          counts[to] += 1;
          break;
        }
      }
    }
  }

  const pointSum = starPointSum(counts);
  const average = pointSum / total;

  const rows = STAR_LEVELS.map((star, index) => {
    const count = counts[index];
    return {
      star,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });

  return { rows, total, average };
}
