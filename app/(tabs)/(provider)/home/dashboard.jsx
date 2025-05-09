import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import axios from "../../../../api/axios";
import moment from "moment";
import { useRouter } from "expo-router";

export default function ProviderDashboard() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState();
  const [locationInterval, setLocationInterval] = useState(null);
  const [user, setUser] = useState();
  const [monthsInSystem, setMonthsInSystem] = useState(0);
  const [days, setDays] = useState(false);
  const [trips, setTrips] = useState([]);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const handleTripResponse = async (tripId, response) => {
    try {
      await axios.put(`/trip-request/${tripId}/status`, {
        status: response,
        providerId: user?._id,
      });
      Alert.alert("Success", `Trip has been ${response}`);
      router.push({
        pathname: "user/track-trip/track-to-user",
        params: { tripId },
      });
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong."
      );
    }
  };

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Location permission not granted.");
      }
    };

    const getUser = async () => {
      try {
        const res = await axios.get("auth/current-user");
        setUser(res.data.data);
        setIsAvailable(res.data.data?.availability);
        console.log("avb", res.data.data?.availability);
        const restrip = await axios.get(`/trip/provider/${res.data.data?._id}`);
        setTrips(restrip.data.data.trip);

        if (res.data.data?.createdDate) {
          const createdAt = moment(res.data.data.createdDate);
          const now = moment();
          const months = now.diff(createdAt, "months", true);
          if (months < 1) {
            setDays(true);
            const days = now.diff(createdAt, "days", true);
            setMonthsInSystem(parseFloat(days.toFixed(1)));
          } else {
            setDays(false);
            setMonthsInSystem(parseFloat(months.toFixed(1)));
          }
        }

        const sumRating = restrip.data.data.trip.reduce(
          (sum, trip) => sum + (Number(trip.rating) || 0),
          0
        );
        const avgRating = sumRating / restrip.data.data.trip?.length;
        setRating(avgRating);
      } catch (error) {
        Alert.alert(
          "Error",
          error.response?.data?.message ||
            "Something went wrong. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };
    getUser();
    requestPermissions();
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        const tripId = notification.request.content.data.tripId;
        Alert.alert(
          "New Trip Request",
          notification.request.content.body,
          [
            {
              text: "Reject",
              onPress: () => {},
              style: "cancel",
            },
            {
              text: "Accept",
              onPress: () => handleTripResponse(tripId, "accepted"),
            },
          ],
          { cancelable: true }
        );
      }
    );

    return () => {
      notificationListener.remove();
    };
  }, []);

  const startLocationUpdates = () => {
    Alert.alert("Success", "Location Sharing Started successfully");
    const interval = setInterval(async () => {
      try {
        const { coords } = await Location.getCurrentPositionAsync({});
        sendLocationToBackend(coords);
      } catch (error) {
        Alert.alert("Error fetching location:");
      }
    }, 8000);

    setLocationInterval(interval);
  };

  const stopLocationUpdates = () => {
    Alert.alert("Success", "Location Sharing Stopped successfully");
    if (locationInterval) {
      clearInterval(locationInterval);
      setLocationInterval(null);
    }
  };

  const toggleAvailability = async () => {
    setLoadingAvailability(true);
    const newAvailability = !isAvailable;
    setIsAvailable(newAvailability);
    try {
      await axios.put(`/user/${user?._id}`, {
        availability: newAvailability,
      });
    } catch (error) {
      Alert.alert("Error", "Could not update availability. Please try again.");
    } finally {
      setLoadingAvailability(false);
    }

    if (newAvailability) {
      startLocationUpdates(); // Start location updates only if available
    } else {
      stopLocationUpdates(); // Stop location updates when unavailable
    }
  };

  const sendLocationToBackend = async (coords) => {
    try {
      const res = await axios.post("/locations/save", {
        userId: user._id,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (error) {}
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#9b5377" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Dashboard</Text>
      </View>
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: isAvailable ? "green" : "red",
            },
          ]}
        />
        <Text style={styles.availabilityText}>
          {isAvailable ? "Available" : "Not Available"}
        </Text>
      </View>
      <View style={styles.complimentsContainer}>
        <View style={styles.complimentCardContainer}>
          <View style={styles.complimentCard}>
            <Ionicons name="location-outline" size={50} color="#fff" />
            <Text style={styles.complimentNumber}>{trips?.length ?? 0}</Text>
          </View>
          <Text style={styles.complimentText}>Trips</Text>
        </View>

        <View style={styles.complimentCardContainer}>
          <View style={styles.complimentCard}>
            <Ionicons name="time-outline" size={50} color="#fff" />
            <Text style={styles.complimentNumber}>{monthsInSystem}</Text>
          </View>
          <Text style={styles.complimentText}>{days ? "Days" : "Months"}</Text>
        </View>

        <View style={styles.complimentCardContainer}>
          <View style={styles.complimentCard}>
            <Ionicons name="star-outline" size={50} color="#fff" />
            <Text style={styles.complimentNumber}>
              {rating === 0 ? 0 : rating?.toFixed(1)}
            </Text>
          </View>
          <Text style={styles.complimentText}>Rating</Text>
        </View>
        <View style={styles.availabilityContainer}>
          <MaterialIcons name="access-time" size={24} color="#9b5377" />
          <Text style={styles.availabilityText}>Availability Status</Text>
          <Switch
            value={isAvailable}
            onValueChange={toggleAvailability}
            trackColor={{ false: "#767577", true: "#9b5377" }}
            thumbColor={isAvailable ? "#fff" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 80,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#9b5377",
    marginBottom: 20,
  },
  titleContainer: {
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f4f3f4",
    padding: 15,
    borderRadius: 15,
    marginBottom: 30,
    elevation: 5,
  },
  availabilityText: {
    flex: 1,
    fontSize: 22,
    color: "#9b5377",
    fontWeight: "bold",
    marginLeft: 10,
  },
  complimentsContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  complimentCardContainer: {
    marginBottom: 30,
  },
  complimentCard: {
    backgroundColor: "#9b5377",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 75,
    padding: 20,
    width: 120,
    height: 120,
    elevation: 10,
  },
  complimentNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  complimentText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#9b5377",
    textAlign: "center",
    marginTop: 10,
  },
  tripContainer: {
    marginVertical: 20,
  },
  tripCard: {
    backgroundColor: "#f4f4f4",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 5,
  },
  tripText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
