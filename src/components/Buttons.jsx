import { motion } from "framer-motion";

export const PrimaryButton = ({ children, onClick, className, disabled }) => {
  return (
        <motion.button
        className={"bg-gray-800 text-white px-4 py-2 rounded shadow-lg hover:border-gray-950" + ` ${className || ""} `}
        whileHover={{ scale: 1.1, zIndex: 10 }}
        onClick={onClick}
        disabled={disabled}
    >
        {children}
    </motion.button>
  );
};

export const SecondaryButton = ({ children, onClick, className, disabled }) => {
  return (
        <motion.button
        className={"bg-slate-200 text-gray-800 px-4 py-2 rounded shadow-lg hover:border-slate-400" + ` ${className || ""} `}
        whileHover={{ scale: 1.1, zIndex: 10 }}
        onClick={onClick}
        disabled={disabled}
    >
        {children}
    </motion.button>
  );
};
