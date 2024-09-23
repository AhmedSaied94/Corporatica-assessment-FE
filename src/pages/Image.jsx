import { useState, useEffect } from "react";
import {
  applyMask,
  changeRgb,
  fetchImages,
  uploadImage,
  resizeImage,
  cropImage,
  convertImageFormat,
  downloadImage,
  fetchMasks
} from "../services/api.jsx";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PrimaryButton, SecondaryButton } from "../components/Buttons.jsx";

const ImagePage = () => {
  const [rgbValues, setRgbValues] = useState({ red: 0, green: 0, blue: 0 });
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [resizeDimensions, setResizeDimensions] = useState({
    width: 200,
    height: 200
  });
  const [cropDimensions, setCropDimensions] = useState({
    x: 50,
    y: 50,
    width: 100,
    height: 100
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [previewName, setPreviewName] = useState(null);
  const [masks, setMasks] = useState([]);
  const [selectedMask, setSelectedMask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("preview"); // New state for tab control
  const [selectedFormat, setSelectedFormat] = useState("png");

  const fetchMasksData = async () => {
    const data = await fetchMasks();
    setMasks(data);
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append("images", files[i]);
    }
    const result = await uploadImage(data);
    if (result) { loadImages(); } // Reload images after uploading
  };

  const handleSelectImage = (img) => {
    if (!selectedImage || selectedImage.id !== img.id) {
      setSelectedImage(img);
    }
    if (previewImage !== img.path) {
      setIsLoading(true);
      setPreviewImage(img.path);
      setPreviewName(img.name);
    }
  };

  const handleBlobResponseToPreview = (response) => {
    // extract file name from response headers
    const contentDisposition = response.headers["content-disposition"];
    const fileName = contentDisposition.split("filename=")[1];
    setPreviewName(fileName);
    const url = URL.createObjectURL(new Blob([response.data]));
    setIsLoading(true);
    setPreviewImage(url);
    return url;
  };

  useEffect(() => {
    loadImages();
    fetchMasksData();
  }, []);

  const loadImages = async () => {
    const data = await fetchImages();
    if (data) { setImages(data); }
  };

  const handleMaskApply = async () => {
    if (selectedImage && selectedMask) {
      const maskedImage = await applyMask(selectedImage.id, selectedMask.id); // Apply mask to the image
      if (maskedImage) { handleBlobResponseToPreview(maskedImage); }
    }
  };

  const handleChangeRgb = async () => {
    const modifiedImage = await changeRgb(selectedImage.id, rgbValues); // Change RGB values of the image
    if (modifiedImage) { handleBlobResponseToPreview(modifiedImage); }
  };

  const handleResize = async () => {
    if (selectedImage) {
      const resizedImage = await resizeImage(
        selectedImage.id,
        resizeDimensions
      );
      if (resizedImage) { handleBlobResponseToPreview(resizedImage); }
    }
  };

  const handleCrop = async () => {
    if (selectedImage) {
      const croppedImage = await cropImage(selectedImage.id, cropDimensions);
      if (croppedImage) { handleBlobResponseToPreview(croppedImage); }
    }
  };

  const handleFormatConversion = async (format) => {
    if (selectedImage) {
      const convertedImage = await convertImageFormat(selectedImage.id, format);
      if (convertedImage) { handleBlobResponseToPreview(convertedImage); }
    }
  };

  const proccessDownload = (url = previewImage) => {
    console.log("Preview Name: ", previewName);
    const link = document.createElement("a");
    link.href = previewImage;
    link.setAttribute("download", encodeURIComponent(previewName.replaceAll(/["' ]/g, ""))); // Remove quotes, single quotes and spaces from the file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = async () => {
    let url = previewImage;
    if (selectedImage.path === previewImage) {
      const response = await downloadImage(selectedImage.id);
      if (response) {
        url = handleBlobResponseToPreview(response);
      } else { return; }
    }
    proccessDownload(url);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="py-6 w-full h-full">
      <h1 className="text-4xl font-bold text-center mb-8">Image Manipulation</h1>

      {/* Upload Images */}
      <div className="flex justify-center mb-6">
          <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-blue-500 text-white py-2 px-4 rounded shadow-lg cursor-pointer"
          >
              <input
                  type="file"
                  id="image-upload" // Add an id here
                  multiple
                  onChange={handleUpload}
                  className="hidden"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
              </label>
          </motion.div>
      </div>

      {/* Images Grid */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Images List */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 col-span-3 ${!selectedImage ? "w-full" : "w-auto"}`}>
          {images.map((img) => (
            <motion.div
              key={img.id}
              onClick={() => handleSelectImage(img)}
              className="cursor-pointer overflow-hidden rounded-lg shadow-md w-full h-32"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <img
                src={img.path}
                alt={img.name}
                className="object-cover w-full h-full rounded-lg"
              />
            </motion.div>
          ))}
        </div>

        {/* Selected Image Preview & Controls */}
        <div className={`col-span-1 ${selectedImage ? "block" : "hidden"}`}>
          {selectedImage && (
                <div className="text-center">
                    {/* Tabs for switching between preview and histogram */}
                <div className="flex justify-center gap-4 mb-4 w-full flex-wrap">
                    <PrimaryButton
                    onClick={() => handleTabChange("preview")}
                    className="flex-grow"
                    >
                    Preview
                    </PrimaryButton>
                    <SecondaryButton
                    onClick={() => handleTabChange("histogram")}
                    className="flex-grow"
                    >
                    Histogram
                    </SecondaryButton>
                </div>
              {activeTab === "preview" && (
                <div className="max-w-72 mx-auto">
                    <motion.img
                    key={selectedImage.id} // Ensure Framer Motion detects image change
                    src={previewImage}
                    alt={selectedImage.name}
                    className={`mx-auto max-w-full h-auto rounded-lg ${
                        isLoading ? "hidden" : "block" // Hide the image while loading
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    onLoad={() => setIsLoading(false)} // Show the image after loading
                    />
                    {/* Mask Apply */}
                    <div className="mt-8 flex flex-col items-center">
                    <div className="w-full">
                        <select
                        className="border p-2 rounded w-full"
                        onChange={(e) =>
                          setSelectedMask(masks.find((mask) => +mask.id === +e.target.value))
                        }
                        >
                        <option value="">Select Mask</option>
                        {masks.map((mask) => (
                            <option key={mask.id} value={mask.id}>
                            {mask.name}
                            </option>
                        ))}
                        </select>
                    </div>
                    <PrimaryButton onClick={handleMaskApply} className={"mt-4 w-full" + (selectedMask ? "" : " cursor-not-allowed")} disabled={!selectedMask}>
                        Apply Mask
                    </PrimaryButton>
                    </div>

                    {/* RGB Change */}
                    <div className="mt-8 flex flex-col items-center">
                    <div className="flex gap-2 w-full">
                        <input
                        type="number"
                        value={rgbValues.red}
                        onChange={(e) =>
                          setRgbValues({ ...rgbValues, red: e.target.value })
                        }
                        placeholder="Red"
                        className="border p-2 rounded w-full"
                        />
                        <input
                        type="number"
                        value={rgbValues.green}
                        onChange={(e) =>
                          setRgbValues({ ...rgbValues, green: e.target.value })
                        }
                        placeholder="Green"
                        className="border p-2 rounded w-full"
                        />
                        <input
                        type="number"
                        value={rgbValues.blue}
                        onChange={(e) =>
                          setRgbValues({ ...rgbValues, blue: e.target.value })
                        }
                        placeholder="Blue"
                        className="border p-2 rounded w-full"
                        />
                    </div>
                    <SecondaryButton onClick={handleChangeRgb} className="mt-4 w-full">
                        Change RGB
                    </SecondaryButton>
                    </div>

                    {/* Resize Image */}
                    <div className="mt-8 flex flex-col items-center">
                    <div className="flex gap-2 w-full">
                        <input
                        type="number"
                        placeholder="Width"
                        value={resizeDimensions.width}
                        onChange={(e) =>
                          setResizeDimensions({ ...resizeDimensions, width: e.target.value })
                        }
                        className="border p-2 rounded w-full"
                        />
                        <input
                        type="number"
                        placeholder="Height"
                        value={resizeDimensions.height}
                        onChange={(e) =>
                          setResizeDimensions({ ...resizeDimensions, height: e.target.value })
                        }
                        className="border p-2 rounded w-full"
                        />
                    </div>

                    <PrimaryButton onClick={handleResize} className="mt-4 w-full">
                        Resize
                    </PrimaryButton>
                    </div>

                    {/* Crop Image */}
                    <div className="mt-8 flex flex-col items-center">
                    <div className="flex gap-2 w-full">
                        <input
                        type="number"
                        placeholder="X"
                        onChange={(e) =>
                          setCropDimensions({ ...cropDimensions, x: e.target.value })
                        }
                        className="border p-2 rounded w-full"
                        />
                        <input
                        type="number"
                        placeholder="Y"
                        onChange={(e) =>
                          setCropDimensions({ ...cropDimensions, y: e.target.value })
                        }
                        className="border p-2 rounded w-full"
                        />
                        <input
                        type="number"
                        placeholder="Width"
                        onChange={(e) =>
                          setCropDimensions({ ...cropDimensions, width: e.target.value })
                        }
                        className="border p-2 rounded w-full"
                        />
                        <input
                        type="number"
                        placeholder="Height"
                        onChange={(e) =>
                          setCropDimensions({ ...cropDimensions, height: e.target.value })
                        }
                        className="border p-2 rounded w-full"
                        />
                    </div>
                    <SecondaryButton onClick={handleCrop} className="mt-4 w-full">
                        Crop
                    </SecondaryButton>
                    </div>

                    {/* Format Conversion */}
                    <div className="mt-8 flex justify-center gap-4 flex-wrap w-full">
                    <div className="w-full">
                        <select
                        className="border p-2 rounded w-full"
                        onChange={(e) =>
                          setSelectedFormat(e.target.value)
                        }
                        >
                          <option value="png">PNG</option>
                          <option value="jpg">JPG</option>
                          <option value="webp">WEBP</option>
                          <option value="tiff">TIFF</option>
                          <option value="bmp">BMP</option>
                          <option value="gif">GIF</option>
                        </select>
                    </div>
                    <PrimaryButton onClick={() => handleFormatConversion(selectedFormat)} className="flex-grow">
                        Convert to {selectedFormat.toUpperCase()}
                    </PrimaryButton>
                    </div>

                    {/* Download Image */}
                    <div className="mt-8 flex justify-center">
                    <SecondaryButton onClick={handleDownload} className="w-full">
                        Download Image
                    </SecondaryButton>

                    </div>
                </div>
              )}

              {activeTab === "histogram" && (
                    <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={selectedImage.histogram}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bin" label={{ value: "Intensity", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Count", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePage;
