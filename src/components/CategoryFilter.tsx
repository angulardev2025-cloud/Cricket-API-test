import React from 'react';
import { Star, RotateCcw } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  languages: string[];
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  selectedQuality: string;
  onSelectQuality: (qual: string) => void;
  showOnlyFavorites: boolean;
  onToggleShowFavorites: () => void;
  favoritesCount: number;
  onResetFilters: () => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  languages,
  selectedLanguage,
  onSelectLanguage,
  selectedQuality,
  onSelectQuality,
  showOnlyFavorites,
  onToggleShowFavorites,
  favoritesCount,
  onResetFilters,
}) => {
  const isAnyFilterActive =
    selectedCategory !== 'All' ||
    selectedLanguage !== 'All' ||
    selectedQuality !== 'All' ||
    showOnlyFavorites;

  return (
    <div className="space-y-3 mb-6">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {/* Favorites Quick Pill */}
        <button
          onClick={onToggleShowFavorites}
          className={`shrink-0 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all border ${
            showOnlyFavorites
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${showOnlyFavorites ? 'fill-current' : 'text-amber-400'}`} />
          <span>Favorites ({favoritesCount})</span>
        </button>

        <div className="h-5 w-px bg-slate-800 shrink-0" />

        {/* Categories */}
        {['All', ...categories].map((cat) => {
          const isSelected = selectedCategory === cat && !showOnlyFavorites;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all border ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Secondary Controls: Language & Quality Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-900 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => onSelectLanguage(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="All" className="bg-slate-900 text-white">All Languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang} className="bg-slate-900 text-white">
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Quality Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium">Resolution:</span>
            <select
              value={selectedQuality}
              onChange={(e) => onSelectQuality(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="All" className="bg-slate-900 text-white">All Resolutions</option>
              <option value="1080p" className="bg-slate-900 text-white">1080p Full HD</option>
              <option value="720p" className="bg-slate-900 text-white">720p HD</option>
              <option value="576p" className="bg-slate-900 text-white">576p / 480p SD</option>
            </select>
          </div>
        </div>

        {isAnyFilterActive && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors ml-auto text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
