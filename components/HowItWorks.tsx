
import React from 'react';
import { ACCENT_COLORS } from '../constants';

const Step: React.FC<{ number: string; title: string; description: string; color: string; }> = ({ number, title, description, color }) => (
    <div className="flex items-center gap-4">
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full font-bold text-dark-bg" style={{backgroundColor: color}}>
            {number}
        </div>
        <div>
            <h3 className="font-bold text-lg text-light-text dark:text-dark-text">{title}</h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{description}</p>
        </div>
    </div>
);


const HowItWorks: React.FC = () => {
    return (
        <footer className="w-full p-6 bg-light-card-bg/50 dark:bg-dark-card-bg/50 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <Step number="01" title="Plug In" description="Connect Arduino device via USB" color={ACCENT_COLORS[0]} />
                <Step number="02" title="Blink to Navigate" description="Use double blink to move through menu" color={ACCENT_COLORS[1]}/>
                <Step number="03" title="Blink to Select" description="Select your choice with a triple blink" color={ACCENT_COLORS[2]}/>
            </div>
        </footer>
    );
};

export default HowItWorks;
