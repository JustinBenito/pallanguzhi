import { IconX } from "@tabler/icons-react";
import { Button } from "./Button";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal = ({ isOpen, onClose }: RulesModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-clay-900/50 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-sandstone-50 to-beige-100 border-2 border-clay-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto skeuomorph-btn shadow-2xl celebrate">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-sandstone-100 to-beige-200 border-b-2 border-clay-300 px-6 py-5 flex items-center justify-between backdrop-blur-sm z-10">
          <h2 className="text-2xl font-bold text-clay-900 flex items-center gap-2">
            📖 How to Play Pallanguzhi
          </h2>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-clay-200 rounded-xl transition-all hover:scale-110 skeuomorph-btn"
          >
            <IconX size={22} className="text-clay-700" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6 font-[family-name:var(--font-inter)] text-sm text-clay-800">
          <section>
            <h3 className="font-semibold text-base mb-2 text-clay-900">
              Game Setup
            </h3>
            <ul className="space-y-2 list-disc list-inside text-clay-700">
              <li>14 pits total: 7 on your side (bottom), 7 on computer side (top)</li>
              <li>Each pit starts with 5 seeds</li>
              <li>You (player) always start first</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2 text-clay-900">
              How to Play
            </h3>
            <ol className="space-y-2 list-decimal list-inside text-clay-700">
              <li>
                <strong>Pick a pit:</strong> Click any pit on your side that has seeds
              </li>
              <li>
                <strong>Distribute seeds:</strong> Seeds are dropped one by one in
                counter-clockwise direction
              </li>
              <li>
                <strong>Continuation rule:</strong> If the last seed lands in a pit that
                already has seeds, pick up all seeds from that pit and continue distributing
              </li>
              <li>
                <strong>Stop:</strong> When the last seed lands in an empty pit (making it 1)
              </li>
            </ol>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2 text-clay-900">
              Capturing Seeds
            </h3>
            <p className="text-clay-700 mb-2">
              When your last seed lands in an empty pit on <strong>your side</strong>, you
              capture all seeds from the <strong>opposite pit</strong> (if it has seeds).
            </p>
            <p className="text-clay-700">
              Captured seeds are added to your score and removed from the board.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-base mb-2 text-clay-900">
              Winning the Game
            </h3>
            <p className="text-clay-700 mb-2">
              The game ends when one player&apos;s side is completely empty.
            </p>
            <p className="text-clay-700">
              <strong>Winner:</strong> The player with the most total seeds (seeds in pits +
              captured seeds)
            </p>
          </section>

          <section className="bg-gradient-to-br from-olive-100 to-beige-200 p-5 rounded-xl border-2 border-olive-300 shadow-inner">
            <h3 className="font-bold text-lg mb-3 text-clay-900 flex items-center gap-2">
              💡 Pro Tips
            </h3>
            <ul className="space-y-2.5 text-clay-700">
              <li className="flex items-start gap-2">
                <span className="text-olive-600 mt-0.5">✓</span>
                <span>Plan ahead to land in empty pits for captures</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-olive-600 mt-0.5">✓</span>
                <span>Use the continuation rule strategically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-olive-600 mt-0.5">✓</span>
                <span>Watch the opposite pits to maximize captures</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-olive-600 mt-0.5">✓</span>
                <span>Adjust animation speed with the slider for your comfort</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-br from-sandstone-100 to-beige-200 border-t-2 border-clay-300 px-6 py-5 backdrop-blur-sm">
          <Button onClick={onClose} variant="primary" size="lg" className="w-full text-base">
            ✨ Got it! Let's Play
          </Button>
        </div>
      </div>
    </div>
  );
};
