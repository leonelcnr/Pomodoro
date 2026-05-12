import { useMemo, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export type TimeRange = 'day' | 'week' | 'month' | 'year' | 'total';

export interface RangeStats {
  chartData: { name: string; minutes: number }[];
  displayMinutes: number;
  avgSessionMinutes: number;
  displayCompletedTasks: number;
  pieChartData: { name: string; value: number }[];
}

export function useDashboardStats(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: userStatsData } = useQuery({
    queryKey: ['userStats', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase.from('user_stats').select('*').eq('user_id', userId).single();
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: aggregates, isLoading: isLoadingAggregates } = useQuery({
    queryKey: ['dashboardAggregates', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase.rpc('get_dashboard_aggregates', { p_user_id: userId });
      if (error) throw error;
      return data as any;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: recentTasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['recentTasks', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('tasks')
        .select('id, header, type')
        .eq('user_id', userId)
        .eq('status', 'Completada')
        .order('id', { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // Suscripciones Realtime
  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel('dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_stats', filter: `user_id=eq.${userId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['userStats', userId] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboardAggregates', userId] });
        queryClient.invalidateQueries({ queryKey: ['recentTasks', userId] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_sessions', filter: `user_id=eq.${userId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboardAggregates', userId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); }
  }, [userId, queryClient]);

  // Compute charts for all ranges at once
  const statsByRange = useMemo(() => {
    const ranges: TimeRange[] = ['day', 'week', 'month', 'year', 'total'];
    const result = {} as Record<TimeRange, RangeStats>;

    const defaultRange: RangeStats = { chartData: [], displayMinutes: 0, avgSessionMinutes: 0, displayCompletedTasks: 0, pieChartData: [] };
    
    if (!aggregates) {
      ranges.forEach(r => { result[r] = { ...defaultRange }; });
      return result;
    }

    const argTodayStr = new Date().toLocaleString("sv-SE", { timeZone: "America/Argentina/Buenos_Aires" }).substring(0, 10);
    const todayObj = new Date(argTodayStr + 'T00:00:00');
    const monthsStr = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const daysStr = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    ranges.forEach(range => {
      let labels: string[] = [];
      let startDate = new Date(todayObj);

      if (range === 'week') {
        startDate.setDate(startDate.getDate() - 6);
        for (let i = 6; i >= 0; i--) {
          const d = new Date(todayObj);
          d.setDate(d.getDate() - i);
          labels.push(daysStr[d.getDay()]);
        }
      } else if (range === 'month') {
        startDate.setDate(startDate.getDate() - 29);
        for (let i = 29; i >= 0; i--) {
          const d = new Date(todayObj);
          d.setDate(d.getDate() - i);
          labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
        }
      } else if (range === 'year') {
        startDate.setMonth(startDate.getMonth() - 11);
        startDate.setDate(1);
        for (let i = 11; i >= 0; i--) {
          const d = new Date(todayObj);
          d.setMonth(d.getMonth() - i);
          labels.push(monthsStr[d.getMonth()]);
        }
      } else if (range === 'day') {
        for (let i = 0; i < 24; i++) {
          labels.push(`${i.toString().padStart(2, '0')}:00`);
        }
      } else if (range === 'total') {
        startDate.setDate(startDate.getDate() - 89);
        for (let i = 89; i >= 0; i--) {
          const d = new Date(todayObj);
          d.setDate(d.getDate() - i);
          labels.push(`${d.getDate()} ${monthsStr[d.getMonth()]}`);
        }
      }

      const aggregatedMap = new Map<string, number>();
      labels.forEach(l => aggregatedMap.set(l, 0));
      
      let totalMins = 0;
      let totalSessions = 0;

      if (range === 'day') {
        aggregates.hourly.forEach((row: any) => {
          if (row.stat_date === argTodayStr) {
            const label = `${row.stat_hour.toString().padStart(2, '0')}:00`;
            if (aggregatedMap.has(label)) {
              aggregatedMap.set(label, (aggregatedMap.get(label) || 0) + row.total_minutes);
            }
            totalMins += row.total_minutes;
          }
        });
        totalSessions = aggregates.daily.find((d: any) => d.stat_date === argTodayStr)?.sessions_count || 0;
      } else {
        aggregates.daily.forEach((row: any) => {
          const rowDate = new Date(row.stat_date + 'T00:00:00');
          if (rowDate >= startDate || range === 'total') {
            if (rowDate >= startDate) {
               let label = '';
               if (range === 'week') label = daysStr[row.day_of_week === 7 ? 0 : row.day_of_week]; 
               else if (range === 'month') label = `${rowDate.getDate()}/${rowDate.getMonth() + 1}`;
               else if (range === 'year') label = monthsStr[rowDate.getMonth()];
               else if (range === 'total') label = `${rowDate.getDate()} ${monthsStr[rowDate.getMonth()]}`;

               if (aggregatedMap.has(label)) {
                 aggregatedMap.set(label, (aggregatedMap.get(label) || 0) + row.total_minutes);
               }
            }
            totalMins += row.total_minutes;
            totalSessions += row.sessions_count;
          }
        });
      }

      const finalChartData = Array.from(aggregatedMap, ([name, minutes]) => ({ name, minutes }));

      const typeCount: Record<string, number> = {};
      let displayTasksCount = 0;
      aggregates.tasks.forEach((t: any) => {
        const taskDate = new Date(t.stat_date + 'T00:00:00');
        if (taskDate >= startDate || range === 'total') {
           const typeStr = t.task_type ? t.task_type.trim() : 'Otro';
           const type = typeStr.charAt(0).toUpperCase() + typeStr.slice(1);
           typeCount[type] = (typeCount[type] || 0) + t.tasks_count;
           displayTasksCount += t.tasks_count;
        }
      });

      const pieData = Object.entries(typeCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      if (range === 'total' && userStatsData) {
        totalMins = userStatsData.total_study_minutes || 0;
        totalSessions = aggregates.daily.reduce((acc: number, val: any) => acc + val.sessions_count, 0);
      }

      result[range] = {
        chartData: finalChartData,
        displayMinutes: totalMins,
        avgSessionMinutes: totalSessions > 0 ? totalMins / totalSessions : 0,
        displayCompletedTasks: displayTasksCount,
        pieChartData: pieData
      };
    });

    return result;
  }, [aggregates, userStatsData]);

  const { heatmapData, bestDaysData } = useMemo(() => {
    if (!aggregates) return { heatmapData: [], bestDaysData: [] };

    const dailyMins = new Map<string, number>();
    const weekDaysStats = Array.from({ length: 7 }, () => ({ totalMins: 0, uniqueDays: new Set<string>() }));

    aggregates.daily.forEach((row: any) => {
      dailyMins.set(row.stat_date, row.total_minutes);
      
      const jsDayOfWeek = row.day_of_week === 7 ? 0 : row.day_of_week;
      weekDaysStats[jsDayOfWeek].totalMins += row.total_minutes;
      weekDaysStats[jsDayOfWeek].uniqueDays.add(row.stat_date);
    });
    
    const calculatedHeatmapData = Array.from(dailyMins.entries()).map(([date, value]) => ({ date, value }));

    const daysLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const calculatedBestDaysData = daysLabels.map((name, i) => {
      const stat = weekDaysStats[i];
      const daysCount = stat.uniqueDays.size || 1; 
      return {
        name,
        avgMinutes: Math.round(stat.totalMins / daysCount)
      };
    });

    return { heatmapData: calculatedHeatmapData, bestDaysData: calculatedBestDaysData };
  }, [aggregates]);

  return {
    stats: {
      totalMinutes: userStatsData?.total_study_minutes || 0,
      currentStreak: userStatsData?.current_streak || 0,
      completedTasks: 0
    },
    recentTasks: recentTasks || [],
    statsByRange,
    heatmapData,
    bestDaysData,
    isLoading: isLoadingAggregates || isLoadingTasks
  };
}

