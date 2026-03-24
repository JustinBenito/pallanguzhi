/**
 * Pallanguzhi Game Engine
 * Traditional Tamil game rules implementation
 */

export interface GameState {
  pits: number[]; // 14 pits total (0-6 user, 7-13 computer)
  currentPlayer: 0 | 1; // 0 = user, 1 = computer
  scores: [number, number]; // captured seeds
  isAnimating: boolean;
  speed: number; // ms per seed drop
  gameOver: boolean;
  winner: 0 | 1 | null;
}

export const INITIAL_SEEDS_PER_PIT = 5;
export const PITS_PER_SIDE = 7;
export const TOTAL_PITS = 14;

export const initialGameState: GameState = {
  pits: Array(TOTAL_PITS).fill(INITIAL_SEEDS_PER_PIT),
  currentPlayer: 0, // User always starts
  scores: [0, 0],
  isAnimating: false,
  speed: 300,
  gameOver: false,
  winner: null,
};

/**
 * Sleep utility for animation
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Convert slider value (1-100) to animation speed in ms
 */
export const sliderToSpeed = (sliderValue: number): number => {
  // Invert: 1 = slow (900ms), 100 = fast (100ms)
  return 1000 - sliderValue * 9;
};

/**
 * Check if a pit belongs to the current player
 */
export const isPlayerPit = (pitIndex: number, player: 0 | 1): boolean => {
  if (player === 0) {
    return pitIndex >= 0 && pitIndex < PITS_PER_SIDE;
  } else {
    return pitIndex >= PITS_PER_SIDE && pitIndex < TOTAL_PITS;
  }
};

/**
 * Get opposite pit index for capture logic
 */
export const getOppositePit = (pitIndex: number): number => {
  return TOTAL_PITS - 2 - pitIndex;
};

/**
 * Get valid moves for a player
 */
export const getValidMoves = (
  pits: number[],
  player: 0 | 1
): number[] => {
  const validMoves: number[] = [];
  const start = player === 0 ? 0 : PITS_PER_SIDE;
  const end = player === 0 ? PITS_PER_SIDE : TOTAL_PITS;

  for (let i = start; i < end; i++) {
    if (pits[i] > 0) {
      validMoves.push(i);
    }
  }

  return validMoves;
};

/**
 * Check if game is over (one side empty)
 */
export const checkGameOver = (pits: number[]): boolean => {
  const userSide = pits.slice(0, PITS_PER_SIDE);
  const computerSide = pits.slice(PITS_PER_SIDE, TOTAL_PITS);

  const userEmpty = userSide.every((count) => count === 0);
  const computerEmpty = computerSide.every((count) => count === 0);

  return userEmpty || computerEmpty;
};

/**
 * Calculate total seeds for a player (pits + score)
 */
export const getTotalSeeds = (
  pits: number[],
  scores: [number, number],
  player: 0 | 1
): number => {
  const start = player === 0 ? 0 : PITS_PER_SIDE;
  const end = player === 0 ? PITS_PER_SIDE : TOTAL_PITS;

  const pitsTotal = pits.slice(start, end).reduce((sum, count) => sum + count, 0);
  return pitsTotal + scores[player];
};

/**
 * Determine winner when game is over
 */
export const determineWinner = (
  pits: number[],
  scores: [number, number]
): 0 | 1 | null => {
  const userTotal = getTotalSeeds(pits, scores, 0);
  const computerTotal = getTotalSeeds(pits, scores, 1);

  if (userTotal > computerTotal) return 0;
  if (computerTotal > userTotal) return 1;
  return null; // Tie
};

/**
 * Simple AI: Pick a random valid move
 */
export const getAIMove = (pits: number[]): number => {
  const validMoves = getValidMoves(pits, 1);
  if (validMoves.length === 0) return -1;

  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return validMoves[randomIndex];
};

/**
 * Game statistics for localStorage
 */
export interface GameStats {
  gamesPlayed: number;
  userWins: number;
  computerWins: number;
  ties: number;
}

export const defaultStats: GameStats = {
  gamesPlayed: 0,
  userWins: 0,
  computerWins: 0,
  ties: 0,
};

/**
 * Load stats from localStorage
 */
export const loadStats = (): GameStats => {
  if (typeof window === "undefined") return defaultStats;

  try {
    const saved = localStorage.getItem("pallanguzhi-stats");
    return saved ? JSON.parse(saved) : defaultStats;
  } catch {
    return defaultStats;
  }
};

/**
 * Save stats to localStorage
 */
export const saveStats = (stats: GameStats): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("pallanguzhi-stats", JSON.stringify(stats));
  } catch {
    // Ignore storage errors
  }
};

/**
 * Update stats after game end
 */
export const updateStats = (winner: 0 | 1 | null): GameStats => {
  const stats = loadStats();
  stats.gamesPlayed++;

  if (winner === 0) stats.userWins++;
  else if (winner === 1) stats.computerWins++;
  else stats.ties++;

  saveStats(stats);
  return stats;
};
