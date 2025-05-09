import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import "react-native-get-random-values";

export default function WelcomeScreen() {
  return (
    <View style={styles.mainContainer}>
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            {/* You can replace this Image component with your logo */}
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
            />
            <Text style={styles.title}>Beside</Text>
          </View>
          <Text style={styles.subtitle}>With You Every Mile, Every Moment</Text>

          <View style={styles.paginationContainer}>
            <View style={[styles.paginationDot, styles.paginationDotActive]} />
            <View style={styles.paginationDot} />
            <View style={styles.paginationDot} />
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.button}>
        <Link href={"/login"}>
          <Text style={styles.buttonText}>Get Started</Text>
        </Link>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
  },
  outerContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "white",
  },
  container: {
    height: "85%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9B5377",
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 132,
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 87,
  },
  subtitle: {
    fontSize: 16,
    color: "white",
    marginBottom: 83,
    textAlign: "center",
    // fontWeight: 400,
  },
  paginationContainer: {
    flexDirection: "row",
  },
  paginationDot: {
    width: 15,
    height: 15,
    borderRadius: 50,
    backgroundColor: "#4f3141",
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: "#000",
  },
  button: {
    width: 200,
    height: 50,
    backgroundColor: "#9B5377",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    position: "absolute",
    bottom: 32,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});
