import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ChevronRight } from 'lucide-react';
import zooImage from "../../../assets/images/home/zooImage.png"


const AboutUs = () => {
  // Animation controls
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  // Start animations when section comes into view
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="bg-gradient-to-b from-green-50 to-white min-h-screen">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-96 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/api/placeholder/1920/1080')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl font-bold mb-4"
          >
            NANDANVAN JUNGLE SAFARI
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="w-32 h-1 bg-green-400 mx-auto mb-8"
          ></motion.div>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-xl max-w-3xl mx-auto"
          >
            Experience the wilderness in the heart of Naya Raipur
          </motion.p>
        </div>
      </motion.div>

      {/* About Section */}
      <div className="max-w-6xl mx-auto py-20 px-4">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 md:grid-cols-2 gap-16"
        >
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-4xl font-bold text-green-800">ABOUT</h2>
            <div className="w-20 h-1 bg-green-500"></div>
            <p className="text-gray-700 leading-relaxed">
              Naya Raipur city is developing into a world class city. It is the vision of the Former Chief Minister Dr. Raman Singh to create a world class Zoo & Safari in Naya Raipur. In fact this is one of his dream project. The proposed area is adjoining the Botanical Garden. The whole area, thus shall be developed as a conservation, recreational and educational site.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Nandanvan Jungle Safari, Naya Raipur will provide pleasing experience to the visitors not only about the local wildlife but also about national wildlife. The exhibits care and awareness will be of such a level to promote conservation of wildlife.
            </p>
            <button className="flex items-center mt-4 text-green-600 font-medium group">
              READ MORE
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="relative">
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-green-200 rounded-full -z-10 opacity-60"></div>
            <img
              src={zooImage}
              alt="Nandanvan Jungle Safari"
              className="rounded-xl shadow-xl w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Objectives Section */}
      <div className="bg-green-900 text-white py-20 px-4 border-t-8 border-black border-b-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Objective of Nandanvan Jungle Safari</h2>
            <div className="w-20 h-1 bg-green-400 mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              "To create awareness among the visitor about wildlife.",
              "Conservation and breeding of endangered species of wild animals.",
              "To promote scientific housing and up keeping of wild animals.",
              "To enhance the interest of public in ex situ and in situ conservation and breeding of wild animals.",
              "To conserve the Biodiversity of state rich heritage.",
              "To promote recreational, educational and other activates of environmental importance."
            ].map((objective, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start"
              >
                <div className="bg-green-400 rounded-full p-2 mr-4 flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-900" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-lg">{objective}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
            className="flex justify-center mt-12"
          >
            <button className="flex items-center mt-4 text-green-300 font-medium group">
              READ MORE
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="relative bg-cover bg-center py-20"
        style={{ backgroundImage: "url('/api/placeholder/1920/1080')" }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-80"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-green-900 mb-6">Visit Nandanvan Jungle Safari</h2>
          <p className="text-xl text-green-900 mb-10">
            Experience the beauty of wildlife and contribute to conservation efforts
          </p>
          <button className="bg-black text-white px-8 py-4 rounded-lg font-bold hover:bg-green-100 transition-colors">
            PLAN YOUR VISIT
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutUs;