import axios from "axios";
import { notifyErrors } from "../ErrorsHandler";

const API_URL = "http://localhost:8000"; // Adjust according to your Flask API endpoint
const IMAGES_URL = API_URL + "/images";

const handleRequest = async (requestMethod, returnData = true, ...params) => {
  try {
    console.log("PARAMS: ", params);
    const response = await requestMethod(...params);
    console.log("RESPONSE: ", response);
    if (response.status < 400) {
      if (returnData) {
        return response.data;
      }
      return response;
    }
  } catch (error) {
    console.log("ERROR: ", error);
    if (error.response.status < 500) {
      let errors;
      errors = error.response.data;
      if (!returnData) {
        errors = await errors.text();
      }
      console.log("ERRORS: ", errors);
      notifyErrors(errors);
    } else {
      notifyErrors("An error occurred. Please try again later.");
    }
  }
};

// Image Data Endpoints
export const fetchImages = async () => {
  return handleRequest(axios.get, true, IMAGES_URL + "/image");
};

export const uploadImage = async (images) => {
  const formData = new FormData();
  images.forEach((image) => {
    formData.append("images", image);
  });
  return handleRequest(axios.post, true, IMAGES_URL + "/image/multiple", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

export const resizeImage = async (imageId, dimensions) => {
  return handleRequest(axios.post, false, `${IMAGES_URL}/image/${imageId}/resize`, dimensions, {
    responseType: "blob"
  });
};

export const cropImage = async (imageId, cropDimensions) => {
  return handleRequest(axios.post, false, `${IMAGES_URL}/image/${imageId}/crop`, cropDimensions, {
    responseType: "blob"
  });
};

export const fetchMasks = async () => {
  return handleRequest(axios.get, true, `${IMAGES_URL}/image/masks`);
};

export const convertImageFormat = async (imageId, format) => {
  return handleRequest(axios.post, false, `${IMAGES_URL}/image/${imageId}/convert`, { format }, {
    responseType: "blob"
  });
};

export const downloadImage = async (imageId) => {
  return handleRequest(axios.get, false, `${IMAGES_URL}/image/${imageId}/download`, {
    responseType: "blob"
  });
};

export const applyMask = async (imageId, mask_id) => {
  return handleRequest(axios.post, false, `${IMAGES_URL}/image/${imageId}/mask/apply`, { mask_id }, {
    headers: {
      "Content-Type": "application/json"
    },
    responseType: "blob"
  });
};

export const changeRgb = async (imageId, rgbValues) => {
  return handleRequest(axios.post, false, `${IMAGES_URL}/image/${imageId}/rgb`, rgbValues, {
    responseType: "blob"
  });
};

// Tabular Data Endpoints
export const fetchTabularData = async (id, filters) => {
  return handleRequest(axios.post, true, `${API_URL}/tabular/files/${id}`, { ...filters });
};

export const filterTabularData = async (filters) => {
  return handleRequest(axios.post, true, `${API_URL}/tabular/filter`, filters);
};

export const fetchTabularFiles = async () => {
  return handleRequest(axios.get, true, `${API_URL}/tabular/files`);
};

export const uploadTabularFile = async (formData) => {
  return handleRequest(axios.post, true, `${API_URL}/tabular/files/new`, formData);
};

export const deleteTabularFile = async (fileId) => {
  return handleRequest(axios.delete, true, `${API_URL}/tabular/files/${fileId}`);
};

export const newTabularFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return handleRequest(axios.post, true, `${API_URL}/tabular/files/new`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

// Text Data Endpoints
export const analyzeText = async (text) => {
  return handleRequest(axios.post, true, `${API_URL}/text/analysis`, { text });
};

export const categorizeText = async (text, categories) => {
  return handleRequest(axios.post, true, `${API_URL}/text/categorize`, { text, categories });
};

export const getTextSimilarity = async (text, texts) => {
  return handleRequest(axios.post, true, `${API_URL}/text/similarity`, { text, texts });
};

export const searchText = async (text, query) => {
  return handleRequest(axios.post, true, `${API_URL}/text/search`, { text, query });
};

export const visualizeTextTSNE = async (text, texts) => {
  return handleRequest(axios.post, false, `${API_URL}/text/visualize`, { text, texts }, {
    responseType: "blob"
  });
};

export const wordCloudText = async (text) => {
  return handleRequest(axios.post, false, `${API_URL}/text/wordcloud`, { text }, {
    responseType: "blob"
  });
};
