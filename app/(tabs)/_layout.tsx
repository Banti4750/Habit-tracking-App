import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        // Colors
        tabBarActiveTintColor: "#10B981", // emerald-500
        tabBarInactiveTintColor: "#6B7280", // gray-500
        tabBarStyle: {
          backgroundColor: "#F9FAFB",
          borderTopWidth: 0,
          elevation: 8,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          height: 80,
          paddingBottom: 18,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: "#F9FAFB",
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "700",
          color: "#111827",
        },
        headerTitleAlign: "center",
      }}
    >
      {/* Today Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Today Habbits",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <MaterialIcons name="today" size={26} color={color} />
            ) : (
              <MaterialIcons name="today" size={24} color={color} />
            ),
          headerTitle: "Today's Habits",
        }}
      />



      {/* Add Habit Tab */}
      <Tabs.Screen
        name="add-habit"
        options={{
          title: "Add Habit",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Ionicons name="add-circle" size={28} color={color} />
            ) : (
              <Ionicons name="add-circle-outline" size={26} color={color} />
            ),
          headerTitle: "Create a New Habit",
        }}
      />

      {/* Streak Tab */}
      <Tabs.Screen
        name="streak"
        options={{
          title: "Streak",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <MaterialIcons name="local-fire-department" size={26} color={color} />
            ) : (
              <MaterialIcons name="local-fire-department" size={24} color={color} />
            ),
          headerTitle: "Your Streaks",
        }}
      />
    </Tabs>
  );
}
