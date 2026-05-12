import { useState, useEffect, useMemo } from 'react';
import supabase from '@/lib/supabase';

export type TimeRange = 'day' | 'week' | 'month' | 'year' | 'total';

export function useDashboardStats(userId: string | undefined, timeRange: TimeRange) {
  const [stats, setStats] = useState({ totalMinutes: 0, completedTasks: 0, currentStreak: 0 });
  const [allSessionsData, setAllSessionsData] = useState<any[]>([]); 
  const [completedTasksData, setCompletedTasksData] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    const loadGeneralStats = async () => {
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: allCompletedTasks } = await supabase
        .from('tasks')
        .select('id, type, created_at')
        .eq('user_id', userId)
        .eq('status', 'Completada');

      if (allCompletedTasks) setCompletedTasksData(allCompletedTasks);

      setStats({
        totalMinutes: userStats?.total_study_minutes || 0,
        currentStreak: userStats?.current_streak || 0,
        completedTasks: allCompletedTasks?.length || 0
      });

      const { data: recent, error: recentError } = await supabase
        .from('tasks')
        .select('id, header, type')
        .eq('user_id', userId)
        .eq('status', 'Completada')
        .order('id', { ascending: false })
        .limit(5);

      if (recentError) console.error("Error fetching recent tasks:", recentError);
      if (recent) setRecentTasks(recent);
    };

    loadGeneralStats();

    const channelGeneralStats = supabase.channel('dashboard_general_stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_stats', filter: `user_id=eq.${userId}` }, loadGeneralStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` }, loadGeneralStats)
      .subscribe();

    return () => { supabase.removeChannel(channelGeneralStats); }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    const loadAllSessions = async () => {
      const { data: rawSessions, error: rawError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId);

      if (rawError) console.error("Error fetching sessions:", rawError);
      if (rawSessions && isMounted) setAllSessionsData(rawSessions);
    };

    loadAllSessions();

    const channelSessions = supabase.channel(`dashboard_sessions_all`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_sessions', filter: `user_id=eq.${userId}` }, () => {
        loadAllSessions();
      })
      .subscribe();

    return () => { 
      isMounted = false;
      supabase.removeChannel(channelSessions); 
    }
  }, [userId]);

  const { chartData, displayMinutes, avgSessionMinutes, displayCompletedTasks, pieChartData } = useMemo(() => {
    let currentStartDate = new Date();
    let labels: string[] = [];
    const monthsStr = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    if (timeRange === 'week') {
      currentStartDate.setDate(currentStartDate.getDate() - 6);
      currentStartDate.setHours(0, 0, 0, 0);
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(days[d.getDay()]);
      }
    } else if (timeRange === 'month') {
      currentStartDate.setDate(currentStartDate.getDate() - 29);
      currentStartDate.setHours(0, 0, 0, 0);
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
      }
    } else if (timeRange === 'year') {
      currentStartDate.setMonth(currentStartDate.getMonth() - 11);
      currentStartDate.setDate(1);
      currentStartDate.setHours(0, 0, 0, 0);
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        labels.push(monthsStr[d.getMonth()]);
      }
    } else if (timeRange === 'day') {
      currentStartDate.setHours(0, 0, 0, 0);
      for (let i = 0; i < 24; i++) {
        labels.push(`${i.toString().padStart(2, '0')}:00`);
      }
    } else if (timeRange === 'total') {
      currentStartDate.setDate(currentStartDate.getDate() - 89);
      currentStartDate.setHours(0, 0, 0, 0);
      for (let i = 89; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(`${d.getDate()} ${monthsStr[d.getMonth()]}`);
      }
    }

    const aggregatedData = new Map<string, number>();
    labels.forEach(l => aggregatedData.set(l, 0));
    
    let totalMins = 0;
    let totalSessions = 0;

    allSessionsData.forEach(session => {
      let dateStr = session.created_at;
      if (dateStr && !dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.includes('-')) dateStr += 'Z';
      const start = new Date(dateStr);
      
      if (start >= currentStartDate || timeRange === 'total') {
         if (start >= currentStartDate) {
           let label = '';
           if (timeRange === 'day') {
              label = `${start.getHours().toString().padStart(2, '0')}:00`;
           } else if (timeRange === 'week') {
              const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
              label = days[start.getDay()];
           } else if (timeRange === 'month') {
              label = `${start.getDate()}/${start.getMonth() + 1}`;
           } else if (timeRange === 'year') {
              label = monthsStr[start.getMonth()];
           } else if (timeRange === 'total') {
              label = `${start.getDate()} ${monthsStr[start.getMonth()]}`;
           }

           if (aggregatedData.has(label)) {
             aggregatedData.set(label, (aggregatedData.get(label) || 0) + session.duration_minutes);
           }
         }
         
         totalMins += Number(session.duration_minutes) || 0;
         totalSessions += 1;
      }
    });

    const finalChartData = Array.from(aggregatedData, ([name, minutes]) => ({ name, minutes }));

    const tasksStartDate = timeRange === 'total' ? new Date(0) : currentStartDate;
    const filteredTasks = completedTasksData.filter(t => {
      let dateStr = t.created_at;
      if (dateStr && !dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.includes('-')) dateStr += 'Z';
      return new Date(dateStr) >= tasksStartDate;
    });

    const typeCount: Record<string, number> = {};
    filteredTasks.forEach(t => {
      const typeStr = t.type ? t.type.trim() : 'Otro';
      const type = typeStr.charAt(0).toUpperCase() + typeStr.slice(1);
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const pieData = Object.entries(typeCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    if (timeRange === 'total') {
      totalMins = stats.totalMinutes;
      totalSessions = allSessionsData.length;
    }

    return {
      chartData: finalChartData,
      displayMinutes: totalMins,
      avgSessionMinutes: totalSessions > 0 ? totalMins / totalSessions : 0,
      displayCompletedTasks: filteredTasks.length,
      pieChartData: pieData
    };
  }, [timeRange, stats.totalMinutes, completedTasksData, allSessionsData]);

  const { heatmapData, bestDaysData } = useMemo(() => {
    const dailyMins = new Map<string, number>();
    const weekDaysStats = Array.from({ length: 7 }, () => ({ totalMins: 0, uniqueDays: new Set<string>() }));

    allSessionsData.forEach(row => {
      if (!row.created_at) return;
      let dateStr = row.created_at;
      if (!dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.includes('-')) dateStr += 'Z';
      const d = new Date(dateStr);
      
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dailyMins.set(dayKey, (dailyMins.get(dayKey) || 0) + (Number(row.duration_minutes) || 0));

      const dayOfWeek = d.getDay();
      weekDaysStats[dayOfWeek].totalMins += (Number(row.duration_minutes) || 0);
      weekDaysStats[dayOfWeek].uniqueDays.add(dayKey);
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
  }, [allSessionsData]);

  return {
    stats,
    recentTasks,
    chartData,
    displayMinutes,
    avgSessionMinutes,
    displayCompletedTasks,
    pieChartData,
    heatmapData,
    bestDaysData
  };
}
