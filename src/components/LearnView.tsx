import React, { useState } from 'react';
import { BookOpen, Bookmark, CheckCircle, Search } from 'lucide-react';
import { LearningArticle } from '../types';

interface LearnViewProps {
  articles: LearningArticle[];
  onToggleLearned: (id: string) => void;
  onToggleSaved: (id: string) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({
  articles,
  onToggleLearned,
  onToggleSaved,
}) => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Nutrition' | 'Training' | 'Saved'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<LearningArticle | null>(null);

  const filteredArticles = articles.filter((a) => {
    if (activeCategory === 'Nutrition' && a.category !== 'Nutrition') return false;
    if (activeCategory === 'Training' && a.category !== 'Training') return false;
    if (activeCategory === 'Saved' && !a.isSavedForLater) return false;
    if (
      searchQuery &&
      !a.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.summary.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const learnedCount = articles.filter((a) => a.isLearned).length;

  return (
    <div className="space-y-4 pb-12">
      {/* Hero Card */}
      <div className="card-bg rounded-xl p-5 shadow-xl space-y-2">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-[#d4af37]" />
          <h2 className="serif text-sm font-bold uppercase tracking-widest text-gray-200">
            Evidence-Based Codex
          </h2>
        </div>
        <p className="text-xs text-gray-400 font-serif italic">
          Peer-reviewed physiological guidelines from NHS, NICE, British Dietetic Association & Sports Medicine literature.
        </p>

        <div className="pt-2 flex items-center justify-between text-xs font-mono">
          <span className="text-gray-400">Mastery Progress:</span>
          <span className="font-bold gold-text">
            {learnedCount} of {articles.length} Lessons Completed ({Math.round((learnedCount / (articles.length || 1)) * 100)}%)
          </span>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search progressive overload, protein, BMR, rest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {(['All', 'Nutrition', 'Training', 'Saved'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg font-mono font-bold uppercase tracking-wider transition-all ${
                activeCategory === cat
                  ? 'bg-[#d4af37] text-black shadow-[0_0_10px_rgba(212,175,55,0.25)]'
                  : 'bg-[#141414] text-gray-400 hover:text-gray-200 border border-white/5'
              }`}
            >
              {cat === 'Saved' ? `Bookmarks (${articles.filter((a) => a.isSavedForLater).length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="space-y-3">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className={`card-bg rounded-xl p-4 shadow-lg transition-all space-y-2.5 ${
              article.isLearned ? 'border-emerald-500/40 bg-[#121915]' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                    article.category === 'Nutrition'
                      ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                      : 'bg-[#221c0e] border-[#d4af37]/30 text-[#d4af37]'
                  }`}
                >
                  {article.category}
                </span>
                <h3 className="serif font-semibold text-sm text-gray-100 mt-1">{article.title}</h3>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onToggleSaved(article.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    article.isSavedForLater
                      ? 'bg-[#221c0e] border-[#d4af37]/50 text-[#d4af37]'
                      : 'bg-[#181818] border-white/5 text-gray-500 hover:text-gray-300'
                  }`}
                  title="Bookmark article"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onToggleLearned(article.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    article.isLearned
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-[#181818] border-white/5 text-gray-500 hover:text-gray-300'
                  }`}
                  title={article.isLearned ? 'Mark as unlearned' : 'Mark as learned'}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-300 font-sans">{article.summary}</p>

            <div className="bg-[#181818] p-2.5 rounded-lg border border-white/5 text-xs">
              <span className="serif text-[9px] font-bold text-[#d4af37] uppercase tracking-wider block mb-0.5">
                Key Takeaway
              </span>
              <p className="text-gray-200 font-medium font-sans">{article.keyTakeaway}</p>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] font-mono text-gray-400">
              <span className="truncate pr-2 font-medium">Source: {article.sourceName}</span>
              <button
                onClick={() => setSelectedArticle(article)}
                className="gold-text hover:underline font-bold shrink-0 inline-flex items-center"
              >
                Read Lesson →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Read Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-lg card-bg border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider gold-text">
                  {selectedArticle.category} Module
                </span>
                <h3 className="serif text-base font-bold text-white mt-0.5 uppercase tracking-wide">
                  {selectedArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-7 h-7 rounded-lg bg-[#181818] text-gray-400 hover:text-white flex items-center justify-center border border-white/5"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line space-y-2 font-sans">
              {selectedArticle.content}
            </div>

            <div className="bg-[#181818] p-3 rounded-lg border border-white/5 text-xs">
              <span className="serif font-semibold gold-text block mb-1 uppercase tracking-wider text-[10px]">Evidence Source</span>
              <p className="text-gray-300 font-mono text-[11px]">{selectedArticle.sourceName}</p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => {
                  onToggleLearned(selectedArticle.id);
                  setSelectedArticle(null);
                }}
                className="w-full py-2.5 rounded-lg bg-[#d4af37] hover:bg-[#b8962e] text-black font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_12px_rgba(212,175,55,0.25)]"
              >
                {selectedArticle.isLearned ? 'Keep Completed' : 'Mark as Learned ✓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
