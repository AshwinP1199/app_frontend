import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity, // Import TouchableOpacity for custom button styles
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import axios from "../../../api/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoadingScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const route = useRoute();
  const { tripId } = route.params;
  const [tripStatus, setTripStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null); // Create a ref to store the interval ID

  const checkTripStatus = async () => {
    try {
      const response = await axios.get(`/trip-request/get-trip/${tripId}`);
      setTripStatus(response.data?.data?.tripRequest?.status);
    } catch (error) {
      console.error("Error fetching trip status:", error);
    }
  };

  const handleTripResponse = async (tripId, response) => {
    try {
      await axios.put(`/trip-request/${tripId}/status`, {
        status: response,
      });
      Alert.alert("Success", `Trip has been ${response}`);
      AsyncStorage.removeItem("tripRequest");
      if (response === "cancelled") {
        clearInterval(intervalRef.current); // Clear the interval if trip is canceled
      }
      router.push("(tabs)/(user)/home/dashboard");
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong."
      );
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (tripStatus !== "accepted") {
        checkTripStatus();
      } else {
        clearInterval(intervalRef.current);
      }
    }, 5000);

    return () => clearInterval(intervalRef.current); // Clear interval on component unmount
  }, [tripStatus]);

  useEffect(() => {
    if (tripStatus === "accepted") {
      setLoading(false);
      clearInterval(intervalRef.current); // Clear the interval when trip is accepted
      router.push({
        pathname: "/user/track-trip/TripDetails",
        params: { tripId },
      });
    }
  }, [tripStatus]);

  return (
    <View style={styles.container}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color="#7E245D" />
          <Text style={styles.loadingText}>Waiting for nearby provider...</Text>

          {/* Cancel Trip Button */}
          <TouchableOpacity
            style={styles.buttonCancel}
            onPress={() => handleTripResponse(tripId, "cancelled")}
          >
            <Text style={styles.buttonText}>Cancel Trip</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.successText}>Trip is ready!</Text>
      )}

      {/* Go to Provider Home Button */}
      {/* <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("(tabs)/(user)/home/dashboard")}
      >
        <Text style={styles.buttonText}>Go to Provider Home</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: "#7E245D",
  },
  successText: {
    marginTop: 20,
    fontSize: 18,
    color: "#28a745",
  },
  button: {
    backgroundColor: "#7E245D", // Button color
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20, // Space between buttons
    width: "80%", // Optional: set a width for the button
  },
  buttonCancel: {
    backgroundColor: "red", // Button color
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20, // Space between buttons
    width: "80%", // Optional: set a width for the button
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default LoadingScreen;
