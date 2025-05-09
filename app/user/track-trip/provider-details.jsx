import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Linking, // Import Linking
} from "react-native";
import { useRouter } from "expo-router";
import { useRoute } from "@react-navigation/native";
import axios from "../../../api/axios";

export default function ProviderDetails() {
  const router = useRouter();
  const route = useRoute();
  const { providerId, tripId } = route.params; // Extract providerId from parameters
  const [provider, setProvider] = useState(null); // Initialize as null
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchProviderDetails = async () => {
      try {
        // Fetch provider details using the providerId
        const response = await axios.get(`/user/${providerId}`);
        setProvider(response.data?.data.user); // Set the provider details
      } catch (err) {
        setError(err.message); // Capture any error
      } finally {
        setLoading(false); // Set loading to false
      }
    };

    fetchProviderDetails();
  }, [providerId]); // Dependency array includes providerId

  // Show loading indicator or error message if loading
  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Check if there's an error
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Handle Trip Details navigation
  const handleTripDetails = () => {
    console.log(tripId);
    router.push({
      pathname: "/user/track-trip/TripDetails",
      params: { tripId },
    });
  };

  // Function to call provider's phone number
  const handleCallProvider = () => {
    const phoneNumber = provider?.mobileNo;
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`).catch((err) =>
        Alert.alert("Error", "Unable to make a call. Please try again.")
      );
    } else {
      Alert.alert("Error", "Phone number is not available.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Image */}
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: provider?.profileImage || "https://via.placeholder.com/120",
          }}
          style={styles.profileImage}
        />
      </View>

      {/* Provider Name */}
      <Text style={styles.nameText}>{provider?.fullName?.toUpperCase()}</Text>

      {/* Provider Email */}
      <Text style={styles.label}>Email</Text>
      <Text style={styles.detailText}>{provider?.email?.toLowerCase()}</Text>

      {/* Provider Contact Number */}
      <Text style={styles.label}>Contact Number</Text>
      <Text style={styles.detailText}>{provider?.mobileNo}</Text>

      {/* Provider Address */}
      <Text style={styles.label}>Address</Text>
      <Text style={styles.detailText}>{provider?.address}</Text>

      {/* Trip Details Button */}
      <TouchableOpacity style={styles.button} onPress={handleTripDetails}>
        <Text style={styles.buttonText}>Trip Details</Text>
      </TouchableOpacity>

      {/* Call Provider Button */}
      <TouchableOpacity style={styles.button} onPress={handleCallProvider}>
        <Text style={styles.buttonText}>Call Provider</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9b5377",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#a6a3a5",
    marginBottom: 5,
  },
  detailText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#9b5377",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20, // Adjusted margin for better spacing
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    fontSize: 18,
  },
});
