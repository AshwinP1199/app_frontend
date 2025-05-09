import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const TripCompletionScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="check-circle" size={100} color="#4caf50" />
      <Text style={styles.title}>Trip Completed Successfully!</Text>
      <Text style={styles.message}>Thank you for Your service!</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("(tabs)/(provider)/home/dashboard")}
      >
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    color: "#4caf50",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
    color: "#555",
  },
  button: {
    backgroundColor: "#4caf50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default TripCompletionScreen;
