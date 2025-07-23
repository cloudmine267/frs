import React from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: any) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabProps {
  value: string;
  label: string;
}

// TypeScript module declaration for Tabs
export {};

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={className}>
      <div className="flex gap-2 mb-4">
        {React.Children.map(children, (child: any) =>
          React.cloneElement(child, {
            isActive: child.props.value === value,
            onClick: () => onValueChange(child.props.value),
          })
        )}
      </div>
    </div>
  );
}

export function Tab({ value, label, isActive, onClick }: TabProps & { isActive?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      className={`px-4 py-2 rounded-t-md font-medium border-b-2 transition-colors ${
        isActive
          ? 'border-brand-blue text-brand-blue bg-white'
          : 'border-transparent text-gray-500 bg-gray-100 hover:text-brand-blue'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
} 