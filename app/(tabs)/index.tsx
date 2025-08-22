import { database, DATABASE_ID, HABBIT_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/types/database.types";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useRef } from "react";
import { Animated, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Button } from "react-native-paper";
import './../../global.css';

export default function Index() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [habits, setHabits] = React.useState<Habit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const swipeableRefs = useRef<{[key: string]: Swipeable | null}>({});

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

  const deleteHabit = async (habitId: string) => {
    try {
      await database.deleteDocument(DATABASE_ID, HABBIT_COLLECTION_ID, habitId);
      setHabits(habits.filter(habit => habit.$id !== habitId));
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  const markHabitDone = async (habitId: string) => {
  try {
    const habit = habits.find(h => h.$id === habitId);
    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];
    const lastCompleted = habit.last_completed ? new Date(habit.last_completed).toISOString().split('T')[0] : '';
    
    // Check if already completed today
    if (lastCompleted === today) {
      return; // Already completed today
    }

    let newStreakCount = habit.streak_count;

    // Calculate streak properly
    if (habit.last_completed) {
      const lastCompletedDate = new Date(habit.last_completed);
      const todayDate = new Date();
      const diffTime = todayDate.getTime() - lastCompletedDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // For daily habits
      if (habit.frequency.toLowerCase() === 'daily') {
        if (diffDays === 1) {
          // Consecutive day - increment streak
          newStreakCount = habit.streak_count + 1;
        } else if (diffDays > 1) {
          // Streak broken - reset to 1
          newStreakCount = 1;
        } else {
          // Same day (shouldn't happen due to check above, but safety)
          return;
        }
      } 
      // For weekly habits
      else if (habit.frequency.toLowerCase() === 'weekly') {
        if (diffDays >= 6 && diffDays <= 8) {
          // Within weekly range - increment streak
          newStreakCount = habit.streak_count + 1;
        } else if (diffDays > 8) {
          // Streak broken - reset to 1
          newStreakCount = 1;
        } else {
          // Too soon
          return;
        }
      }
      // For monthly habits
      else if (habit.frequency.toLowerCase() === 'monthly') {
        if (diffDays >= 28 && diffDays <= 35) {
          // Within monthly range - increment streak
          newStreakCount = habit.streak_count + 1;
        } else if (diffDays > 35) {
          // Streak broken - reset to 1
          newStreakCount = 1;
        } else {
          // Too soon
          return;
        }
      }
      // For other frequencies, just increment
      else {
        newStreakCount = habit.streak_count + 1;
      }
    } else {
      // First time completing this habit
      newStreakCount = 1;
    }

    const updatedHabit = {
      ...habit,
      streak_count: newStreakCount,
      last_completed: new Date().toISOString(),
    };

    await database.updateDocument(DATABASE_ID, HABBIT_COLLECTION_ID, habitId, {
      streak_count: updatedHabit.streak_count,
      last_completed: updatedHabit.last_completed,
    });

    setHabits(habits.map(h => h.$id === habitId ? updatedHabit : h));
  } catch (error) {
    console.error("Error marking habit as done:", error);
  }
};

  const closeSwipeable = (habitId: string) => {
    const swipeable = swipeableRefs.current[habitId];
    if (swipeable) {
      swipeable.close();
    }
  };

  const renderLeftActions = (habitId: string) => (
    <View className="flex-1 flex-row">
      <Animated.View className="bg-green-500 flex-1 justify-center items-center">
        <TouchableOpacity
          className="flex-1 justify-center items-center px-6"
          onPress={() => {
            markHabitDone(habitId);
            closeSwipeable(habitId);
          }}
        >
          <Text className="text-white text-2xl">✓</Text>
          <Text className="text-white font-semibold text-sm mt-1">Done</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  const renderRightActions = (habitId: string) => (
    <View className="flex-1 flex-row">
      <Animated.View className="bg-red-500 flex-1 justify-center items-center">
        <TouchableOpacity
          className="flex-1 justify-center items-center px-6"
          onPress={() => {
            deleteHabit(habitId);
            closeSwipeable(habitId);
          }}
        >
          <Text className="text-white text-2xl">🗑️</Text>
          <Text className="text-white font-semibold text-sm mt-1">Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHabits();
    setRefreshing(false);
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-green-600";
    if (streak >= 14) return "text-blue-600";
    if (streak >= 7) return "text-yellow-600";
    return "text-gray-600";
  };

  const getFrequencyBadgeColor = (frequency: string) => {
    switch (frequency.toLowerCase()) {
      case 'daily': return "bg-green-100 text-green-800";
      case 'weekly': return "bg-blue-100 text-blue-800";
      case 'monthly': return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const isCompletedToday = (lastCompleted: string) => {
    if (!lastCompleted) return false;
    const today = new Date().toISOString().split('T')[0];
    const completedDate = new Date(lastCompleted).toISOString().split('T')[0];
    return today === completedDate;
  };

  const renderHabitCard = ({ item }: { item: Habit }) => (
    <Swipeable
      ref={(ref) => {
        if (ref) {
          swipeableRefs.current[item.$id] = ref;
        }
      }}
      renderLeftActions={() => renderLeftActions(item.$id)}
      renderRightActions={() => renderRightActions(item.$id)}
      leftThreshold={80}
      rightThreshold={80}
    >
      <TouchableOpacity 
        className={`bg-white rounded-xl shadow-sm border border-gray-100 mx-4 mb-4 p-4 ${
          isCompletedToday(item.last_completed) ? 'bg-green-50 border-green-200' : ''
        }`}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center">
              <Text className={`text-lg font-semibold mb-1 ${
                isCompletedToday(item.last_completed) ? 'text-green-900' : 'text-gray-900'
              }`}>
                {item.title}
              </Text>
              {isCompletedToday(item.last_completed) && (
                <Text className="ml-2 text-green-600 text-lg">✅</Text>
              )}
            </View>
            {item.description && (
              <Text className={`text-sm leading-5 ${
                isCompletedToday(item.last_completed) ? 'text-green-700' : 'text-gray-600'
              }`}>
                {item.description}
              </Text>
            )}
          </View>
          <View className={`px-2 py-1 rounded-full ${getFrequencyBadgeColor(item.frequency)}`}>
            <Text className="text-xs font-medium capitalize">
              {item.frequency}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="bg-orange-50 rounded-lg px-3 py-2">
              <Text className="text-xs text-orange-600 font-medium">STREAK</Text>
              <Text className={`text-xl font-bold ${getStreakColor(item.streak_count)}`}>
                {item.streak_count}
              </Text>
            </View>
            {item.last_completed && (
              <View className="ml-4">
                <Text className="text-xs text-gray-500">Last completed</Text>
                <Text className="text-sm text-gray-700">
                  {new Date(item.last_completed).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            className={`rounded-lg px-4 py-2 ${
              isCompletedToday(item.last_completed) 
                ? 'bg-green-100 border border-green-300' 
                : 'bg-blue-500'
            }`}
            onPress={() => !isCompletedToday(item.last_completed) && markHabitDone(item.$id)}
            disabled={isCompletedToday(item.last_completed)}
          >
            <Text className={`font-medium text-sm ${
              isCompletedToday(item.last_completed) ? 'text-green-700' : 'text-white'
            }`}>
              {isCompletedToday(item.last_completed) ? '✓ Done' : 'Mark Done'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <View className="bg-gray-50 rounded-full p-6 mb-4">
        <Text className="text-4xl">🎯</Text>
      </View>
      <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
        No habits yet
      </Text>
      <Text className="text-gray-600 text-center leading-6">
        Start building better habits by creating your first one!
      </Text>
      <TouchableOpacity className="bg-blue-500 rounded-lg px-6 py-3 mt-6">
        <Text className="text-white font-semibold" onPress={()=>{router.push('/add-habit')}}>
          Create Your First Habit
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-8">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Habit Tracker
        </Text>
        <Text className="text-gray-600 text-center">
          Please sign in to track your habits
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 pt-12 pb-4 px-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              My Habits
            </Text>
            <Text className="text-gray-600">
              {habits.length} {habits.length === 1 ? 'habit' : 'habits'} tracked
            </Text>
          </View>
          <Button 
            mode="outlined" 
            onPress={signOut} 
            icon="logout"
            textColor="#ef4444"
            style={{ borderColor: '#ef4444' }}
          >
            Logout
          </Button>
        </View>
      </View>

      {/* Habits List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">Loading habits...</Text>
        </View>
      ) : habits.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={habits}
          renderItem={renderHabitCard}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      {habits.length > 0 && (
        <TouchableOpacity className="absolute bottom-6 right-6 bg-blue-500 rounded-full w-14 h-14 items-center justify-center shadow-lg">
          <Text className="text-white text-2xl font-light" onPress={()=>{router.push('/add-habit')}}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}