// Navbar.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4 w-full">
      <div className="container mx-auto flex justify-between items-center flex-col md:flex-row gap-4 md:gap-0">
        <Link to="/" className="text-white text-2xl font-bold">
          Corporatica Assesment
        </Link>
        <div className="flex gap-2 flex-col md:flex-row md:gap-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="text-white hover:text-gray-300">
              Tabular Data
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/image_data" className="text-white hover:text-gray-300">
                Image Data
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/text_data" className="text-white hover:text-gray-300">
                Text Data
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/about" className="text-white hover:text-gray-300">
              Contact
            </Link>
          </motion.div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
