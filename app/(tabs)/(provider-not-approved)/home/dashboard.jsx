import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function NotApproved() {
  return (
    <View style={styles.container}>
      {/* Icon */}
      <MaterialIcons name="hourglass-empty" size={100} color="#9b5377" />

      {/* Title */}
      <Text style={styles.title}>Your Request is Being Reviewed</Text>

      {/* Description */}
      <Text style={styles.description}>
        Thank you for registering as a provider. We are currently reviewing your
        request. You will receive a notification once your account is approved.
      </Text>

      {/* Image or Icon for visualization */}
      <Image
        source={{ uri: "https://via.placeholder.com/150" }} // Replace with a relevant image URL
        style={styles.image}
      />

      {/* Contact Support Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Contact Support</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9b5377",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#7B4E8C",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#9b5377",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
