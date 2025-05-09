import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  useFonts({
    calistoga: require("../assets/fonts/Calistoga-Regular.ttf"),
  });

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const getRole = async () => {
      try {
        const user = await AsyncStorage.getItem("user");

        // Check if user data exists
        if (user) {
          const parsedUser = JSON.parse(user);
          const userRole = parsedUser?.role;
          setRole(userRole);
        }
      } catch (error) {
        console.error("Error retrieving user role:", error);
      } finally {
        setLoading(false); // End loading once role is set or fails
      }
    };

    getRole();
  }, []);

  // Show a loading state or null while determining the role
  if (loading) {
    return null; // Or a loading spinner component
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Welcome",
        }}
      />
      <Stack.Screen
        name="login/index"
        options={{
          title: "Login",
        }}
      />
      <Stack.Screen
        name="register/provider"
        options={{
          title: "Provider Registration",
        }}
      />
      <Stack.Screen
        name="register/user"
        options={{
          title: "User Registration",
        }}
      />
      <Stack.Screen
        name="login/reset-password/index"
        options={{
          title: "Password Reset",
        }}
      />
      <Stack.Screen
        name="user/track-trip/index"
        options={{
          title: "Track Trip",
        }}
      />
      <Stack.Screen
        name="user/create-request/index"
        options={{
          title: "Request Trip",
        }}
      />
      <Stack.Screen
        name="user/create-request/LoadingProvider"
        options={{ title: "" }}
      />

      <Stack.Screen
        name="user/create-request/MapSelect"
        options={{
          title: "Select Destination",
        }}
      />
      <Stack.Screen
        name="user/track-trip/TripDetails"
        options={{
          title: "Trip Details",
        }}
      />
      <Stack.Screen
        name="user/track-trip/track-to-user"
        options={{
          title: "User's Location",
        }}
      />

      <Stack.Screen
        name="user/track-trip/TrackProvider"
        options={{
          title: "Track Trip - Provider",
        }}
      />
      <Stack.Screen
        name="user/track-trip/trip-completed"
        options={{
          title: "Trip Completed",
        }}
      />
      <Stack.Screen
        name="user/create-request/Feedback"
        options={{
          title: "Provider Feedback",
        }}
      />
      <Stack.Screen
        name="user/track-trip/tripHistory"
        options={{
          title: "",
        }}
      />
    </Stack>
  );
}
