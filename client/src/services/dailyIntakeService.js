// Daily intake service — all reads/writes go through the backend API (no direct DB).
import api from "./api";

class DailyIntakeService {
  getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  async getTodayIntake() {
    return (await api.get("/data/daily-intake/today")).data;
  }

  async addFoodEntry(foodData) {
    return (await api.post("/data/daily-intake/food-entries", foodData)).data;
  }

  async removeFoodEntry(foodEntryId) {
    await api.delete(`/data/daily-intake/food-entries/${foodEntryId}`);
    return true;
  }

  async updateWaterIntake(amount) {
    await api.post("/data/daily-intake/water", { water: amount });
    return true;
  }

  async updateSteps(steps) {
    await api.put("/data/daily-intake/steps", { steps });
    return true;
  }

  async updateSleep(hours) {
    await api.put("/data/daily-intake/sleep", { sleep: hours });
    return true;
  }

  async updateMood(mood) {
    await api.put("/data/daily-intake/mood", { mood });
    return true;
  }

  async updateCalories(calories) {
    await api.put("/data/daily-intake/calories", { totalCalories: calories });
    return true;
  }

  async getTodayFoodEntries() {
    return (await api.get("/data/daily-intake/food-entries")).data;
  }

  async getDailyIntakeByDate(date) {
    return (await api.get(`/data/daily-intake/${date}`)).data;
  }

  async getFoodEntriesByDate(date) {
    return (await api.get("/data/daily-intake/food-entries", { params: { date } })).data;
  }

  async getWeeklyData() {
    return (await api.get("/data/daily-intake/weekly")).data;
  }

  async getUserGoals() {
    return (await api.get("/data/daily-goals")).data;
  }

  async updateUserGoals(goals) {
    await api.put("/data/daily-goals", goals);
    return true;
  }
}

const dailyIntakeService = new DailyIntakeService();
export default dailyIntakeService;
