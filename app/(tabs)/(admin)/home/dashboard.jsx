import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Button,
  Image,
  ScrollView,
  Linking,
} from "react-native";
import axios from "../../../../api/axios";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getProviders = async () => {
      const res = await axios.get("/admin/providers/not-approved");
      setUsers(res.data.data);
    };
    getProviders();
  }, []);

  const handleDownloadDocument = (documentUrl) => {
    if (documentUrl) {
      Linking.openURL(documentUrl).catch((err) =>
        console.error("Failed to open URL:", err)
      );
    } else {
      alert("No document available for this user.");
    }
  };

  const handleAccept = async (userId) => {
    try {
      // Send a request to update the approved status for this user
      await axios.put(`admin/providers/update/${userId}`, {
        approved: true,
      });
      // Optionally, update the local state to reflect the changes
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, approved: true } : user
        )
      );
      alert("User approved successfully.");
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Failed to approve user. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Dynamically generate cards based on fetched data */}
      {users.map((user, index) => (
        <View key={index} style={styles.card}>
          {/* Image */}
          <View style={styles.imagePlaceholder}>
            <Image
              source={{
                uri: user.profileImage || "https://via.placeholder.com/100",
              }} // Replace with actual image URL from user data
              style={styles.image}
            />
          </View>

          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{user.fullName}</Text>
          </View>
          <Text style={styles.cardBody}>
            {user.email || "Body text for this user."}
          </Text>
          <Text style={styles.cardBody}>
            {user.createdDate || "Body text for this user."}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownloadDocument(user.document)}
            >
              <Text style={styles.downloadText}>Download Document</Text>
            </TouchableOpacity>

            <View style={styles.actionButtons}>
              <Button
                title="Accept"
                color="#4CAF50"
                onPress={() => handleAccept(user._id)} // Pass user ID to handleAccept
              />
              <Button title="Reject" color="#F44336" onPress={() => {}} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#F5F5F5",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  imagePlaceholder: {
    alignItems: "center",
    marginBottom: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardBody: {
    fontSize: 14,
    color: "#333",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  downloadButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  downloadText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 150,
  },
});
