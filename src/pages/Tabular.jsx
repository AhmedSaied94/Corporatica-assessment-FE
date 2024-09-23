import { useState, useEffect } from "react";
import { fetchTabularFiles, fetchTabularData, newTabularFile } from "../services/api.jsx";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PrimaryButton, SecondaryButton } from "../components/Buttons";

const renderQuartilesChart = (quartiles) => {
  const chartData = Object.keys(quartiles).map((key) => ({
    name: key,
    q1: quartiles[key]["0.25"],
    median: quartiles[key]["0.5"],
    q3: quartiles[key]["0.75"]
  }));

  return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="q1" stroke="#8884d8" name="Q1 (25th Percentile)" />
                <Line type="monotone" dataKey="median" stroke="#82ca9d" name="Median (50th Percentile)" />
                <Line type="monotone" dataKey="q3" stroke="#ffc658" name="Q3 (75th Percentile)" />
            </LineChart>
        </ResponsiveContainer>
  );
};

const renderZScoresChart = (z_scores) => {
  const chartData = Object.keys(z_scores).flatMap((key) =>
    Object.keys(z_scores[key]).map((index) => ({
      name: key,
      z_score: z_scores[key][index],
      index: parseInt(index)
    }))
  );

  return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip />
                {Object.keys(z_scores).map((key) => (
                    <Line key={key} type="monotone" dataKey="z_score" stroke={getColorForAttribute(key)} name={key} />
                ))}
            </LineChart>
        </ResponsiveContainer>
  );
};

// Function to get color based on attribute name
const getColorForAttribute = (attribute) => {
  const colors = {
    Age: "#8884d8",
    Height: "#82ca9d",
    ID: "#ffc658",
    IQ: "#ff7300",
    Income: "#ff0000",
    Salary: "#00ff00",
    Weight: "#0000ff",
    YearsExperience: "#00ffff"
  };
  return colors[attribute] || "#000000"; // Default color if not specified
};

const TabularDataPage = () => {
  const [tabularFiles, setTabularFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tabularData, setTabularData] = useState({ headers: [], rows: [], statistics: {}, pagination: {}, all_headers: [] });
  const [filters, setFilters] = useState({ rows: [], rows_filter_operator: undefined, page: 1, page_size: undefined, rows_order_by: undefined, headers: [] });
  const [activeTab, setActiveTab] = useState("table");

  // Load all tabular files on component mount
  useEffect(() => {
    loadTabularFiles();
  }, []);

  const loadTabularFiles = async () => {
    const data = await fetchTabularFiles();
    if (data) { setTabularFiles(data); }
  };

  const prepareFilters = () => {
    const preparedFilters = { ...filters };
    Object.keys(preparedFilters).forEach((key) => ["", null, undefined].includes(preparedFilters[key]) && delete preparedFilters[key]);
    return preparedFilters;
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    const data = await fetchTabularData(file.id, prepareFilters());
    if (data) { setTabularData(data); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const data = await newTabularFile(file);
    if (data) {
      loadTabularFiles();
    }
  };

  const addFilter = () => {
    setFilters({ ...filters, rows: [...filters.rows, { header_id: null, row_value: "", operator: "" }] });
  };

  const handleFilterChange = (index, key, value) => {
    const newRows = [...filters.rows];
    newRows[index][key] = value;
    setFilters({ ...filters, rows: newRows });
  };

  const applyFilter = async () => {
    const filteredData = await fetchTabularData(selectedFile.id, prepareFilters());
    if (filteredData) { setTabularData(filteredData); }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePageChange = async (page) => {
    setFilters({ ...filters, page });
    const data = await fetchTabularData(selectedFile.id, { ...prepareFilters(), page });
    if (data) { setTabularData(data); }
  };

  const handlePageSizeChange = async (pageSize) => {
    setFilters({ ...filters, page_size: pageSize });
    const data = await fetchTabularData(selectedFile.id, { ...prepareFilters(), page_size: pageSize });
    if (data) { setTabularData(data); }
  };

  return (
        <div className="p-6">
            <h1 className="text-4xl font-bold text-center mb-8">Tabular Data Management</h1>

            {/* Upload Tabular File */}
            <div className="flex justify-center mb-6">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-blue-500 text-white py-2 px-4 rounded shadow-lg cursor-pointer"
                >
                    <input type="file" onChange={handleUpload} className="hidden" />
                    <label>Upload Tabular File</label>
                </motion.div>
            </div>

            {/* List of Tabular Files */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                {tabularFiles.map((file) => (
                    <motion.div
                        key={file.id}
                        onClick={() => handleFileSelect(file)}
                        className="cursor-pointer overflow-hidden rounded-lg shadow-md w-full h-32 p-4 bg-gray-100 flex items-center justify-center text-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        {file.name}
                    </motion.div>
                ))}
            </div>

            {/* Selected File Data View */}
            {selectedFile && (
                <div className="text-center">
                    {/* Tabs for switching between table and chart views */}
                    <div className="flex justify-center gap-4 mb-4 w-full flex-wrap">
                        <PrimaryButton
                            onClick={() => handleTabChange("table")}
                            className="flex-grow"
                        >
                            Table View
                        </PrimaryButton>
                        <SecondaryButton
                            onClick={() => handleTabChange("chart")}
                            className="flex-grow"
                        >
                            Chart View
                        </SecondaryButton>
                    </div>

                    {/* Filters */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold mb-4">Filters</h2>
                        {/* headers and page size, order by, operator */}
                        <div className="flex justify-center items-center mb-4">
                            <select
                                className="border p-2"
                                value={filters.rows_order_by}
                                onChange={(e) => setFilters({ ...filters, rows_order_by: e.target.value })}
                            >
                                <option value="">Order By</option>
                                {tabularData.all_headers.map((header) => (
                                    <>
                                        <option key={header.id} value={header.header}>{header.header}</option>
                                        <option key={header.id} value={`-${header.header}`}>{header.header} (Desc)</option>
                                    </>
                                ))}
                            </select>
                            <select
                                className="border p-2 mx-4"
                                value={filters.page_size}
                                onChange={(e) => handlePageSizeChange(e.target.value)}
                            >
                                <option value="">Page Size</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <select
                                className="border p-2"
                                value={filters.rows_filter_operator}
                                onChange={(e) => setFilters({ ...filters, rows_filter_operator: e.target.value })}
                            >
                                <option value="">Filter Operator</option>
                                <option value="and">AND</option>
                                <option value="or">OR</option>
                            </select>
                        </div>
                        <div className="flex justify-center items-center mb-4">
                            {/* handle filter headers */}
                            <div className="flex justify-center items-center gap-4">
                                {
                                    tabularData.all_headers.map((header) => (
                                        <div key={header.id} className={`flex items-center border p-2 ${filters.headers.includes(header.id) ? "bg-gray-800 text-white" : "bg-slate-200 text-gray-800"} cursor-pointer`} onClick={() => setFilters({ ...filters, headers: filters.headers.includes(header.id) ? filters.headers.filter((id) => id !== header.id) : [...filters.headers, header.id] })}
                                            onMouseEnter={(e) => e.target.classList.add("bg-gray-800", "text-white")}
                                            onMouseLeave={(e) => !filters.headers.includes(header.id) && e.target.classList.remove("bg-gray-800", "text-white")}
                                            onMouseDown={(e) => e.target.classList.remove("bg-gray-800", "text-white")}
                                            onContextMenu={() => setFilters({ ...filters, headers: filters.headers.includes(header.id) ? filters.headers.filter((id) => id !== header.id) : [...filters.headers, header.id] })}
                                        >
                                            {header.header}
                                        </div>
                                    ))

                                }
                            </div>

                        </div>
                        {filters.rows.map((filter, index) => (
                            <div key={index} className="flex mb-2 w-full justify-center items-center">
                                <select
                                    className="border p-2"
                                    value={filter.header_id || ""}
                                    onChange={(e) => handleFilterChange(index, "header_id", e.target.value)}
                                >
                                    <option value="" disabled>Select Header</option>
                                    {tabularData.all_headers.map((header) => (
                                        <option key={header.id} value={header.id}>{header.header}</option>
                                    ))}
                                </select>
                                <select
                                    className="border p-2 mx-2"
                                    value={filter.operator || ""}
                                    onChange={(e) => handleFilterChange(index, "operator", e.target.value)}
                                >
                                    <option value="" disabled>Select Operator</option>
                                    <option value="gt">Greater Than</option>
                                    <option value="lt">Less Than</option>
                                    <option value="eq">Equal</option>
                                    <option value="neq">Not Equal</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Value"
                                    className="border p-2"
                                    value={filter.row_value}
                                    onChange={(e) => handleFilterChange(index, "row_value", e.target.value)}
                                />
                                <PrimaryButton
                                    className="ml-4"
                                    onClick={() => setFilters({ ...filters, rows: filters.rows.filter((_, i) => i !== index) })}
                                >
                                    Remove
                                </PrimaryButton>
                            </div>
                        ))}
                        <PrimaryButton onClick={addFilter}>Add Filter</PrimaryButton>
                        <PrimaryButton className="ml-4" onClick={applyFilter}>
                            Apply Filter
                        </PrimaryButton>
                    </div>

                    {/* Table View */}
                    {activeTab === "table" && (
                        <div>
                            <table className="table-auto w-full bg-white shadow-lg">
                                <thead>
                                    <tr>
                                        {tabularData.headers.map((header) => (
                                            <th key={header.id} className="px-4 py-2">{header.header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tabularData.rows.map((row) => (
                                        <tr key={row.id}>
                                            {tabularData.headers.map((header) => (
                                                <td key={header.id} className="border px-4 py-2">{row.row_data[header.header]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                        </div>
                    )}

                    {/* Chart View */}
                    {activeTab === "chart" && tabularData.statistics && (
                        <div>
                            {Object.keys(tabularData.statistics).filter((key) => !["quartiles", "z_scores"].includes(key)).map((statKey) => {
                              const data = tabularData.statistics[statKey];
                              const chartData = Object.entries(data).map(([key, value]) => ({
                                name: key,
                                value
                              }));

                              return (
                                    <div key={statKey} className="mb-6">
                                        <h2 className="text-2xl font-semibold mb-4">{statKey.charAt(0).toUpperCase() + statKey.slice(1)}</h2>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="value" stroke="#8884d8" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                              );
                            })}
                            {tabularData.statistics.quartiles && (
                                <div className="mb-6">
                                    <h2 className="text-2xl font-semibold mb-4">Quartiles</h2>
                                    {renderQuartilesChart(tabularData.statistics.quartiles)}
                                </div>
                            )}
                            {tabularData.statistics.z_scores && (
                                <div className="mb-6">
                                    <h2 className="text-2xl font-semibold mb-4">Z-Scores</h2>
                                    {renderZScoresChart(tabularData.statistics.z_scores)}
                                </div>
                            )}
                        </div>
                    )}
                    {/* Pagination Controls */}
                    {
                        tabularData?.pagination && (
                    <div className="flex justify-center items-center mt-4">
                        <PrimaryButton
                            onClick={() => handlePageChange(tabularData.pagination.page > 1 ? tabularData.pagination.page - 1 : 1)}
                            disabled={tabularData.pagination.page === 1}
                        >
                            <i className="fas fa-chevron-left"></i>
                        </PrimaryButton>
                        <span className="mx-4">
                            Page {tabularData.pagination.page} of {tabularData.pagination.pages}
                        </span>
                        <PrimaryButton
                            onClick={() => handlePageChange(tabularData.pagination.page < tabularData.pagination.pages ? tabularData.pagination.page + 1 : tabularData.pagination.pages)}
                            disabled={tabularData.pagination.page === tabularData.pagination.pages}
                        >
                            <i className="fas fa-chevron-right"></i>
                        </PrimaryButton>
                    </div>
                        )
                }
                </div>
            )}
        </div>
  );
};

export default TabularDataPage;
