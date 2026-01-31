import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    TrendingUp,
    Play,
    CheckCircle,
    AlertCircle,
    Loader,
    Film,
    Clock,
    Download,
    RefreshCw,
} from 'lucide-react';
import { auth } from '../../config/firebase';
import { logSystemEvent, logError } from '../../utils/activityLogger';

interface GenerationResult {
    date?: string;
    month?: string;
    status: string;
    error?: string;
}

interface GenerationResponse {
    success: boolean;
    message: string;
    results?: GenerationResult[];
    errors?: GenerationResult[];
    stats?: {
        total: number;
        successful: number;
        failed: number;
    };
    data?: any;
}

const AnalyticsGenerator: React.FC = () => {
    // ✅ SEPARATE LOADING STATES FOR EACH BUTTON
    const [loadingDaily, setLoadingDaily] = useState(false);
    const [loadingContent, setLoadingContent] = useState(false);
    const [loadingMonthly, setLoadingMonthly] = useState(false);

    const [result, setResult] = useState<GenerationResponse | null>(null);
    const [daysToGenerate, setDaysToGenerate] = useState(30);
    const [monthsToGenerate, setMonthsToGenerate] = useState(3);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [useCustomRange, setUseCustomRange] = useState(false);

    const FUNCTION_BASE_URL = "https://us-central1-chhattisgarhi-cinema.cloudfunctions.net/"; // ✅ Replace with yours

    // ✅ UPDATED callFunction with specific loading state
   const callFunction = async (
    functionName: string,
    params: Record<string, string> = {},
    setLoading: (loading: boolean) => void,
    actionDescription: string // ✅ NEW PARAMETER
) => {
    setLoading(true);
    setResult(null);

    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("Not authenticated");
        }

        const token = await user.getIdToken();
        const queryString = new URLSearchParams(params).toString();
        const url = `${FUNCTION_BASE_URL}/${functionName}${queryString ? `?${queryString}` : ''}`;

        console.log(`📞 Calling function: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        setResult(data);

        if (!response.ok) {
            throw new Error(data.error || 'Function call failed');
        }

        console.log('✅ Function response:', data);

        // ✅ LOG SUCCESSFUL GENERATION
        await logSystemEvent(
            'analytics_generation',
            actionDescription,
            'Analytics',
            {
                functionName,
                parameters: params,
                success: true,
                stats: data.stats,
                resultsCount: data.results?.length || 0,
            }
        );

    } catch (error) {
        console.error('❌ Error calling function:', error);
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        setResult({
            success: false,
            message: `Error: ${errorMessage}`
        });

        // ✅ LOG ERROR
        await logError(
            'Analytics',
            `Failed to ${actionDescription}: ${errorMessage}`,
            {
                functionName,
                parameters: params,
                error: error instanceof Error ? error.stack : errorMessage,
            }
        );
    } finally {
        setLoading(false);
    }
};


    const generateDailyAnalytics = () => {
    const params: Record<string, string> = {};

    if (useCustomRange && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
    } else {
        params.days = daysToGenerate.toString();
    }

    // ✅ UPDATED: Added action description
    const description = useCustomRange 
        ? `generate daily analytics from ${startDate} to ${endDate}`
        : `generate ${daysToGenerate} days of daily analytics`;

    callFunction('generateDailyAnalyticsManual', params, setLoadingDaily, description);
};

const generateContentPerformance = () => {
    // ✅ UPDATED: Added action description
    callFunction(
        'generateContentPerformanceManual', 
        {}, 
        setLoadingContent,
        'update content performance analytics'
    );
};

const generateMonthlyAnalytics = () => {
    // ✅ UPDATED: Added action description
    callFunction(
        'generateMonthlyAnalyticsManual', 
        { months: monthsToGenerate.toString() }, 
        setLoadingMonthly,
        `generate ${monthsToGenerate} months of monthly analytics`
    );
};

    // ✅ CHECK IF ANY LOADING
    const isAnyLoading = loadingDaily || loadingContent || loadingMonthly;

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl"
            >
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black">Analytics Generator</h1>
                        <p className="text-white/90 mt-1">
                            Manually trigger analytics data generation and backfill historical data
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Analytics */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <Calendar className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                Daily Analytics
                            </h3>
                            <p className="text-sm text-slate-500">Generate daily analytics data</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    checked={useCustomRange}
                                    onChange={(e) => setUseCustomRange(e.target.checked)}
                                    className="rounded"
                                    disabled={isAnyLoading}
                                />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Use custom date range
                                </span>
                            </label>
                        </div>

                        {useCustomRange ? (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        disabled={isAnyLoading}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white disabled:opacity-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        disabled={isAnyLoading}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white disabled:opacity-50"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Number of Days
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={daysToGenerate}
                                    onChange={(e) => setDaysToGenerate(parseInt(e.target.value))}
                                    disabled={isAnyLoading}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white disabled:opacity-50"
                                />
                                <div className="flex gap-2 mt-2">
                                    {[7, 30, 90].map((days) => (
                                        <button
                                            key={days}
                                            onClick={() => setDaysToGenerate(days)}
                                            disabled={isAnyLoading}
                                            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${daysToGenerate === days
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                }`}
                                        >
                                            {days} days
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={generateDailyAnalytics}
                            disabled={loadingDaily}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loadingDaily ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Play size={20} />
                                    Generate Daily Analytics
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Content Performance */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <Film className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                Content Performance
                            </h3>
                            <p className="text-sm text-slate-500">Update content analytics</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                Updates views, watch time, revenue, and ratings for all content types
                                (Movies, Series, Short Films, Events).
                            </p>
                        </div>

                        <button
                            onClick={generateContentPerformance}
                            disabled={loadingContent}
                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loadingContent ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={20} />
                                    Update Content Performance
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Monthly Analytics */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <Clock className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                Monthly Analytics
                            </h3>
                            <p className="text-sm text-slate-500">Generate monthly summaries</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Number of Months
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={monthsToGenerate}
                                onChange={(e) => setMonthsToGenerate(parseInt(e.target.value))}
                                disabled={isAnyLoading}
                                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white disabled:opacity-50"
                            />
                            <div className="flex gap-2 mt-2">
                                {[1, 3, 6, 12].map((months) => (
                                    <button
                                        key={months}
                                        onClick={() => setMonthsToGenerate(months)}
                                        disabled={isAnyLoading}
                                        className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${monthsToGenerate === months
                                            ? 'bg-green-500 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        {months}M
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={generateMonthlyAnalytics}
                            disabled={loadingMonthly}
                            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loadingMonthly ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Play size={20} />
                                    Generate Monthly Analytics
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                            <Download className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                Quick Actions
                            </h3>
                            <p className="text-sm text-slate-500">Common operations</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                setDaysToGenerate(7);
                                setTimeout(generateDailyAnalytics, 100);
                            }}
                            disabled={loadingDaily}
                            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50 text-left"
                        >
                            🚀 Generate Last Week
                        </button>
                        <button
                            onClick={() => {
                                setDaysToGenerate(30);
                                setTimeout(generateDailyAnalytics, 100);
                            }}
                            disabled={loadingDaily}
                            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50 text-left"
                        >
                            📊 Generate Last Month
                        </button>
                        <button
                            onClick={() => {
                                setDaysToGenerate(90);
                                setTimeout(generateDailyAnalytics, 100);
                            }}
                            disabled={loadingDaily}
                            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50 text-left"
                        >
                            📈 Generate Last Quarter
                        </button>
                    </div>
                </motion.div>
            </div >

            {/* Results - Same as before */}
            {
                result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl p-6 shadow-lg border ${result.success
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            {result.success ? (
                                <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                            ) : (
                                <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
                            )}
                            <div className="flex-1">
                                <h4 className={`font-bold text-lg ${result.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                                    }`}>
                                    {result.success ? 'Success!' : 'Error'}
                                </h4>
                                <p className={`mt-1 ${result.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                                    }`}>
                                    {result.message}
                                </p>

                                {result.stats && (
                                    <div className="mt-4 grid grid-cols-3 gap-4">
                                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                                            <div className="text-2xl font-bold text-slate-800 dark:text-white">
                                                {result.stats.total}
                                            </div>
                                            <div className="text-xs text-slate-500">Total</div>
                                        </div>
                                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                                            <div className="text-2xl font-bold text-green-500">
                                                {result.stats.successful}
                                            </div>
                                            <div className="text-xs text-slate-500">Successful</div>
                                        </div>
                                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                                            <div className="text-2xl font-bold text-red-500">
                                                {result.stats.failed}
                                            </div>
                                            <div className="text-xs text-slate-500">Failed</div>
                                        </div>
                                    </div>
                                )}

                                {result.results && result.results.length > 0 && (
                                    <div className="mt-4 max-h-64 overflow-y-auto">
                                        <h5 className="font-semibold mb-2 text-slate-700 dark:text-slate-300">
                                            Generated Data:
                                        </h5>
                                        <div className="space-y-1">
                                            {result.results.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300"
                                                >
                                                    ✅ {item.date || item.month}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {result.errors && result.errors.length > 0 && (
                                    <div className="mt-4 max-h-64 overflow-y-auto">
                                        <h5 className="font-semibold mb-2 text-red-700 dark:text-red-300">
                                            Errors:
                                        </h5>
                                        <div className="space-y-1">
                                            {result.errors.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg text-sm text-red-700 dark:text-red-300"
                                                >
                                                    ❌ {item.date || item.month}: {item.error}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )
            }

            {/* Info Card */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
            >
                <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">ℹ️ How It Works</h4>
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                    <li>• <strong>Daily Analytics:</strong> Aggregates user, revenue, and content metrics for specific days</li>
                    <li>• <strong>Content Performance:</strong> Updates real-time stats for all content types</li>
                    <li>• <strong>Monthly Analytics:</strong> Creates monthly summaries from daily data</li>
                    <li>• Data is saved to Firestore and appears immediately on the dashboard</li>
                    <li>• You can backfill historical data or regenerate existing dates</li>
                </ul>
            </motion.div>
        </div >
    );
};

export default AnalyticsGenerator;
