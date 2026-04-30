import React, { useState } from 'react';
import { BookCheck, CheckCircle2, AlertCircle, ArrowRight, Award } from 'lucide-react';

const QUESTIONS = [
  {
    id: 1,
    question: "What is a healthy and normal length for a menstrual cycle?",
    options: ["Exactly 28 days", "Between 21 and 35 days", "15 to 20 days", "Over 40 days"],
    answer: 1, // Index 1 is correct
    explanation: "A normal cycle ranges from 21 to 35 days. Every body is different!"
  },
  {
    id: 2,
    question: "Which of the following is a common symptom of Iron-Deficiency Anemia caused by heavy periods?",
    options: ["Excessive energy", "Extreme fatigue and pale skin", "Increased appetite", "High fever"],
    answer: 1,
    explanation: "Heavy bleeding can deplete iron levels, leading to extreme fatigue, weakness, and pale skin."
  },
  {
    id: 3,
    question: "True or False: Menstrual health and hygiene is strictly a 'women's issue' and shouldn't be discussed by others.",
    options: ["True", "False"],
    answer: 1,
    explanation: "False! Menstrual health is a human health issue. Awareness across all genders breaks stigmas and builds supportive environments."
  }
];

export default function AwarenessAssignment() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleNext = () => {
    if (selectedOption === QUESTIONS[currentQ].answer) {
      setScore(score + 1);
    }
    
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setIsCompleted(true);
    }
  };

  const checkAnswer = (index: number) => {
    setSelectedOption(index);
    setShowResult(true);
  };

  if (isCompleted) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Assignment Completed!</h2>
        <p className="text-slate-500 mb-6">You scored {score} out of {QUESTIONS.length}</p>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl inline-block">
          <p className="text-emerald-700 font-bold flex items-center gap-2">
            <CheckCircle2 size={20} /> Mandatory Awareness Requirement Met
          </p>
        </div>
      </div>
    );
  }

  const question = QUESTIONS[currentQ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 rounded-3xl text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <BookCheck size={28} /> Mandatory Awareness Assignment
          </h2>
          <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm">
            Question {currentQ + 1} of {QUESTIONS.length}
          </span>
        </div>
        <p className="text-blue-100 font-medium">To maintain access to institutional services, please complete this quick educational module.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">
          {question.question}
        </h3>

        <div className="space-y-3 mb-8">
          {question.options.map((opt, idx) => {
            let btnClass = "w-full text-left p-4 rounded-2xl border-2 transition-all font-medium text-slate-700 ";
            if (showResult) {
              if (idx === question.answer) btnClass += "bg-emerald-50 border-emerald-500 text-emerald-700";
              else if (idx === selectedOption) btnClass += "bg-rose-50 border-rose-500 text-rose-700";
              else btnClass += "border-slate-100 opacity-50";
            } else {
              btnClass += selectedOption === idx ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-100 hover:border-blue-200 hover:bg-slate-50";
            }

            return (
              <button 
                key={idx} 
                disabled={showResult}
                onClick={() => checkAnswer(idx)}
                className={btnClass}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className={`p-5 rounded-2xl mb-6 flex items-start gap-3 ${selectedOption === question.answer ? 'bg-emerald-50 text-emerald-800' : 'bg-orange-50 text-orange-800'}`}>
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-relaxed">{question.explanation}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button 
            disabled={!showResult}
            onClick={handleNext}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg"
          >
            {currentQ === QUESTIONS.length - 1 ? 'Finish Assignment' : 'Next Question'} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}