import React from 'react';
import { ACCENT_COLORS } from '../constants';

const Step: React.FC<{ number: string; title: string; description: string; color: string; }> = ({ number, title, description, color }) => (
    <div className="bg-light-card-bg dark:bg-dark-card-bg p-6 rounded-2xl border border-light-card-border dark:border-dark-card-border flex flex-col items-center text-center transform transition-transform hover:scale-105 duration-300 h-full">
        <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full font-bold text-2xl text-dark-bg mb-4" style={{backgroundColor: color}}>
            {number}
        </div>
        <div>
            <h3 className="font-bold text-xl text-light-text dark:text-dark-text">{title}</h3>
            <p className="text-base text-light-text-secondary dark:text-dark-text-secondary mt-2">{description}</p>
        </div>
    </div>
);


const HowItWorks: React.FC = () => {
    return (
        <footer className="w-full p-8 bg-light-bg dark:bg-dark-bg mt-auto">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-8 text-light-text dark:text-dark-text">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Step number="01" title="Plug In" description="Connect the Arduino device via USB to your computer." color={ACCENT_COLORS[0]} />
                    <Step number="02" title="Navigate" description="A double-blink simulates a 'Down Arrow' key press to cycle through menu items." color={ACCENT_COLORS[1]}/>
                    <Step number="03" title="Select" description="A triple-blink simulates a 'Spacebar' key press to make a selection." color={ACCENT_COLORS[2]}/>
                </div>
            </div>
        </footer>
    );
};

export default HowItWorks;