import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "../../../api/axios";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
const moment = require("moment");
import { Link } from "expo-router";

export default function TripHistory() {
  const [trips, setTrips] = useState();
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation(); // Get the navigation object

  useEffect(() => {
    const getTrips = async () => {
      try {
        const res = await axios.get("auth/current-user");
        const resTrip = await axios.get(`/trip/user/${res.data.data?._id}`);
        setTrips(resTrip.data.data?.trip);
      } catch (error) {
        alert("No Trips found");
      } finally {
        setLoading(false);
      }
    };
    getTrips();
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={20}
          color="#FFD700"
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#9b5377" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Track History</Text>
      </View>

      {/* Trip List */}
      {trips?.map((trip, index) => (
        <View key={index} style={styles.tripCard}>
          <Text style={styles.tripText}>
            <Text style={styles.boldText}>Trip: </Text>
            {trip.tripStart} → {trip.tripEnd}
          </Text>
          <Text style={styles.tripText}>
            <Text style={styles.boldText}>Date: </Text>
            {moment(trip.createdDate).format("D MMM YYYY")}
          </Text>
          <View style={styles.ratingContainer}>{renderStars(trip.rating)}</View>
          <Text style={styles.tripText}>
            <Text style={styles.boldText}>Feedback: </Text>
            {trip.feedback ?? "No comment"}
          </Text>
        </View>
      ))}

      {/* Button to go back to Home */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Home")}
      >
        <Link href={"(tabs)/(user)/home/dashboard"}>
          <Text style={styles.buttonText}>Go to Home</Text>
        </Link>
      </TouchableOpacity>
    </View>
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
  tripCard: {
    backgroundColor: "#9b5377",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  tripText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#9b5377", // Button background color
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
