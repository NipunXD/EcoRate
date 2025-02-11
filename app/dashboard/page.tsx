"use client";

import React, { useEffect, useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Legend,
  Cell
} from "recharts";
import { 
  Leaf, 
  ShieldCheck, 
  Flame, 
  Droplet, 
  Car, 
  Home,
  UserIcon,
  RecycleIcon
} from "lucide-react";
import SustainabilityTips from "@/components/tips_comp";

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
  "What is your average monthly electricity consumption (in kWh)?": { category: "Energy", Icon: Flame },
  "What is your average monthly water consumption (in gallons)?": { category: "Water", Icon: Droplet },
  "What is your gender?": { category: "Demographics", Icon: UserIcon},
  "How often do you use plastic products?": { category: "Sustainability", Icon: RecycleIcon },
  "What is your primary method of waste disposal?": { category: "Sustainability", Icon: RecycleIcon },
  "What is your level of physical activity?": { category: "Sustainability", Icon: Leaf },
};

type CategoryColorType = {
  [key in 'Sustainability' | 'Energy' | 'Transportation' | 'Home' | 'Water' | 'Demographics']: string;
};

const CATEGORY_COLORS = {
  "Sustainability": "bg-green-100 border-green-300",
  "Energy": "bg-orange-100 border-orange-300",
  "Transportation": "bg-blue-100 border-blue-300",
  "Home": "bg-yellow-100 border-yellow-300",
  "Water": "bg-cyan-100 border-cyan-300",
  "Demographics": "bg-purple-100 border-purple-300"
};

interface Submission {
  dateSubmitted: string;
  answers: string[];
}

interface CategoryData {
  category: string;
  count: number;
}

const EnhancedCategoryChart = ({ categoryData }: { categoryData: CategoryData[] }) => {
  const CATEGORY_COLORS: { [key: string]: string } = {
    "Sustainability": "#10B981", // green
    "Energy": "#F97316", // orange
    "Transportation": "#3B82F6", // blue
    "Home": "#EAB308", // yellow
    "Water": "#06B6D4", // cyan
    "Demographics": "#8B5CF6" // purple
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
      {/* Heading with Category Colors */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          <Leaf className="mr-3 text-green-600 inline-block" />
          Sustainability Profile Breakdown
        </h3>
        <div className="flex flex-wrap gap-4 text-sm">
          {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
            <div key={category} className="flex items-center">
              <span
                className="w-4 h-4 rounded-full inline-block mr-2"
                style={{ backgroundColor: color }}
              ></span>
              <span className="text-gray-700">{category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Section */}
      <ResponsiveContainer width="100%" height={350}>
        <BarChart 
          data={categoryData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#f0f0f0"
          />
          <XAxis 
            dataKey="category" 
            tick={{ fill: '#6B7280' }} 
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            tick={{ fill: '#6B7280' }} 
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(0,0,0,0.1)' }}
            contentStyle={{ 
              backgroundColor: 'white', 
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          />
          <Bar 
            dataKey="count" 
            name="Category Count"
            radius={[10, 10, 0, 0]}
          >
            {categoryData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CATEGORY_COLORS[entry.category] || "#8884d8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 text-center text-gray-600">
        <p>Categories represent different aspects of your sustainability profile.</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [predictedRating, setPredictedRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sustainabilityTips, setSustainabilityTips] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const submissionResponse = await fetch("http://localhost:8000/submission");
        const submissionData = await submissionResponse.json();

        if (!submissionData || !submissionData.answers) {
          console.error("No submission data found.");
          return;
        }

        setSubmission(submissionData);

        const predictionResponse = await fetch("http://localhost:8000/predict");
        const predictionData = await predictionResponse.json();

        setPredictedRating(predictionData.predicted_rating);

        const tipsResponse = await fetch("http://localhost:8000/tips");
        const tipsData = await tipsResponse.json();
        setSustainabilityTips(tipsData.tips);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <p>Loading data...</p>;
  }

  if (!submission) {
    return <p>No data available.</p>;
  }

  const { answers } = submission;
  const mappedQuestions = Object.entries(columnMapping).map(([question, meta], index) => ({
    question,
    answer: answers[index] || "N/A",
    category: meta.category as keyof CategoryColorType,
    Icon: meta.Icon
  }));

  const categoryData = [
    { category: 'Sustainability', count: mappedQuestions.filter(q => q.category === 'Sustainability').length },
    { category: 'Energy', count: mappedQuestions.filter(q => q.category === 'Energy').length },
    { category: 'Transportation', count: mappedQuestions.filter(q => q.category === 'Transportation').length },
    { category: 'Home', count: mappedQuestions.filter(q => q.category === 'Home').length },
    { category: 'Water', count: mappedQuestions.filter(q => q.category === 'Water').length },
    { category: 'Demographics', count: mappedQuestions.filter(q => q.category === 'Demographics').length }
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">Sustainability Dashboard</h1>

      {/* Predicted Rating */}
      {predictedRating !== null && (
        <div className="bg-green-100 text-green-700 p-4 rounded-md flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg flex items-center">
              <ShieldCheck className="mr-2" /> Predicted Sustainability Rating
            </h3>
            <p className="text-2xl font-bold">{predictedRating.toFixed(2)}/5</p>
          </div>
          <div className={`p-2 rounded-full ${
            predictedRating >= 4 ? 'bg-green-200' : 
            predictedRating >= 2.5 ? 'bg-yellow-200' : 
            'bg-red-200'
          }`}>
            <ShieldCheck 
              size={40} 
              className={
                predictedRating >= 4 ? 'text-green-600' : 
                predictedRating >= 2.5 ? 'text-yellow-600' : 
                'text-red-600'
              } 
            />
          </div>
        </div>
      )}

      <EnhancedCategoryChart categoryData={categoryData} />

      {/* Submission Details with 3D Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mappedQuestions.map(({ question, answer, category, Icon }, index) => (
          <div 
            key={index} 
            className={`
              ${CATEGORY_COLORS[category]} 
              border-2 rounded-lg p-4 
              transform transition-all duration-300 
              hover:scale-105 hover:shadow-lg
              flex flex-col items-start
            `}
          >
            <div className="flex items-center mb-2">
              <Icon className="mr-2 text-gray-600" size={24} />
              <h4 className="text-sm font-semibold text-gray-700 truncate w-full">
                {question}
              </h4>
            </div>
            <p className="text-gray-800 font-medium">
              {answer}
            </p>
          </div>
        ))}
      </div>

      {sustainabilityTips && (
        <SustainabilityTips tips={sustainabilityTips} />
      )}

      {/* Submission Date */}
      <div className="text-center text-gray-600 mt-4">
        <p>Submitted on: {new Date(submission.dateSubmitted).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default Dashboard;