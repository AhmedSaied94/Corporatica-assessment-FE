import { useState, useEffect } from "react";
import {
  analyzeText,
  categorizeText,
  getTextSimilarity,
  searchText,
  visualizeTextTSNE,
  wordCloudText
} from "../services/api";
import { PrimaryButton, SecondaryButton } from "../components/Buttons";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Spinner = () => (
  <div className="flex items-center justify-center w-full py-12">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-b-transparent rounded-full animate-spin"></div>
  </div>
);

const TextAnalysisResult = ({ analysisData }) => {
  const { character_count, word_count, sentence_count, paragraph_count, entities, keywords, sentiment, summary } = analysisData;

  // Pie chart color for sentiment
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  // Entity data for BarChart
  const entityData = entities.reduce((acc, entity) => {
    const type = entity.entity;
    if (acc[type]) {
      acc[type]++;
    } else {
      acc[type] = 1;
    }
    return acc;
  }, {});

  const entityChartData = Object.keys(entityData).map((key) => ({
    name: key,
    value: entityData[key]
  }));

  // Sentiment Data
  const sentimentData = [
    { name: "Positive", value: sentiment[0].label === "LABEL_0" ? sentiment[0].score : 1 - sentiment[0].score },
    { name: "Negative", value: sentiment[0].label === "LABEL_0" ? 1 - sentiment[0].score : sentiment[0].score }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Text Analysis Results</h1>

      {/* Word, Character, Sentence, Paragraph Count */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-lg font-semibold">Word Count</h2>
          <p>{word_count}</p>
        </div>
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-lg font-semibold">Character Count</h2>
          <p>{character_count}</p>
        </div>
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-lg font-semibold">Sentence Count</h2>
          <p>{sentence_count}</p>
        </div>
        <div className="bg-white shadow-md rounded p-4">
          <h2 className="text-lg font-semibold">Paragraph Count</h2>
          <p>{paragraph_count}</p>
        </div>
      </div>

      {/* Entity Chart */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold">Named Entities</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={entityChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sentiment Analysis */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold">Sentiment</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={sentimentData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {sentimentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Summary</h2>
          <p className="text-gray-700 leading-relaxed">{summary}</p>
      </div>

      {/* Keywords List */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Keywords</h2>
          <div className="grid grid-cols-2 gap-4">
              {keywords.map((keyword, index) => (
                  <div key={index} className="text-gray-600 hover:text-blue-600 transition-colors duration-300 p-2 border-b border-gray-300">
                      {keyword}
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
};

const TextDataPage = () => {
  const [text, setText] = useState("");
  const [queryText, setQueryText] = useState("");
  const [similarTexts, setSimilarTexts] = useState([]);
  const [visualizeTexts, setVisualizeTexts] = useState([]);
  const [categories, setCategories] = useState({});
  const [activeCategoryTab, setActiveCategoryTab] = useState("Politics");
  const [analyzedData, setAnalyzedData] = useState({});
  const [similarityData, setSimilarityData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [visualizedImage, setVisualizedImage] = useState(null);
  const [wordCloudImage, setWordCloudImage] = useState(null);
  const [activeTab, setActiveTab] = useState("analysis");
  const [searchResults, setSearchResults] = useState([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const defaultCategories = {
    Politics: ["president", "election", "political", "government", "senate", "congress"],
    Education: ["school", "education", "university", "college", "degree"],
    Healthcare: ["health", "medicine", "doctor", "hospital", "disease", "treatment"],
    Environment: ["climate", "pollution", "conservation", "ecology", "sustainability"],
    Technology: ["technology", "computer", "software", "hardware", "internet", "innovation"],
    "International Relations": ["international", "diplomacy", "foreign", "nations", "UN", "NATO"],
    Economics: ["economy", "finance", "market", "investment", "trade"],
    Culture: ["culture", "arts", "music", "literature", "tradition"],
    Science: ["science", "research", "experiment", "discovery", "technology"],
    History: ["history", "historical", "past", "event", "ancient"]
  };

  // Initialize the categories with the default ones
  useState(() => {
    setCategories(defaultCategories);
  }, []);

  // Add a keyword to the active category
  const addKeywordToCategory = (keyword) => {
    setCategories({
      ...categories,
      [activeCategoryTab]: [...(categories[activeCategoryTab] || []), keyword]
    });
  };

  // Remove a keyword from the active category
  const removeKeywordFromCategory = (keyword) => {
    setCategories({
      ...categories,
      [activeCategoryTab]: categories[activeCategoryTab].filter((k) => k !== keyword)
    });
  };

  useEffect(() => {
  }, [categories]);

  // Analyze Text
  const handleTextAnalysis = async () => {
    setAnalyzedData({});
    setAnalysisLoading(true);
    const result = await analyzeText(text);
    if (result) {
      setAnalyzedData(result);
      scrollToResult();
    }
    setAnalysisLoading(false);
  };

  // Categorize Text
  const handleCategorizeText = async () => {
    setCategoryData([]);
    setAnalysisLoading(true);
    const result = await categorizeText(text, categories);
    if (result) {
      const categoryDataFormatted = Object.entries(result).map(([name, value]) => ({
        name,
        value
      }));
      setCategoryData(categoryDataFormatted);
      scrollToResult();
    }
    setAnalysisLoading(false);
  };

  // Similarity Comparison
  const handleTextSimilarity = async () => {
    setSimilarityData([]);
    setAnalysisLoading(true);
    const result = await getTextSimilarity(text, similarTexts);
    if (result) {
      const similarityDataFormatted = result.similarity.map((value, index) => ({
        name: `Text ${index + 1}`,
        value
      }));
      setSimilarityData(similarityDataFormatted);
      scrollToResult();
    }
    setAnalysisLoading(false);
  };

  // Search Text
  const handleSearchText = async () => {
    setSearchResults([]);
    setAnalysisLoading(true);
    const result = await searchText(text, queryText);
    if (result) {
      setSearchResults(result);
      scrollToResult();
    }
    setAnalysisLoading(false);
  };

  const scrollToResult = () => {
    const result = document.getElementById(activeTab + "-result");
    result.scrollIntoView({ behavior: "smooth" });
  };

  // t-SNE Visualization
  const handleVisualizeText = async () => {
    setVisualizedImage(null);
    setAnalysisLoading(true);
    const response = await visualizeTextTSNE(text, visualizeTexts);
    if (response) {
      const url = URL.createObjectURL(new Blob([response.data]));
      setVisualizedImage(url);
      scrollToResult();
    }
    setAnalysisLoading(false);
  };

  // Word Cloud Generation
  const handleWordCloud = async () => {
    setWordCloudImage(null);
    setAnalysisLoading(true);
    const response = await wordCloudText(text);
    if (response) {
      const url = URL.createObjectURL(new Blob([response.data]));
      setWordCloudImage(url);
      scrollToResult();
    }
    setAnalysisLoading(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCategoryTabChange = (tab) => {
    setActiveCategoryTab(tab);
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-center mb-8">Text Data Analysis</h1>

      {/* Tabs for different operations */}
      <div className="flex justify-center gap-4 mb-4 w-full flex-wrap">
        <PrimaryButton onClick={() => handleTabChange("analysis")} className="flex-grow">Analyze</PrimaryButton>
        <SecondaryButton onClick={() => handleTabChange("categorize")} className="flex-grow">Categorize</SecondaryButton>
        <PrimaryButton onClick={() => handleTabChange("similarity")} className="flex-grow">Similarity</PrimaryButton>
        <SecondaryButton onClick={() => handleTabChange("search")} className="flex-grow">Search</SecondaryButton>
        <PrimaryButton onClick={() => handleTabChange("visualize")} className="flex-grow">Visualize t-SNE</PrimaryButton>
        <SecondaryButton onClick={() => handleTabChange("wordcloud")} className="flex-grow">Word Cloud</SecondaryButton>
      </div>

      {/* Text input area */}
      <textarea
        className="border p-4 w-full mb-4"
        rows="6"
        placeholder="Enter text..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      {/* Conditional rendering based on the active tab */}
      {activeTab === "analysis" && (
        <div>
          <PrimaryButton onClick={handleTextAnalysis}>Analyze Text</PrimaryButton>
          <div className="mt-6" id={activeTab + "-result"}>
            {
              analysisLoading
                ? (
                <Spinner />
                  )
                : Object.keys(analyzedData).length === 0
                  ? (
                <p>No analysis data available</p>
                    )
                  : (
                  <TextAnalysisResult analysisData={analyzedData} />
                    )
            }
          </div>
        </div>
      )}

      {activeTab === "categorize" && (
        <div>
          {/* Tabs for each category */}
          <div className="flex justify-center gap-4 mb-4 w-full flex-wrap">
            {Object.keys(categories).map((category) => (
              category === activeCategoryTab
                ? (
              <PrimaryButton
                key={category}
                onClick={() => handleCategoryTabChange(category)}
                className={"flex-grow"}
              >
                {category}
              </PrimaryButton>
                  )
                : (
              <SecondaryButton
                key={category}
                onClick={() => handleCategoryTabChange(category)}
                className={"flex-grow"}
              >
                {category}
              </SecondaryButton>
                  )
            ))}
          </div>

          {/* Display keywords with Add and Remove buttons */}
          <div className="mb-6" id={activeTab + "-result"}>
            <h2 className="text-xl">{activeCategoryTab} Keywords</h2>
            <ul className="list-disc pl-6">
              {defaultCategories[activeCategoryTab].map((keyword, index) => (
                <li key={index} className="flex justify-between items-center py-1">
                  <span className={`${categories[activeCategoryTab].includes(keyword) ? "text-gray-800 line-through decoration-red-400" : "text-gray-500"}`}
                  >
                    {keyword}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className={"text-green-500 p-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center rounded-full hover:bg-green-100"}
                      onClick={() => addKeywordToCategory(keyword)}
                      disabled={categories[activeCategoryTab].includes(keyword)}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                    <button
                      className="text-red-500 p-2 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-100"
                      onClick={() => removeKeywordFromCategory(keyword)}
                      disabled={!categories[activeCategoryTab].includes(keyword)}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <PrimaryButton onClick={handleCategorizeText}>Categorize Text</PrimaryButton>
          <div className="mt-6" id={activeTab + "-result"}>
            <h2 className="text-xl">Categorization Result</h2>
            {
              analysisLoading
                ? (
              <Spinner />
                  )
                : categoryData.length === 0
                  ? (
              <p>No category data available</p>
                    )
                  : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
                    )
            }
          </div>
        </div>
      )}

      {activeTab === "similarity" && (
        <div>
          {/* texts for similarity comparison */}
          {
            similarTexts.map((text, index) => (
              <div key={index} className="mb-4 w-full relative">
                <textarea
                key={index}
                className="w-full border p-4"
                rows="3"
                placeholder={`Enter text ${index + 1}...`}
                value={text}
                onChange={(e) => {
                  const newSimilarTexts = [...similarTexts];
                  newSimilarTexts[index] = e.target.value;
                  setSimilarTexts(newSimilarTexts);
                }}
              ></textarea>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-0 right-0 mt-2 me-2 bg-transparent text-red-500 w-6 h-6 flex items-center justify-center rounded-full"
                onClick={() => setSimilarTexts(similarTexts.filter((_, i) => i !== index))}
              >
                <i className="fas fa-times"></i>
              </motion.button>
              </div>
            ))
          }
          {/* Add more text fields */}
          <SecondaryButton onClick={() => setSimilarTexts([...similarTexts, ""])}>Add Text</SecondaryButton>
          {/* Compare similarity button */}
          <PrimaryButton className="ms-4" onClick={handleTextSimilarity}>Compare Similarity</PrimaryButton>
          <div className="mt-6" id={activeTab + "-result"}>
            <h2 className="text-xl">Similarity Result</h2>

            {/* Bar chart for similarity result */}
            {
              analysisLoading
                ? (
                <Spinner />
                  )
                : similarityData.length === 0
                  ? (
                <p>No similarity data available</p>
                    )
                  : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={similarityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
                    )
            }
          </div>
        </div>
      )}

{activeTab === "search" && (
        <div>
          <input
            type="text"
            placeholder="Search query"
            className="border p-2 w-full mb-4"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
          />
          <PrimaryButton onClick={handleSearchText}>Search Text</PrimaryButton>
          <div className="mt-6" id={activeTab + "-result"}>
            <h2 className="text-xl">Search Results</h2>
            {
              analysisLoading
                ? (
              <Spinner />
                  )
                : searchResults.length === 0
                  ? (
              <p>No search results available</p>
                    )
                  : (
                    <>
                      {/* Bar chart for search similarity result */}
                      {searchResults.length > 0 && (
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={searchResults}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="sentence" hide={true} />
                            <YAxis />
                            <Tooltip formatter={(value) => `${(value * 100).toFixed(2)}%`} />
                            <Bar dataKey="similarity" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}

                      {/* Display Search Results */}
                      <div>
                        <table className="table-auto w-full bg-white shadow-lg">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2">Sentence</th>
                                    <th className="px-4 py-2">Similarity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchResults.map((result, index) => (
                                    <tr key={index}>
                                        <td className="border px-4 py-2">{result.sentence}</td>
                                        <td className="border px-4 py-2">{(result.similarity * 100).toFixed(2)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                    </>
                    )
            }

          </div>
        </div>
)}

      {activeTab === "visualize" && (
        <div>
          {/* texts for visualization */}
          {
            visualizeTexts.map((text, index) => (
              <div key={index} className="mb-4 w-full relative">
                <textarea
                key={index}
                className="w-full border p-4"
                rows="3"
                placeholder={`Enter text ${index + 1}...`}
                value={text}
                onChange={(e) => {
                  const newVisualizeTexts = [...visualizeTexts];
                  newVisualizeTexts[index] = e.target.value;
                  setVisualizeTexts(newVisualizeTexts);
                }}
              ></textarea>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-0 right-0 mt-2 me-2 bg-transparent text-red-500 w-6 h-6 flex items-center justify-center rounded-full"
                onClick={() => setVisualizeTexts(visualizeTexts.filter((_, i) => i !== index))}
              >
                <i className="fas fa-times"></i>
              </motion.button>
              </div>
            ))
          }
          {/* Add more text fields */}
          <SecondaryButton onClick={() => setVisualizeTexts([...visualizeTexts, ""])}>Add Text</SecondaryButton>
          {/* Visualize t-SNE button */}
          <PrimaryButton className="ms-3" onClick={handleVisualizeText}>Visualize t-SNE</PrimaryButton>
          <div className="mt-6" id={activeTab + "-result"}>
            <h2 className="text-xl">t-SNE Visualization</h2>
          {
            analysisLoading
              ? (
              <Spinner />
                )
              : !visualizedImage
                  ? (
              <p>No visualization data available</p>
                    )
                  : (
              <img src={visualizedImage} alt="t-SNE Visualization" className="mx-auto" />
                    )
          }
            </div>
        </div>
      )}

      {activeTab === "wordcloud" && (
        <div>
          <PrimaryButton onClick={handleWordCloud}>Generate Word Cloud</PrimaryButton>
          <div className="mt-6" id={activeTab + "-result"}>
            <h2 className="text-xl">Word Cloud</h2>
          {
            analysisLoading
              ? (
            <Spinner />
                )
              : !wordCloudImage
                  ? (
            <p>No word cloud data available</p>
                    )
                  : (
              <img src={wordCloudImage} alt="Word Cloud" className="mx-auto" />
                    )
          }
            </div>
        </div>
      )}
    </div>
  );
};

export default TextDataPage;
