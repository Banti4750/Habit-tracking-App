import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
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
        headerTitleAlign: "center", // 👈 centers the title
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <MaterialIcons name="today" size={26} color={color} />
            ) : (
              <MaterialIcons name="today" size={24} color={color} />
            ),
          headerTitle: "Today's Habits",
        }}
      />

      <Tabs.Screen
        name="habits"
        options={{
          title: "Habits",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <FontAwesome5 name="check-circle" size={24} color={color} />
            ) : (
              <FontAwesome5 name="circle" size={24} color={color} />
            ),
          headerTitle: "My Habits",
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Ionicons name="stats-chart" size={26} color={color} />
            ) : (
              <Ionicons name="stats-chart-outline" size={24} color={color} />
            ),
          headerTitle: "Your Progress",
        }}
      />


    </Tabs>
  );
}
