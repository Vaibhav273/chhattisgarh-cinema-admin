import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { ContentPerformance } from '../types/analytics';
import type { ContentCategory } from '../types/common';

interface UseRealtimeContentPerformanceReturn {
    data: ContentPerformance[];
    loading: boolean;
    error: Error | null;
}

export const useRealtimeContentPerformance = (
    totalMovies: number,
    totalSeries: number,
    totalShortFilms: number,
    totalEvents: number,
    totalViews: number,
    totalRevenue: number,
    watchTime: number,
    avgRating: number
): UseRealtimeContentPerformanceReturn => {
    const [data, setData] = useState<ContentPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        console.log('🎬 Setting up real-time content performance listener...');

        // Listen to contentPerformance document
        const unsubscribe = onSnapshot(
            doc(db, 'analytics', 'contentPerformance'),
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    console.log('✅ Content performance data updated');
                    const data = docSnapshot.data();

                    const performance: ContentPerformance[] = [
                        {
                            contentType: 'movie' as ContentCategory,
                            label: 'Movies',
                            views: data.movieViews || 0,
                            watchTime: data.movieWatchTime || 0,
                            revenue: data.movieRevenue || 0,
                            avgRating: data.movieAvgRating || avgRating,
                            totalContent: totalMovies,
                            color: '#3b82f6',
                        },
                        {
                            contentType: 'webseries' as ContentCategory,
                            label: 'Web Series',
                            views: data.seriesViews || 0,
                            watchTime: data.seriesWatchTime || 0,
                            revenue: data.seriesRevenue || 0,
                            avgRating: data.seriesAvgRating || avgRating,
                            totalContent: totalSeries,
                            color: '#a855f7',
                        },
                        {
                            contentType: 'shortfilm' as ContentCategory,
                            label: 'Short Films',
                            views: data.shortFilmViews || 0,
                            watchTime: data.shortFilmWatchTime || 0,
                            revenue: data.shortFilmRevenue || 0,
                            avgRating: data.shortFilmAvgRating || avgRating,
                            totalContent: totalShortFilms,
                            color: '#10b981',
                        },
                        {
                            contentType: 'event' as ContentCategory,
                            label: 'Events',
                            views: data.eventViews || 0,
                            watchTime: data.eventWatchTime || 0,
                            revenue: data.eventRevenue || 0,
                            avgRating: data.eventAvgRating || avgRating,
                            totalContent: totalEvents,
                            color: '#f59e0b',
                        },
                    ].filter(item => item.totalContent > 0);

                    setData(performance);
                    setLoading(false);
                    setError(null);
                } else {
                    // Fallback calculation
                    console.log('⚠️ No content performance doc, using fallback...');
                    const performance: ContentPerformance[] = [
                        {
                            contentType: 'movie' as ContentCategory,
                            label: 'Movies',
                            views: Math.floor(totalViews * 0.45),
                            watchTime: Math.floor(watchTime * 0.40),
                            revenue: Math.floor(totalRevenue * 0.35),
                            avgRating: avgRating || 4.2,
                            totalContent: totalMovies,
                            color: '#3b82f6',
                        },
                        {
                            contentType: 'webseries' as ContentCategory,
                            label: 'Web Series',
                            views: Math.floor(totalViews * 0.35),
                            watchTime: Math.floor(watchTime * 0.45),
                            revenue: Math.floor(totalRevenue * 0.40),
                            avgRating: avgRating || 4.3,
                            totalContent: totalSeries,
                            color: '#a855f7',
                        },
                        {
                            contentType: 'shortfilm' as ContentCategory,
                            label: 'Short Films',
                            views: Math.floor(totalViews * 0.15),
                            watchTime: Math.floor(watchTime * 0.10),
                            revenue: Math.floor(totalRevenue * 0.15),
                            avgRating: avgRating || 4.0,
                            totalContent: totalShortFilms,
                            color: '#10b981',
                        },
                        {
                            contentType: 'event' as ContentCategory,
                            label: 'Events',
                            views: Math.floor(totalViews * 0.05),
                            watchTime: Math.floor(watchTime * 0.05),
                            revenue: Math.floor(totalRevenue * 0.10),
                            avgRating: avgRating || 4.5,
                            totalContent: totalEvents,
                            color: '#f59e0b',
                        },
                    ].filter(item => item.totalContent > 0);

                    setData(performance);
                    setLoading(false);
                }
            },
            (err) => {
                console.error('❌ Content performance listener error:', err);
                setError(err);
                setLoading(false);
            }
        );

        return () => {
            console.log('🔌 Disconnecting content performance listener');
            unsubscribe();
        };
    }, [totalMovies, totalSeries, totalShortFilms, totalEvents, totalViews, totalRevenue, watchTime, avgRating]);

    return { data, loading, error };
};
