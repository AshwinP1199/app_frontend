import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

// Helper function to convert a file URI to a Blob
const uriToBlob = async (uri) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

const uploadFileToFirebase = async (file, type) => {
  try {
    const timestamp = Date.now();
    const directory = type === "image" ? "images/" : "files/";
    const filename = `${file.name}_${timestamp}`;
    const fileRef = ref(storage, `${directory}${filename}`);

    console.log(file);
    // Convert file URI to Blob
    const fileBlob = await uriToBlob(file.uri);

    // Upload the file
    const snapshotFile = await uploadBytes(fileRef, fileBlob);

    // Get the download URL
    const downloadURLFile = await getDownloadURL(snapshotFile.ref);
    return downloadURLFile;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export default uploadFileToFirebase;
