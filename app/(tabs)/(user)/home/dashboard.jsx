import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

export default function userDashboard() {
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={24} color="#9b5377" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Providers"
          placeholderTextColor="#a6a3a5"
        />
      </View>

      {/* Top Buttons */}
      <View style={styles.topButtonsContainer}>
        <TouchableOpacity style={styles.topButton}>
          <Link href={"user/create-request"}>
            <Text style={styles.topButtonText}>Create Request</Text>
          </Link>
        </TouchableOpacity>
        <TouchableOpacity style={styles.topButton}>
          <Link href={"user/track-trip"}>
            <Text style={styles.topButtonText}>Track Trip</Text>
          </Link>
        </TouchableOpacity>
        <TouchableOpacity style={styles.topButton}>
          <Link href={"user/track-trip/tripHistory"}>
            <Text style={styles.topButtonText}>Trip History</Text>
          </Link>
        </TouchableOpacity>
      </View>

      {/* Categories Title */}
      <Text style={styles.categoriesTitle}>Accompany Categories</Text>

      {/* Categories Buttons */}
      <View style={styles.categoriesContainer}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.categoryButton}>
            <Link href={"user/create-request"}>
              <Text style={styles.categoryButtonText}>Club</Text>
            </Link>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton}>
            <Link href={"user/create-request"}>
              <Text style={styles.categoryButtonText}>Public Transport</Text>
            </Link>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton}>
            <Link href={"user/create-request"}>
              <Text style={styles.categoryButtonText}>Walk</Text>
            </Link>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 40,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: "#a6a3a5",
    marginLeft: 10,
    fontWeight: "bold",
  },
  topButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  topButton: {
    backgroundColor: "#9b5377",
    paddingVertical: 25,
    paddingHorizontal: 15,
    borderRadius: 20,
    width: 100,
    marginHorizontal: 5,
    alignItems: "center",
  },
  topButtonText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },
  categoriesTitle: {
    fontSize: 18,
    color: "#9b5377",
    marginBottom: 40,
    fontWeight: "bold",
  },
  categoriesContainer: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: "#9b5377",
    paddingVertical: 25,
    paddingHorizontal: 15,
    borderRadius: 20,
    width: 100,
    alignItems: "center",
  },
  categoryButtonText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },
});
