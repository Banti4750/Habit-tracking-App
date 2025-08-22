import { database, DATABASE_ID, HABBIT_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/types/database.types";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { Query } from "react-native-appwrite";
import { Button } from "react-native-paper";
import './../../global.css';

export default function Index() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [habits, setHabits] = React.useState<Habit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

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
      // console.log(response.documents);
      setHabits(response.documents as Habit[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

  const renderHabitCard = ({ item }: { item: Habit }) => (
    <TouchableOpacity className="bg-white rounded-xl shadow-sm border border-gray-100 mx-4 mb-4 p-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            {item.title}
          </Text>
          {item.description && (
            <Text className="text-sm text-gray-600 leading-5">
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
        
        <TouchableOpacity className="bg-blue-500 rounded-lg px-4 py-2">
          <Text className="text-white font-medium text-sm">
            Mark Done
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
        <Text className="text-white font-semibold" onPress={()=>{ router.push('/add-habit')}}>
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
          <Text className="text-white text-2xl font-light" onPress={()=>{ router.push('/add-habit')}}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}