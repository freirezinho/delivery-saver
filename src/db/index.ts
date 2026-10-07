import Dexie, { type Table } from 'dexie';
import type { MealRecord, HouseholdGoal } from '../types';

export class DeliverySaverDB extends Dexie {
  meals!: Table<MealRecord, number>;
  goals!: Table<HouseholdGoal, string>;

  constructor() {
    super('DeliverySaverDB');
    this.version(1).stores({
      meals: '++id, uuid, date, timestamp, netSaved',
      goals: 'id'
    });
  }
}

export const db = new DeliverySaverDB();

// Clean default starter: do NOT populate dummy meals automatically
// Starts 100% from scratch
export async function initializeDatabase() {
  // If no goal exists, create default template goal (at R$ 0)
  const existingGoal = await db.goals.get('primary-goal');
  if (!existingGoal) {
    await db.goals.put({
      id: 'primary-goal',
      title: 'Meta da Casa',
      targetAmount: 500,
      currentAmount: 0,
      isCompleted: false
    });
  }
}

// Clear all data to restart from scratch
export async function clearAllLocalData() {
  await db.meals.clear();
  await db.goals.clear();
  await initializeDatabase();
}
