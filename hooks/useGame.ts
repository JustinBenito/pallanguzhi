import { useState, useCallback, useRef, useEffect } from "react";
import {
  GameState,
  initialGameState,
  sleep,
  isPlayerPit,
  getOppositePit,
  checkGameOver,
  determineWinner,
  getAIMove,
  updateStats,
  TOTAL_PITS,
} from "@/lib/gameEngine";
import { playSeedDrop, playCapture, playWin, playLose } from "@/lib/sounds";

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const animationRef = useRef<boolean>(false);
  const playMoveRef = useRef<((pitIndex: number) => Promise<void>) | null>(null);
  const gameStateRef = useRef<GameState>(gameState);

  // Keep ref in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  /**
   * Reset game to initial state
   */
  const resetGame = useCallback(() => {
    setGameState(initialGameState);
    animationRef.current = false;
  }, []);

  /**
   * Update animation speed
   */
  const setSpeed = useCallback((speed: number) => {
    setGameState((prev) => ({ ...prev, speed }));
  }, []);

  /**
   * Handle capture logic
   */
  const handleCapture = useCallback(
    (
      pits: number[],
      scores: [number, number],
      lastPitIndex: number,
      currentPlayer: 0 | 1
    ): { newPits: number[]; newScores: [number, number]; captured: boolean } => {
      console.log('🎯 Capture Check:', {
        lastPitIndex,
        currentPlayer,
        seedsInLastPit: pits[lastPitIndex],
        isPlayerPit: isPlayerPit(lastPitIndex, currentPlayer),
      });

      // Only capture if last seed lands in player's own pit with exactly 1 seed (after drop)
      if (pits[lastPitIndex] === 1 && isPlayerPit(lastPitIndex, currentPlayer)) {
        // Check the NEXT pit (anti-clockwise direction) for capture
        const nextPit = (lastPitIndex + 1) % TOTAL_PITS;
        const capturedSeeds = pits[nextPit];

        console.log('✅ Capture conditions met! Checking next pit:', {
          nextPit,
          seedsInNextPit: capturedSeeds,
        });

        if (capturedSeeds > 0) {
          const newPits = [...pits];
          const newScores: [number, number] = [...scores];

          newScores[currentPlayer] += capturedSeeds;
          newPits[nextPit] = 0;

          console.log('🎉 CAPTURED!', capturedSeeds, 'seeds from pit', nextPit);
          playCapture();
          return { newPits, newScores, captured: true };
        } else {
          console.log('❌ Next pit is empty, no capture');
        }
      } else {
        console.log('❌ Capture conditions not met');
      }

      return { newPits: pits, newScores: scores, captured: false };
    },
    []
  );

  /**
   * Execute a move with animation
   */
  const playMove = useCallback(
    async (pitIndex: number) => {
      if (animationRef.current || gameState.isAnimating || gameState.gameOver) {
        return;
      }

      // Validate move
      if (
        gameState.pits[pitIndex] === 0 ||
        !isPlayerPit(pitIndex, gameState.currentPlayer)
      ) {
        return;
      }

      animationRef.current = true;
      setGameState((prev) => ({ ...prev, isAnimating: true }));

      let currentPits = [...gameState.pits];
      let currentScores: [number, number] = [...gameState.scores];
      let seeds = currentPits[pitIndex];
      currentPits[pitIndex] = 0;

      // Update state to show empty starting pit
      setGameState((prev) => ({ ...prev, pits: currentPits }));
      await sleep(gameState.speed);

      let currentIndex = pitIndex;

      // Main game loop: distribute and continue
      while (true) {
        // Distribute seeds
        while (seeds > 0) {
          currentIndex = (currentIndex + 1) % TOTAL_PITS;
          currentPits[currentIndex]++;
          seeds--;

          playSeedDrop();
          setGameState((prev) => ({ ...prev, pits: [...currentPits] }));
          await sleep(gameState.speed);
        }

        // Check continuation rule
        if (currentPits[currentIndex] > 1) {
          seeds = currentPits[currentIndex];
          currentPits[currentIndex] = 0;

          setGameState((prev) => ({ ...prev, pits: [...currentPits] }));
          await sleep(gameState.speed);
        } else {
          // No continuation, check for capture
          const { newPits, newScores } = handleCapture(
            currentPits,
            currentScores,
            currentIndex,
            gameState.currentPlayer
          );
          currentPits = newPits;
          currentScores = newScores;
          break;
        }
      }

      // Check game over
      const isGameOver = checkGameOver(currentPits);
      let winner: 0 | 1 | null = null;

      if (isGameOver) {
        winner = determineWinner(currentPits, currentScores);
        updateStats(winner);

        if (winner === 0) {
          playWin();
        } else if (winner === 1) {
          playLose();
        }
      }

      // Switch player
      const nextPlayer = gameState.currentPlayer === 0 ? 1 : 0;

      setGameState({
        pits: currentPits,
        scores: currentScores,
        currentPlayer: nextPlayer as 0 | 1,
        isAnimating: false,
        speed: gameState.speed,
        gameOver: isGameOver,
        winner,
      });

      animationRef.current = false;
    },
    [gameState, handleCapture]
  );

  // Store playMove in ref for AI to use
  playMoveRef.current = playMove;

  // Effect to trigger AI move when it's computer's turn
  useEffect(() => {
    if (
      gameState.currentPlayer === 1 &&
      !gameState.isAnimating &&
      !gameState.gameOver
    ) {
      const timer = setTimeout(() => {
        const currentState = gameStateRef.current;
        const aiMove = getAIMove(currentState.pits);
        if (aiMove !== -1 && playMoveRef.current) {
          playMoveRef.current(aiMove);
        } else {
          // Computer has no valid moves, check if game is over
          const isGameOver = checkGameOver(currentState.pits);
          if (isGameOver) {
            const winner = determineWinner(currentState.pits, currentState.scores);
            updateStats(winner);
            setGameState((prev) => ({
              ...prev,
              gameOver: true,
              winner,
            }));
            if (winner === 0) {
              playWin();
            } else if (winner === 1) {
              playLose();
            }
          } else {
            // Pass turn back to user
            setGameState((prev) => ({
              ...prev,
              currentPlayer: 0,
            }));
          }
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.isAnimating, gameState.gameOver]);

  return {
    gameState,
    playMove,
    resetGame,
    setSpeed,
  };
};
