"use client";

import React from "react";
import { 
  FaBrain, 
  FaRobot, 
  FaCogs, 
  FaMagic, 
  FaArrowRight, 
  FaMicrochip 
} from "react-icons/fa";

const AiTools = () => {
  const tools = [
    {
      id: "bq-ai",
      title: "BookQubit AI",
      subtitle: "The Core Intelligence",
      desc: "Our primary LLM tuned specifically for literary structures, character arc consistency, and emotional pacing.",
      icon: <FaBrain />,
      color: "from-blue-600 to-indigo-500",
      size: "md:col-span-2",
      tag: "LATEST"
    },
    {
      id: "bq-agentic",
      title: "Agentic AI",
      subtitle: "Autonomous Publishing",
      desc: "Self-operating agents that handle formatting, SEO metadata, and global distribution without supervision.",
      icon: <FaRobot />,
      color: "from-purple-600 to-pink-500",
      size: "md:col-span-1",
      tag: "ADVANCED"
    },
    {
      id: "bq-engine",
      title: "BookQubit Engine",
      subtitle: "The Powerhouse",
      desc: "The underlying architecture supporting 500,000+ books with sub-millisecond search and 20-language translation.",
      icon: <FaCogs />,
      color: "from-orange-500 to-red-600",
      size: "md:col-span-1",
      tag: "V4.0"
    },
    {
      id: "bq-studio",
      title: "Creative Studio",
      subtitle: "Visual Generation",
      desc: "Generate stunning 4K book covers and character concept art directly from your manuscript's description.",
      icon: <FaMagic />,
      color: "from-emerald-500 to-teal-400",
      size: "md:col-span-2",
      tag: "NEW"
    }
  ];

  return (
    <section className="py-24 px-6 bg-[#030712] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-sm font-black tracking-[0.3em] text-blue-500 uppercase mb-4">
            The Intelligence Layer
          </h2>
          <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
            Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">AI Ecosystem</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div 
              key={tool.id} 
              className={`${tool.size} group relative p-px rounded-3xl bg-white/10 hover:bg-white/20 transition-all duration-500 overflow-hidden`}
            >
              {/* Inner Card */}
              <div className="relative h-full bg-gray-900/90 backdrop-blur-xl rounded-[23px] p-8 flex flex-col justify-between">
                
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-2xl text-white shadow-lg shadow-black/50`}>
                      {tool.icon}
                    </div>
                    <span className="text-[10px] font-black px-2 py-1 bg-white/5 border border-white/10 text-gray-400 rounded-md tracking-widest uppercase">
                      {tool.tag}
                    </span>
                  </div>

                  <h4 className="text-2xl font-black text-white mb-1 tracking-tight">
                    {tool.title}
                  </h4>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-4 bg-clip-text text-transparent bg-gradient-to-r ${tool.color}`}>
                    {tool.subtitle}
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-8">
                    {tool.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <button className="flex items-center gap-2 text-white text-sm font-bold group/btn">
                    Learn More 
                    <FaArrowRight className="text-xs group-hover/btn:translate-x-2 transition-transform duration-300" />
                  </button>
                  
                  {/* Miniature Data Visualizer */}
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1 h-3 rounded-full bg-gradient-to-t ${tool.color} opacity-20 group-hover:animate-bounce`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${tool.color} blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Hardware Info */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2 text-white font-mono text-xs">
            <FaMicrochip /> POWERED BY BOOKQUBIT QUANTUM NODES
          </div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="text-white font-mono text-xs uppercase tracking-tighter">
            Latency: 24ms — High Availability
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiTools;