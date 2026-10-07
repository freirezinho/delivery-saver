export interface MealItem {
  name: string;
  price: number;
}

export interface MealRecord {
  id?: number;
  uuid: string;
  name: string;
  takeoutCost: number;
  groceryCost: number;
  netSaved: number;
  feeMarkup?: number;
  date: string; // YYYY-MM-DD
  timestamp: number;
  createdAt: string;
  mealSlot?: 'Lunch' | 'Dinner' | 'Breakfast' | 'Snack';
  breakdown?: {
    foodItems?: number;
    deliveryFee?: number;
    serviceTax?: number;
    courierTip?: number;
  };
}

export interface HouseholdGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  isCompleted?: boolean;
}

export type PeriodFilter = 'today' | 'week' | 'month' | 'all';

export interface UserPreferences {
  currency: string;
  soundEnabled: boolean;
  theme: 'light' | 'dark';
  defaultTakeoutBenchmark: number;
  defaultGroceryBenchmark: number;
  syncPairingCode?: string;
  syncServerUrl?: string;
}
