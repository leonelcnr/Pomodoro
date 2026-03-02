import React from 'react';
import { Play, Pause, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingTimerProps {
    timeLeft: number;
    isActive: boolean;
    onToggle: () => void;
    onClose: () => void;
}

function DosDigitos({ value }: { value: number }) {
    const tens = Math.floor(value / 10);
    const ones = value % 10;
    return (
        <span className="inline-flex">
            <span>{tens}</span>
            <span>{ones}</span>
        </span>
    );
}

export const FloatingTimer = ({ timeLeft, isActive, onToggle, onClose }: FloatingTimerProps) => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-screen bg-background text-foreground font-mono select-none overflow-hidden"
            style={{ margin: 0, padding: 0 }}>
            <div className="absolute top-2 right-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex items-baseline gap-1 text-6xl tracking-tighter cursor-pointer" onClick={onToggle}>
                <DosDigitos value={Math.floor(timeLeft / 60)} />
                <span className="opacity-50">:</span>
                <DosDigitos value={timeLeft % 60} />
            </div>

            <div className="mt-6 flex gap-4">
                <Button
                    onClick={onToggle}
                    size="icon"
                    variant={isActive ? "outline" : "default"}
                    className="h-12 w-12 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95">
                    {isActive ? <Pause className="fill-current w-5 h-5" /> : <Play className="fill-current w-5 h-5 ml-0.5" />}
                </Button>
            </div>
        </div>
    );
};
