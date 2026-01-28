// src/components/admin/MediaSelector.tsx
import React from 'react';
import { Upload, Link } from 'lucide-react';
import { motion } from 'framer-motion';

export type MediaInputMode = 'upload' | 'url';

interface MediaSelectorProps {
    mode: MediaInputMode;
    onChange: (mode: MediaInputMode) => void;
    disabled?: boolean;
    label?: string;
}

export const MediaSelector: React.FC<MediaSelectorProps> = ({
    mode,
    onChange,
    disabled = false,
    label = 'Select Input Method',
}) => {
    return (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    {label}
                </label>
            )}

            <div className="flex gap-3">
                <motion.button
                    type="button"
                    whileHover={{ scale: disabled ? 1 : 1.02 }}
                    whileTap={{ scale: disabled ? 1 : 0.98 }}
                    onClick={() => !disabled && onChange('upload')}
                    disabled={disabled}
                    className={`
            flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-200
            flex items-center justify-center gap-3 border-2
            ${mode === 'upload'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-transparent shadow-lg'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500'
                        }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
                >
                    <Upload size={20} />
                    <span>Upload File</span>
                </motion.button>

                <motion.button
                    type="button"
                    whileHover={{ scale: disabled ? 1 : 1.02 }}
                    whileTap={{ scale: disabled ? 1 : 0.98 }}
                    onClick={() => !disabled && onChange('url')}
                    disabled={disabled}
                    className={`
            flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-200
            flex items-center justify-center gap-3 border-2
            ${mode === 'url'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-transparent shadow-lg'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500'
                        }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
                >
                    <Link size={20} />
                    <span>Paste URL</span>
                </motion.button>
            </div>
        </div>
    );
};
