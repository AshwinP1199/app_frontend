import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const instance = axios.create({
  baseURL: "https://beside-backend-y20k.onrender.com/api/v1/",
  // baseURL: "http://192.168.8.101:5000/api/v1/",
  // baseURL: "http://192.168.1.187:5000/api/v1/",
  // baseURL: "http://172.28.3.124:5000/api/v1/",
  // baseURL: "http://192.168.8.102:5000/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  async (config) => {
    try {
      const user = await AsyncStorage.getItem("user");

      if (user) {
        const parsedUser = JSON.parse(user);
        const accessToken = parsedUser?.token;
        if (accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
      }
    } catch (error) {
      console.error("Error retrieving token from AsyncStorage:", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
