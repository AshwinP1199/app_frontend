import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Stars from "react-native-stars";
import axios from "../../../api/axios";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const ProviderFeedback = () => {
  const route = useRoute();
  const { tripId } = route.params;
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [user, setUser] = useState();
  const navigation = useNavigation();
  const [trip, setTrip] = useState();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get("auth/current-user");
        setUser(res.data.data);
      } catch (error) {
        Alert.alert(
          "Error",
          error.response?.data?.message ||
            "Something went wrong. Please try again later."
        );
      }
    };
    const getTrip = async () => {
      const res = await axios.get(`/trip-request/get-trip/${tripId}`);
      setTrip(res.data?.data.tripRequest);
    };
    getTrip();
    getUser();
  }, []);
  const handleSubmit = async () => {
    try {
      const response = await axios.post("/trip", {
        providerId: trip.providerId,
        userId: user._id,
        rating,
        tripId: trip._id,
        feedback,
        tripStart: trip.pickupLocation.name,
        tripEnd: trip.dropoffLocation.name,
        createdDate: new Date().toISOString(),
      });

      if (response.data.status === "success") {
        Alert.alert(
          "Feedback Submitted",
          `Rating: ${rating} stars\nFeedback: ${feedback}`
        );
        AsyncStorage.removeItem("tripRequest");
        AsyncStorage.removeItem("tripDetails");
        AsyncStorage.removeItem("startedTrip");
        router.push("(tabs)/(user)/home/dashboard");
      } else {
        Alert.alert("Error", "There was a problem submitting your feedback.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Could not submit feedback. Please try again later."
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Provider Feedback</Text>
        {/* Large Checkmark */}
        <View style={styles.iconContainer}>
          <Icon name="check-circle-outline" size={80} color="#1cb833" />
        </View>

        {/* Success Message */}
        <Text style={styles.successMessage}>
          You have successfully completed your trip!
        </Text>

        {/* Improvement Feedback */}
        <Text style={styles.label}>Tell us what can be improved:</Text>

        <TextInput
          style={styles.input}
          placeholder="Write your feedback"
          placeholderTextColor="#fff"
          value={feedback}
          onChangeText={setFeedback}
          multiline
        />

        {/* Star Rating */}
        <Text style={styles.label}>Rate your experience</Text>

        <Stars
          default={0}
          count={5}
          half={false}
          starSize={50}
          update={(val) => setRating(val)}
          fullStar={<Icon name="star" style={styles.starStyle} />}
          emptyStar={
            <Icon
              name="star-outline"
              style={[styles.starStyle, styles.emptyStar]}
            />
          }
        />

        {/* Submit Button */}
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>SUBMIT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    marginTop: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#8b3a62",
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  successMessage: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
    fontWeight: "bold",
  },
  input: {
    height: 100,
    width: "100%",
    backgroundColor: "#9b5377",
    padding: 10,
    borderRadius: 8,
    color: "#fff",
    marginBottom: 30,
  },
  starStyle: {
    color: "#ffd700",
    fontSize: 30,
  },
  emptyStar: {
    color: "#ccc",
  },
  submitButtonContainer: {
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#9b5377",
    paddingVertical: 10,
    borderRadius: 25,
    paddingHorizontal: 30,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ProviderFeedback;
