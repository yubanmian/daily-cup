/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { DrinkRecord } from '../types';
import { Coffee, DollarSign, Flame, Star, Tag, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DrinkCardProps {
  record: DrinkRecord;
  onDelete?: (id: number) => void;
}

const RATING_EMOJIS = ['😫', '😐', '😋', '😍', '🤩'];

export const DrinkCard: React.FC<DrinkCardProps> = ({ record, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all group relative flex flex-col"
    >
      {/* Image Header */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {record.image_path ? (
          <img 
            src={record.image_path} 
            alt={record.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-700">
            <Coffee className="w-16 h-16 opacity-20" />
          </div>
        )}
        
        {/* Rating Overlay */}
        {record.rating && (
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
            {RATING_EMOJIS[record.rating - 1]}
          </div>
        )}

        {/* Date Overlay */}
        <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest">
          {format(new Date(record.timestamp), 'MMM d, HH:mm')}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-black text-xl text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
            {record.name}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {record.price !== null && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">¥{record.price.toFixed(2)}</span>
            </div>
          )}
          {record.calories !== null && (
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/10 rounded-xl">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{record.calories} kcal</span>
            </div>
          )}
        </div>

        {record.notes && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 italic mb-4 line-clamp-2">
            "{record.notes}"
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-2">
          {record.tags && record.tags.split(',').map((tag, i) => (
            <span key={i} className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              #{tag.trim()}
            </span>
          ))}
        </div>
      </div>

      {onDelete && (
        <button
          onClick={() => onDelete(record.id)}
          className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-rose-500 backdrop-blur-md text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};
