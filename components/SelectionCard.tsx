import React from 'react';

interface SelectionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

const SelectionCard: React.FC<SelectionCardProps> = ({ title, description, icon, selected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-start p-4 rounded-xl border transition-all duration-200 w-full text-left group
        ${selected 
          ? 'bg-cyan-900/20 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
          : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
        }
      `}
    >
      <div className={`p-2 rounded-lg mb-3 ${selected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700/50 text-slate-400 group-hover:text-slate-200'}`}>
        {icon}
      </div>
      <h3 className={`font-semibold text-sm mb-1 ${selected ? 'text-white' : 'text-slate-200'}`}>
        {title}
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed">
        {description}
      </p>
      
      {selected && (
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
      )}
    </button>
  );
};

export default SelectionCard;