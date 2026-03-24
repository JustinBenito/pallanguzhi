"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  IconRefresh,
  IconHelp,
  IconVolume,
  IconVolumeOff,
  IconTrophy,
} from "@tabler/icons-react";
import { useGame } from "@/hooks/useGame";
import { Button } from "./Button";
import { RulesModal } from "./RulesModal";
import { sliderToSpeed, getTotalSeeds, loadStats } from "@/lib/gameEngine";

const HOLE_IMAGES = ["/assets/hole-1.png", "/assets/hole-2.png", "/assets/hole-3.png"];
const SEED_IMAGES = [
  "/assets/seed-1.png",
  "/assets/seed-2.png",
  "/assets/seed-3.png",
  "/assets/seed-4.png",
];

// Randomly assign hole images
const getRandomHoleImage = (index: number) => {
  return HOLE_IMAGES[index % HOLE_IMAGES.length];
};

// Randomly assign seed images
const getRandomSeedImage = (pitIndex: number, seedIndex: number) => {
  return SEED_IMAGES[(pitIndex + seedIndex) % SEED_IMAGES.length];
};

export const GameBoard = () => {
  const { gameState, playMove, resetGame, setSpeed } = useGame();
  const [showRules, setShowRules] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sliderValue, setSliderValue] = useState(70); // Default speed

  const stats = loadStats();

  // Memoize hole assignments
  const holeAssignments = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => getRandomHoleImage(i));
  }, []);

  const handlePitClick = (pitIndex: number) => {
    if (
      gameState.currentPlayer === 0 &&
      !gameState.isAnimating &&
      !gameState.gameOver
    ) {
      playMove(pitIndex);
    }
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    setSpeed(sliderToSpeed(value));
  };

  const userTotal = getTotalSeeds(gameState.pits, gameState.scores, 0);
  const computerTotal = getTotalSeeds(gameState.pits, gameState.scores, 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sandstone-100 via-beige-50 to-olive-50 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle, var(--clay-800) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      <div className="max-w-7xl w-full relative z-10">
        {/* Header with floating animation */}
        <div className="text-center mb-6">
          <h1 className="text-5xl md:text-7xl font-bold text-clay-800 mb-3 float-animation ">
            பல்லாங்குழி
          </h1>
          <p className="text-base md:text-lg text-clay-600 font-[family-name:var(--font-inter)] tracking-wide">
            Pallanguzhi Our Traditional Tamil Game
          </p>
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">
          {/* Computer Score */}
          <div className="score-gradient rounded-2xl skeuomorph-btn p-6 hover-lift relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-xs uppercase tracking-wider text-clay-600 font-[family-name:var(--font-inter)] mb-2 font-semibold">
                Computer
              </div>
              <div className="text-4xl font-bold text-clay-900 mb-1">{computerTotal}</div>
              <div className="text-xs text-clay-600 font-[family-name:var(--font-inter)]">
                Captured: <span className="font-bold text-clay-800">{gameState.scores[1]}</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-clay-400/20 rounded-full blur-2xl" />
          </div>

          {/* User Score */}
          <div className="score-gradient-user rounded-2xl skeuomorph-btn p-6 hover-lift relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-xs uppercase tracking-wider text-clay-600 font-[family-name:var(--font-inter)] mb-2 font-semibold">
                You
              </div>
              <div className="text-4xl font-bold text-clay-900 mb-1">{userTotal}</div>
              <div className="text-xs text-clay-600 font-[family-name:var(--font-inter)]">
                Captured: <span className="font-bold text-clay-800">{gameState.scores[0]}</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-sandstone-500/20 rounded-full blur-2xl" />
          </div>
        </div>

        {/* Game Board */}
        <div className="relative mx-auto max-w-6xl">
          {/* Wooden Board Background */}
          <div className="relative aspect-[2/1] w-full">
            <Image
              src="/assets/board.png"
              alt="Pallanguzhi Board"
              fill
              className="object-contain"
              priority
            />

            {/* Holes Grid - Computer Side (Top Row) */}
            <div className="absolute top-[12.5%] left-[9%] right-[9%] h-[9%] grid grid-cols-7 gap-4">
              {gameState.pits.slice(7, 14).reverse().map((count, i) => {
                const actualIndex = 13 - i;
                return (
                  <Pit
                    key={`computer-${actualIndex}`}
                    count={count}
                    pitIndex={actualIndex}
                    holeImage={holeAssignments[actualIndex]}
                    isClickable={false}
                    isActive={
                      gameState.currentPlayer === 1 && !gameState.gameOver
                    }
                    onClick={() => {}}
                  />
                );
              })}
            </div>

            {/* Holes Grid - User Side (Bottom Row) */}
            <div className="absolute bottom-[25.5%] left-[9%] right-[9%] h-[9%] grid grid-cols-7 gap-4">
              {gameState.pits.slice(0, 7).map((count, i) => (
                <Pit
                  key={`user-${i}`}
                  count={count}
                  pitIndex={i}
                  holeImage={holeAssignments[i]}
                  isClickable={
                    gameState.currentPlayer === 0 &&
                    !gameState.isAnimating &&
                    !gameState.gameOver &&
                    count > 0
                  }
                  isActive={
                    gameState.currentPlayer === 0 && !gameState.gameOver
                  }
                  onClick={handlePitClick}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Turn Indicator */}
        <div className="text-center mt-8">
          {!gameState.gameOver ? (
            <div className={`inline-block bg-beige-200 px-8 py-3 rounded-full skeuomorph-btn ${gameState.isAnimating ? 'pulse-glow' : ''}`}>
              <p className="text-base font-[family-name:var(--font-inter)] text-clay-800 font-semibold">
                {gameState.isAnimating
                  ? "🌾 Moving..."
                  : gameState.currentPlayer === 0
                  ? "✨ Your Turn"
                  : "🤖 Computer's Turn"}
              </p>
            </div>
          ) : (
            <div className="celebrate inline-block bg-gradient-to-r from-olive-200 to-olive-300 px-8 py-4 rounded-2xl skeuomorph-btn border-2 border-olive-400">
              <div className="flex items-center gap-3">
                <IconTrophy size={28} className="text-olive-700" />
                <p className="text-lg font-bold font-[family-name:var(--font-inter)] text-olive-900">
                  {gameState.winner === null
                    ? "🤝 It's a Tie!"
                    : gameState.winner === 0
                    ? "🎉 You Win!"
                    : "💪 Computer Wins!"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-10 max-w-3xl mx-auto space-y-5">
          {/* Speed Control */}
          <div className="bg-gradient-to-br from-sandstone-200 to-sandstone-300 rounded-2xl p-6 skeuomorph-btn hover-lift">
            <label className="block text-sm font-semibold font-[family-name:var(--font-inter)] text-clay-800 mb-3 tracking-wide">
              ⚡ Animation Speed
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={sliderValue}
              onChange={handleSpeedChange}
              className="w-full h-3 bg-sandstone-300 rounded-full appearance-none cursor-pointer accent-clay-500 hover:h-4 transition-all"
              style={{
                background: `linear-gradient(to right, var(--clay-500) 0%, var(--clay-500) ${sliderValue}%, var(--sandstone-300) ${sliderValue}%, var(--sandstone-300) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs font-medium text-clay-600 font-[family-name:var(--font-inter)] mt-2">
              <span>🐢 Slow</span>
              <span>🚀 Fast</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={() => setShowRules(true)}
              variant="secondary"
              icon={<IconHelp size={16} />}
              roundedCorner="tl"
            >
              Rules
            </Button>
            <Button
              onClick={resetGame}
              variant="primary"
              icon={<IconRefresh size={16} />}
              roundedCorner="none"
            >
              New Game
            </Button>
            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              variant="secondary"
              icon={
                soundEnabled ? (
                  <IconVolume size={16} />
                ) : (
                  <IconVolumeOff size={16} />
                )
              }
              roundedCorner="tr"
            >
              Sound
            </Button>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-br from-beige-100 to-beige-200 rounded-2xl p-6 skeuomorph-btn hover-lift">
            <div className="text-center mb-4">
              <h3 className="text-sm font-bold text-clay-700 font-[family-name:var(--font-inter)] uppercase tracking-wider">
                📊 Game Statistics
              </h3>
            </div>
            <div className="grid grid-cols-4 gap-6 text-center">
              <div className="transform hover:scale-110 transition-transform">
                <div className="text-xs uppercase tracking-wide text-clay-600 font-[family-name:var(--font-inter)] mb-1 font-semibold">
                  Played
                </div>
                <div className="text-2xl font-bold text-clay-800">
                  {stats.gamesPlayed}
                </div>
              </div>
              <div className="transform hover:scale-110 transition-transform">
                <div className="text-xs uppercase tracking-wide text-clay-600 font-[family-name:var(--font-inter)] mb-1 font-semibold">
                  Won
                </div>
                <div className="text-2xl font-bold text-olive-700">
                  {stats.userWins}
                </div>
              </div>
              <div className="transform hover:scale-110 transition-transform">
                <div className="text-xs uppercase tracking-wide text-clay-600 font-[family-name:var(--font-inter)] mb-1 font-semibold">
                  Lost
                </div>
                <div className="text-2xl font-bold text-clay-600">
                  {stats.computerWins}
                </div>
              </div>
              <div className="transform hover:scale-110 transition-transform">
                <div className="text-xs uppercase tracking-wide text-clay-600 font-[family-name:var(--font-inter)] mb-1 font-semibold">
                  Ties
                </div>
                <div className="text-2xl font-bold text-beige-700">
                  {stats.ties}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Modal */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
};

interface PitProps {
  count: number;
  pitIndex: number;
  holeImage: string;
  isClickable: boolean;
  isActive: boolean;
  onClick: (pitIndex: number) => void;
}

const Pit = ({
  count,
  pitIndex,
  holeImage,
  isClickable,
  isActive,
  onClick,
}: PitProps) => {
  return (
    <button
      onClick={() => onClick(pitIndex)}
      disabled={!isClickable}
      className={`relative aspect-square group transition-all duration-300 ${
        isClickable ? "cursor-pointer hover:scale-105" : "cursor-default"
      }`}
    >
      {/* Hole Image */}
      <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
        <Image
          src={holeImage}
          alt="Pit"
          fill
          className="object-contain"
        />
      </div>

      {/* Seeds */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          {Array.from({ length: Math.min(count, 8) }).map((_, i) => {
            // Position seeds in a circular pattern with randomization
            const angle = (i / Math.max(count, 1)) * Math.PI * 2;
            const radius = count > 1 ? 25 : 0;

            // Add random offset for natural look (seeded randomness based on pit and seed index)
            const randomSeed = pitIndex * 7 + i * 13 + count;
            const randomX = ((randomSeed * 9301 + 49297) % 233280) / 233280.0;
            const randomY = ((randomSeed * 4817 + 17491) % 233280) / 233280.0;
            const offsetX = (randomX - 0.5) * 6; // ±3px offset
            const offsetY = (randomY - 0.5) * 6; // ±3px offset

            // Round to 4 decimal places for consistent server/client rendering
            const x = Math.round((Math.cos(angle) * radius + offsetX) * 10000) / 10000;
            const y = Math.round((Math.sin(angle) * radius + offsetY) * 10000) / 10000;

            return (
              <div
                key={i}
                className="absolute seed-drop"
                style={{
                  transform: `translate(${x}%, ${y}%)`,
                  animationDelay: `${i * 50}ms`,
                }}
              >
                <Image
                  src={getRandomSeedImage(pitIndex, i)}
                  alt="Seed"
                  width={count > 5 ? 16 : 20}
                  height={count > 5 ? 16 : 20}
                  className="drop-shadow-md transition-all duration-200 group-hover:drop-shadow-lg"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Count Display */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[var(--wood-light)] to-[var(--wood-dark)] text-sandstone-50 px-2.5 py-0.5 rounded-md text-xs font-bold font-[family-name:var(--font-inter)] skeuomorph-btn min-w-[24px] text-center shadow-lg">
        {count}
      </div>

      {/* Hover glow effect for clickable pits */}
      {isClickable && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-olive-400/30 to-olive-600/30 opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm pointer-events-none" />
      )}

      {/* Active indicator with glow */}
      {isActive && isClickable && (
        <div className="absolute -top-2 -right-2">
          <div className="relative">
            <div className="w-4 h-4 bg-olive-500 rounded-full animate-pulse shadow-lg" />
            <div className="absolute inset-0 w-4 h-4 bg-olive-400 rounded-full animate-ping" />
          </div>
        </div>
      )}
    </button>
  );
};
