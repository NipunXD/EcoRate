"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Leaf, 
  ShieldCheck, 
  Flame, 
  Droplet, 
  Car, 
  Home,
  UserIcon,
  RecycleIcon,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

const columnMapping = {
  "What is your age?": { category: "Demographics", Icon: UserIcon },
  "Where do you live?": { category: "Demographics", Icon: Home },
  "What best describes your diet?": { category: "Sustainability", Icon: Leaf },
  "How often do you consume locally sourced food?": { category: "Sustainability", Icon: RecycleIcon },
  "What is your primary mode of transportation?": { category: "Transportation", Icon: Car },
  "What is the primary source of energy used in your home?": { category: "Energy", Icon: Flame },
  "What type of home do you live in?": { category: "Home", Icon: Home },
  "What is the approximate size of your home (in square feet)?": { category: "Home", Icon: Home },
  "How often do you purchase new clothing?": { category: "Sustainability", Icon: Leaf },
  "Do you prioritize purchasing from sustainable brands?": { category: "Sustainability", Icon: RecycleIcon },
  "How would you rate your environmental awareness?": { category: "Sustainability", Icon: Leaf },
  "How involved are you in community activities or initiatives?": { category: "Sustainability", Icon: Leaf },
  "What is your average monthly electricity consumption (in kilowatt-hours)?": { category: "Energy", Icon: Flame },
  "What is your average monthly water consumption (in gallons)?": { category: "Water", Icon: Droplet },
  "What is your gender?": { category: "Demographics", Icon: UserIcon},
  "How often do you use plastic products?": { category: "Sustainability", Icon: RecycleIcon },
  "What is your primary method of waste disposal?": { category: "Sustainability", Icon: RecycleIcon },
  "What is your level of physical activity?": { category: "Sustainability", Icon: Leaf },
};

const CATEGORY_COLORS = {
  "Sustainability": "bg-green-100 border-green-300 hover:bg-green-200",
  "Energy": "bg-orange-100 border-orange-300 hover:bg-orange-200",
  "Transportation": "bg-blue-100 border-blue-300 hover:bg-blue-200",
  "Home": "bg-yellow-100 border-yellow-300 hover:bg-yellow-200",
  "Water": "bg-cyan-100 border-cyan-300 hover:bg-cyan-200",
  "Demographics": "bg-purple-100 border-purple-300 hover:bg-purple-200"
};

const questions = [
  { question: "What is your age?", type: "text" },
  { question: "Where do you live?", type: "select", options: ["Urban", "Rural", "Suburban"] },
  { question: "What best describes your diet?", type: "select", options: ["Mostly Plant-Based", "Balanced", "Mostly Animal-Based"] },
  { question: "How often do you consume locally sourced food?", type: "select", options: ["Often", "Sometimes", "Rarely", "Never"] },
  { question: "What is your primary mode of transportation?", type: "select", options: ["Car", "Bike", "Public Transit", "Walk"] },
  { question: "What is the primary source of energy used in your home?", type: "select", options: ["Renewable", "Non-Renewable", "Mixed"] },
  { question: "What type of home do you live in?", type: "select", options: ["House", "Apartment", "Other"] },
  { question: "What is the approximate size of your home (in square feet)?", type: "text" },
  { question: "How often do you purchase new clothing?", type: "select", options: ["Often", "Sometimes", "Rarely", "Never"] },
  { question: "Do you prioritize purchasing from sustainable brands?", type: "select", options: ["Yes", "No"] },
  { question: "How would you rate your environmental awareness?", type: "select", options: ["1", "2", "3", "4", "5"] },
  { question: "How involved are you in community activities or initiatives?", type: "select", options: ["High", "Moderate", "Low"] },
  { question: "What is your average monthly electricity consumption (in kilowatt-hours)?", type: "text" },
  { question: "What is your average monthly water consumption (in gallons)?", type: "text" },
  { question: "What is your gender?", type: "select", options: ["Male", "Female", "Non-Binary"] },
  { question: "How often do you use plastic products?", type: "select", options: ["Often", "Sometimes", "Rarely", "Never"] },
  { question: "What is your primary method of waste disposal?", type: "select", options: ["Landfill", "Recycling", "Composting", "Combination"] },
  { question: "What is your level of physical activity?", type: "select", options: ["High", "Moderate", "Low"] },
];

const SustainabilityForm = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const router = useRouter();

  const currentQuestionData = questions[currentQuestion];
  const { Icon, category } = Object.entries(columnMapping).find(
    ([question]) => question === currentQuestionData.question
  )?.[1] || { Icon: Leaf, category: "Sustainability" } as { Icon: typeof Leaf, category: keyof typeof CATEGORY_COLORS };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = e.target.value;
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (answers[currentQuestion] !== undefined && answers[currentQuestion] !== "") {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    const formData = {
      answers,
      dateSubmitted: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        alert("Error submitting the form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting the form");
    }
  };

  const renderQuestionInput = () => {
    if (currentQuestionData.type === "text") {
      return (
        <input 
          type="text" 
          value={answers[currentQuestion] || ""} 
          onChange={handleAnswerChange}
          className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          placeholder="Type your answer here"
        />
      );
    }
    if (currentQuestionData.type === "select") {
      return (
        <select 
          value={answers[currentQuestion] || ""} 
          onChange={handleAnswerChange}
          className="w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
        >
          <option value="" disabled>Select your answer</option>
          {currentQuestionData.options?.map((option: string, index: number) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className={`
        w-full max-w-2xl 
        ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]} 
        rounded-2xl 
        shadow-2xl 
        p-8 
        transform 
        transition-all 
        duration-500 
        hover:scale-105
      `}>
        <div className="flex items-center mb-6">
          <Icon className="mr-4 text-gray-700" size={40} />
          <h1 className="text-2xl font-bold text-gray-800">
            Sustainability Questionnaire
          </h1>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {currentQuestionData.question}
          </h2>
          {renderQuestionInput()}
        </div>

        <div className="flex justify-between items-center">
          {currentQuestion > 0 && (
            <button 
              onClick={handlePrevious} 
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="mr-2" /> Previous
            </button>
          )}

          {currentQuestion < questions.length - 1 ? (
            <button 
              onClick={handleNext}
              disabled={!answers[currentQuestion]}
              className="ml-auto bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              Next <ArrowRight className="ml-2" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={!answers[currentQuestion]}
              className="ml-auto bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              Submit <ShieldCheck className="ml-2" />
            </button>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-500" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityForm;