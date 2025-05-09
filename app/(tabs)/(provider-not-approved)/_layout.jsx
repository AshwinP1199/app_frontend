import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ProviderLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home/dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
