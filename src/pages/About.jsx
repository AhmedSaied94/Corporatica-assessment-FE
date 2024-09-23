import React from "react";
import { motion } from "framer-motion";

const AboutPage = () => {
  return (
        <div className="flex flex-col items-center justify-center min-h-screen  p-6">
            <motion.h1
                className="text-4xl font-bold text-gray-800 mb-6"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                About Me
            </motion.h1>

            <motion.div
                className="bg-white rounded-lg mt-8 shadow-lg p-6 w-full max-w-2xl"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <p className="text-gray-700 leading-relaxed mb-4">
                    {"Hi! I'm a full stack developer specializing in "} <span className="font-semibold">Django</span> and <span className="font-semibold">React</span>. I love building dynamic and responsive web applications that provide an exceptional user experience.
                </p>

                <p className="text-gray-700 leading-relaxed mb-4">
                    With a strong foundation in both front-end and back-end development, I am able to create seamless integrations and robust architectures. My goal is to continually improve my skills and stay updated with the latest technologies.
                </p>

                <p className="text-gray-700 leading-relaxed mb-4">
                    {"When I'm not coding, you can find me exploring new tech trends, contributing to open-source projects, or enjoying time outdoors."}
                </p>

                <motion.h2
                    className="text-2xl font-semibold text-gray-800 mt-6 mb-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    Contact Information
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                        className="bg-gray-800 p-4 rounded-lg shadow-md text-white transition-colors hover:bg-gray-700"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <p className="font-semibold">Email:</p>
                        <a href="mailto:ahmed.saeed311294@gmail.com" className="text-sky-500 hover:underline">ahmed.saeed311294@gmail.com</a>
                    </motion.div>

                    <motion.div
                        className="bg-gray-800 p-4 rounded-lg shadow-md text-white transition-colors hover:bg-gray-700"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <p className="font-semibold">LinkedIn:</p>
                        <a href="https://www.linkedin.com/in/ahmed-saied94/" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">linkedin.com/in/ahmed-saied94/</a>
                    </motion.div>

                    <motion.div
                        className="bg-gray-800 p-4 rounded-lg shadow-md text-white transition-colors hover:bg-gray-700"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <p className="font-semibold">GitHub:</p>
                        <a href="https://github.com/AhmedSaied94" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">github.com/AhmedSaied94</a>
                    </motion.div>
                    <motion.div
                        className="bg-gray-800 p-4 rounded-lg shadow-md text-white transition-colors hover:bg-gray-700"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                    >
                        <p className="font-semibold">Portfolio</p>
                        <a href="https://ahmedsaied.info" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">
                        ahmedsaied.info</a>
                    </motion.div>
                </div>
            </motion.div>

        </div>
  );
};

export default AboutPage;
