import { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeDatabase, clearAllLocalData } from './db';
import { syncClient } from './utils/sync';
import type { MealRecord, HouseholdGoal, PeriodFilter } from './types';
import { getLocalDateString } from './utils/formatters';
import { Navbar } from './components/Navbar';
import { HeroLedger } from './components/HeroLedger';
import { MealLogger } from './components/MealLogger';
import { GoalTracker } from './components/GoalTracker';
import { GoalModal } from './components/GoalModal';
import { ActivityFeed } from './components/ActivityFeed';
import { DeviceModal } from './components/DeviceModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { ConfirmResetModal } from './components/ConfirmResetModal';

export function App() {
  const [currentPeriod, setCurrentPeriod] = useState<PeriodFilter>('week');
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<MealRecord | null>(null);

  const [isSyncEnabled, setIsSyncEnabled] = useState(() => {
    return localStorage.getItem('delivery_saver_sync_enabled') === 'true'; // Defaults to false
  });

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('delivery_saver_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Initialize database without fake seed data and handle URL pairing query (?room=123456)
  useEffect(() => {
    initializeDatabase();

    // Check if opened via QR Code (?room=123456)
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    if (roomFromUrl && roomFromUrl.length >= 6) {
      syncClient.setRoomCode(roomFromUrl);
      setIsSyncEnabled(true);
      localStorage.setItem('delivery_saver_sync_enabled', 'true');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Connect or disconnect sync based on user toggle
  useEffect(() => {
    if (isSyncEnabled) {
      localStorage.setItem('delivery_saver_sync_enabled', 'true');
      syncClient.connect();
    } else {
      localStorage.setItem('delivery_saver_sync_enabled', 'false');
      syncClient.disconnect();
    }
  }, [isSyncEnabled]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('delivery_saver_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('delivery_saver_theme', 'light');
    }
  }, [isDark]);

  // Reactively query all meals
  const allMeals = useLiveQuery(() => db.meals.orderBy('timestamp').reverse().toArray()) || [];
  const primaryGoal = useLiveQuery(() => db.goals.get('primary-goal')) || null;

  // Period filtering
  const filteredMeals = useMemo(() => {
    const now = new Date();
    const todayStr = getLocalDateString(now);

    if (currentPeriod === 'today') {
      return allMeals.filter((m) => m.date === todayStr);
    }

    if (currentPeriod === 'week') {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return allMeals.filter((m) => m.timestamp >= oneWeekAgo);
    }

    if (currentPeriod === 'month') {
      const currentYearMonth = todayStr.substring(0, 7); // YYYY-MM
      return allMeals.filter((m) => m.date.startsWith(currentYearMonth));
    }

    return allMeals;
  }, [allMeals, currentPeriod]);

  // Aggregate calculations
  const totalSaved = useMemo(() => {
    return filteredMeals.reduce((acc, m) => acc + m.netSaved, 0);
  }, [filteredMeals]);

  const totalGroceries = useMemo(() => {
    return filteredMeals.reduce((acc, m) => acc + m.groceryCost, 0);
  }, [filteredMeals]);

  const allTimeSaved = useMemo(() => {
    return allMeals.reduce((acc, m) => acc + m.netSaved, 0);
  }, [allMeals]);

  // Dynamic cooking streak
  const streakDays = useMemo(() => {
    if (allMeals.length === 0) return 0;
    const uniqueDates = Array.from(new Set(allMeals.map((m) => m.date))).sort().reverse();
    if (uniqueDates.length === 0) return 0;

    const todayStr = getLocalDateString(new Date());
    const yesterdayStr = getLocalDateString(new Date(Date.now() - 86400000));

    // If the latest meal was not today or yesterday, streak resets to zero
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 1;
    let expectedDate = new Date(uniqueDates[0]);

    for (let i = 1; i < uniqueDates.length; i++) {
      expectedDate = new Date(expectedDate.getTime() - 86400000);
      const expectedStr = getLocalDateString(expectedDate);
      if (uniqueDates[i] === expectedStr) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [allMeals]);

  // Add meal record
  const handleAddMeal = async (newMeal: Omit<MealRecord, 'id'>) => {
    await db.meals.add(newMeal as MealRecord);
    if (isSyncEnabled) {
      syncClient.pushLocalState();
    }
  };

  // Save household goal
  const handleSaveGoal = async (goal: HouseholdGoal) => {
    await db.goals.put(goal);
  };

  // Custom meal deletion
  const handleConfirmDelete = async () => {
    if (!mealToDelete || !mealToDelete.id) return;
    await db.meals.delete(mealToDelete.id);
    if (isSyncEnabled) {
      syncClient.pushLocalState();
    }
    setMealToDelete(null);
  };

  // Reset all local data to start from scratch
  const handleConfirmReset = async () => {
    await clearAllLocalData();
    if (isSyncEnabled) {
      syncClient.pushLocalState();
    }
    setIsResetModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B0F17] dark:text-slate-100 transition-colors duration-200 antialiased font-sans">
      <Navbar
        onOpenDeviceModal={() => setIsDeviceModalOpen(true)}
        onOpenResetModal={() => setIsResetModalOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        streakDays={streakDays}
        isSyncEnabled={isSyncEnabled}
      />

      {/* Responsive Container: Mobile (1 column) / Desktop (12-column grid) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Top Financial Summary Ledger */}
        <HeroLedger
          totalSaved={totalSaved}
          totalGroceries={totalGroceries}
          ordersAvoidedCount={filteredMeals.length}
          currentPeriod={currentPeriod}
          onSelectPeriod={setCurrentPeriod}
        />

        {/* Split Grid Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Left Column (7 cols): Meal Logger Form */}
          <div className="lg:col-span-7 space-y-7">
            <MealLogger onAddMeal={handleAddMeal} />
          </div>

          {/* Right Column (5 cols): Household Goal & Activity Feed */}
          <div className="lg:col-span-5 space-y-6">
            <GoalTracker
              goal={primaryGoal}
              totalSaved={allTimeSaved}
              onEditGoal={() => setIsGoalModalOpen(true)}
            />
            <ActivityFeed
              meals={filteredMeals}
              currentPeriod={currentPeriod}
              onSelectPeriod={setCurrentPeriod}
              onRequestDelete={(meal) => setMealToDelete(meal)}
            />
          </div>
        </div>
      </main>

      {/* Device Pairing Modal with dynamic QR Code & sync toggle */}
      <DeviceModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        isSyncEnabled={isSyncEnabled}
        onToggleSync={setIsSyncEnabled}
      />

      {/* Household Goal Setup/Edit Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        currentGoal={primaryGoal}
        onSaveGoal={handleSaveGoal}
      />

      {/* Custom Delete Confirmation Modal */}
      <ConfirmDeleteModal
        mealToDelete={mealToDelete}
        onClose={() => setMealToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Reset / Start from Scratch Modal */}
      <ConfirmResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}

export default App;
