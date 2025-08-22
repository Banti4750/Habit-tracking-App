import { database, DATABASE_ID, HABBIT_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/types/database.types";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Query } from "react-native-appwrite";

const Streak = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [habits, setHabits] = React.useState<Habit[]>([]);
  const [loading, setLoading] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchHabits();
      }
    }, [user])
  );

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const response = await database.listDocuments(
        DATABASE_ID,
        HABBIT_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );
      setHabits(response.documents as Habit[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakStats = () => {
    if (habits.length === 0) return { totalStreaks: 0, longestStreak: 0, averageStreak: 0, completedToday: 0 };

    const totalStreaks = habits.reduce((sum, habit) => sum + habit.streak_count, 0);
    const longestStreak = Math.max(...habits.map(habit => habit.streak_count));
    const averageStreak = Math.round(totalStreaks / habits.length);
    
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habits.filter(habit => {
      if (!habit.last_completed) return false;
      const completedDate = new Date(habit.last_completed).toISOString().split('T')[0];
      return today === completedDate;
    }).length;

    return { totalStreaks, longestStreak, averageStreak, completedToday };
  };

  const getStreakLevel = (streak: number) => {
    if (streak >= 100) return { level: "🏆 Legend", color: "text-purple-600", bg: "bg-purple-100" };
    if (streak >= 50) return { level: "⭐ Master", color: "text-yellow-600", bg: "bg-yellow-100" };
    if (streak >= 30) return { level: "🔥 Expert", color: "text-orange-600", bg: "bg-orange-100" };
    if (streak >= 14) return { level: "💪 Strong", color: "text-blue-600", bg: "bg-blue-100" };
    if (streak >= 7) return { level: "🌱 Growing", color: "text-green-600", bg: "bg-green-100" };
    return { level: "🌟 Starter", color: "text-gray-600", bg: "bg-gray-100" };
  };

  const getMotivationalMessage = (completedToday: number, totalHabits: number) => {
    const percentage = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;
    
    if (percentage === 100) {
      return { message: "Perfect day! All habits completed! 🎉", color: "text-green-600" };
    } else if (percentage >= 75) {
      return { message: "Great progress! Almost there! 💪", color: "text-blue-600" };
    } else if (percentage >= 50) {
      return { message: "Good work! Keep pushing! 🚀", color: "text-orange-600" };
    } else if (percentage > 0) {
      return { message: "Nice start! Don't give up! 🌟", color: "text-purple-600" };
    }
    return { message: "Ready to start your day? 🌅", color: "text-gray-600" };
  };

  const getDaysOfWeek = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayString = date.toISOString().split('T')[0];
      
      // Calculate completion rate for this day
      const habitsCompletedOnDay = habits.filter(habit => {
        if (!habit.last_completed) return false;
        const completedDate = new Date(habit.last_completed).toISOString().split('T')[0];
        return completedDate === dayString;
      }).length;

      const completionRate = habits.length > 0 ? (habitsCompletedOnDay / habits.length) * 100 : 0;

      weekData.push({
        day: days[date.getDay()],
        date: date.getDate(),
        completionRate,
        isToday: i === 0
      });
    }

    return weekData;
  };

  const stats = getStreakStats();
  const weekData = getDaysOfWeek();
  const motivationalMsg = getMotivationalMessage(stats.completedToday, habits.length);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-8">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Streak Tracking
        </Text>
        <Text className="text-gray-600 text-center">
          Please sign in to track your streaks
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 pt-12 pb-4 px-6">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4 p-2 rounded-full bg-gray-100"
          >
            <Text className="text-gray-700 text-lg">←</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Streak Tracker
            </Text>
            <Text className="text-gray-600 mt-1">
              Track your consistency journey
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-600">Loading streak data...</Text>
          </View>
        ) : habits.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8 py-20">
            <View className="bg-gray-100 rounded-full p-6 mb-4">
              <Text className="text-4xl">📊</Text>
            </View>
            <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
              No habits to track
            </Text>
            <Text className="text-gray-600 text-center leading-6 mb-6">
              Create your first habit to start tracking streaks!
            </Text>
            <TouchableOpacity 
              className="bg-blue-500 rounded-lg px-6 py-3"
              onPress={() => router.push('/add-habit')}
            >
              <Text className="text-white font-semibold">
                Create Your First Habit
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-6 py-6 space-y-6">
            {/* Motivational Message */}
            <View className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <Text className={`text-lg font-semibold ${motivationalMsg.color} text-center`}>
                {motivationalMsg.message}
              </Text>
              <Text className="text-gray-600 text-center mt-2">
                {stats.completedToday} of {habits.length} habits completed today
              </Text>
            </View>

            {/* Stats Overview */}
            <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                📈 Your Stats
              </Text>
              <View className="flex-row flex-wrap">
                <View className="w-1/2 mb-4">
                  <Text className="text-2xl font-bold text-blue-600">{stats.totalStreaks}</Text>
                  <Text className="text-sm text-gray-600">Total Streaks</Text>
                </View>
                <View className="w-1/2 mb-4">
                  <Text className="text-2xl font-bold text-green-600">{stats.longestStreak}</Text>
                  <Text className="text-sm text-gray-600">Longest Streak</Text>
                </View>
                <View className="w-1/2">
                  <Text className="text-2xl font-bold text-orange-600">{stats.averageStreak}</Text>
                  <Text className="text-sm text-gray-600">Average Streak</Text>
                </View>
                <View className="w-1/2">
                  <Text className="text-2xl font-bold text-purple-600">{stats.completedToday}</Text>
                  <Text className="text-sm text-gray-600">Done Today</Text>
                </View>
              </View>
            </View>

            {/* Weekly Progress */}
            <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                📅 This Week
              </Text>
              <View className="flex-row justify-between">
                {weekData.map((day, index) => (
                  <View key={index} className="items-center">
                    <Text className={`text-xs font-medium mb-2 ${day.isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                      {day.day}
                    </Text>
                    <View 
                      className={`w-8 h-8 rounded-full items-center justify-center mb-1 ${
                        day.completionRate >= 100 ? 'bg-green-500' :
                        day.completionRate >= 75 ? 'bg-blue-500' :
                        day.completionRate >= 50 ? 'bg-orange-500' :
                        day.completionRate > 0 ? 'bg-yellow-500' : 'bg-gray-200'
                      }`}
                    >
                      {day.completionRate > 0 && (
                        <Text className="text-white text-xs font-bold">
                          {day.completionRate >= 100 ? '✓' : Math.round(day.completionRate)}
                        </Text>
                      )}
                    </View>
                    <Text className={`text-xs ${day.isToday ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                      {day.date}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Individual Habit Streaks */}
            <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                🎯 Habit Streaks
              </Text>
              <View className="space-y-3">
                {habits
                  .sort((a, b) => b.streak_count - a.streak_count)
                  .map((habit) => {
                    const level = getStreakLevel(habit.streak_count);
                    const isCompletedToday = (() => {
                      if (!habit.last_completed) return false;
                      const today = new Date().toISOString().split('T')[0];
                      const completedDate = new Date(habit.last_completed).toISOString().split('T')[0];
                      return today === completedDate;
                    })();

                    return (
                      <View 
                        key={habit.$id} 
                        className={`p-4 rounded-lg border-2 ${isCompletedToday ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                      >
                        <View className="flex-row justify-between items-center">
                          <View className="flex-1">
                            <View className="flex-row items-center">
                              <Text className={`font-semibold ${isCompletedToday ? 'text-green-900' : 'text-gray-900'}`}>
                                {habit.title}
                              </Text>
                              {isCompletedToday && (
                                <Text className="ml-2 text-green-600">✅</Text>
                              )}
                            </View>
                            <Text className={`text-xs mt-1 ${isCompletedToday ? 'text-green-700' : 'text-gray-600'}`}>
                              {habit.frequency} • Created {new Date(habit.created_at).toLocaleDateString()}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text className="text-2xl font-bold text-blue-600">
                              {habit.streak_count}
                            </Text>
                            <View className={`px-2 py-1 rounded-full ${level.bg}`}>
                              <Text className={`text-xs font-medium ${level.color}`}>
                                {level.level}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}
              </View>
            </View>

            {/* Streak Tips */}
            <View className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
              <View className="flex-row items-center mb-3">
                <Text className="text-2xl mr-2">💡</Text>
                <Text className="text-lg font-semibold text-orange-900">
                  Streak Tips
                </Text>
              </View>
              <Text className="text-orange-800 leading-5 mb-2">
                • Start small - consistency beats intensity
              </Text>
              <Text className="text-orange-800 leading-5 mb-2">
                • Set reminders at the same time daily
              </Text>
              <Text className="text-orange-800 leading-5 mb-2">
                • Track your progress visually
              </Text>
              <Text className="text-orange-800 leading-5">
                • Celebrate small wins along the way!
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Streak;