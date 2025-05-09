import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "../../../api/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";

const TripDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const router = useRouter();
  const { tripId } = route.params;
  const [tripDetails, setTripDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // This ref will help avoid multiple navigations
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    const fetchTripDetails = async () => {
      setLoading(true);
      try {
        const response = await axios(`/trip-request/get-trip/${tripId}`);
        const data = response.data?.data?.tripRequest;
        setTripDetails(data);
        console.log("trip details", data);

        // Only navigate if status is 'ended' and we haven't navigated yet
        if (data?.status === "ended" && !hasNavigatedRef.current) {
          hasNavigatedRef.current = true; // Mark navigation as completed
          router.push({
            pathname: "user/create-request/Feedback",
            params: { tripId: data._id },
          });
        }

        await AsyncStorage.setItem("startedTrip", JSON.stringify(data));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();

    // Notification listener
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { data } = notification.request.content;
        if (data.tripId === tripId) {
          fetchTripDetails(); // Refresh trip details when a relevant notification is received
        }
      }
    );

    // Cleanup listener on unmount
    return () => subscription.remove();
  }, [tripId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!tripDetails && !loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          {error || "No trip details available."}
        </Text>
      </View>
    );
  }

  const handleTrackTrip = () => {
    router.push("user/track-trip");
  };

  const handleProviderDetails = () => {
    const providerId = tripDetails.providerId;
    if (providerId) {
      router.push({
        pathname: "user/track-trip/provider-details",
        params: { providerId, tripId: tripDetails._id },
      });
    } else {
      Alert.alert(
        "No provider assigned",
        "Please assign a provider to view details."
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Trip Details</Text>

      <Text style={styles.heading}>Trip ID:</Text>
      <Text style={styles.text}>{tripDetails._id || "N/A"}</Text>

      <Text style={styles.heading}>User ID:</Text>
      <Text style={styles.text}>{tripDetails.userId || "N/A"}</Text>

      <Text style={styles.heading}>Provider ID:</Text>
      <Text style={styles.text}>
        {tripDetails.providerId || "No provider assigned yet"}
      </Text>

      <Text style={styles.heading}>Pickup Location:</Text>
      <Text style={styles.text}>
        {tripDetails.pickupLocation?.name || "N/A"}
      </Text>

      <Text style={styles.heading}>Dropoff Location:</Text>
      <Text style={styles.text}>
        {tripDetails.dropoffLocation?.name || "N/A"}
      </Text>

      <Text style={styles.heading}>Status:</Text>
      <Text style={styles.text}>{tripDetails.status || "Pending"}</Text>

      <Text style={styles.heading}>Created At:</Text>
      <Text style={styles.text}>
        {tripDetails.createdAt
          ? new Date(tripDetails.createdAt).toLocaleString()
          : "N/A"}
      </Text>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleTrackTrip}>
          <Text style={styles.buttonText}>Track Trip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleProviderDetails}>
          <Text style={styles.buttonText}>Provider Details</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
    top: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
    color: "#333",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: "#9B5377",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default TripDetails;
