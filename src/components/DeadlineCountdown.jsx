import { useState, useEffect } from 'react';
import { HiOutlineClock, HiOutlineExclamation } from 'react-icons/hi';

/**
 * DeadlineCountdown Component
 * Shows time remaining until deadline with color-coded urgency
 *
 * @param {Date|string} deadline - The deadline date
 * @param {string} size - 'sm' | 'md' | 'lg' (default: 'md')
 * @param {boolean} showIcon - Show clock icon (default: true)
 * @param {boolean} showLabel - Show "Deadline:" label (default: false)
 * @param {boolean} compact - Compact mode for cards (default: false)
 */
export default function DeadlineCountdown({
    deadline,
    size = 'md',
    showIcon = true,
    showLabel = false,
    compact = false,
}) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        if (!deadline) return null;

        const deadlineDate = new Date(deadline);
        const now = new Date();
        const diff = deadlineDate - now;

        if (diff <= 0) {
            return { expired: true, text: 'Overdue', days: 0, hours: 0, minutes: 0 };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        let text = '';
        if (days > 0) {
            text = days === 1 ? '1 day' : `${days} days`;
            if (hours > 0 && days < 3) {
                text += ` ${hours}h`;
            }
        } else if (hours > 0) {
            text = hours === 1 ? '1 hour' : `${hours} hours`;
            if (minutes > 0) {
                text += ` ${minutes}m`;
            }
        } else {
            text = minutes === 1 ? '1 minute' : `${minutes} minutes`;
        }

        return { expired: false, text, days, hours, minutes, totalMs: diff };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [deadline]);

    if (!deadline || !timeLeft) return null;

    // Determine urgency level for styling
    const getUrgencyLevel = () => {
        if (timeLeft.expired) return 'overdue';
        if (timeLeft.days === 0 && timeLeft.hours < 6) return 'critical';
        if (timeLeft.days === 0) return 'urgent';
        if (timeLeft.days <= 1) return 'warning';
        if (timeLeft.days <= 3) return 'caution';
        return 'normal';
    };

    const urgency = getUrgencyLevel();

    // Color schemes based on urgency
    const colors = {
        overdue: 'text-red-500 bg-red-500/10 border-red-500/30',
        critical: 'text-red-400 bg-red-500/10 border-red-500/30',
        urgent: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
        warning: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        caution: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
        normal: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    };

    const textColors = {
        overdue: 'text-red-500',
        critical: 'text-red-400',
        urgent: 'text-orange-400',
        warning: 'text-amber-400',
        caution: 'text-yellow-400',
        normal: 'text-emerald-400',
    };

    // Size variants
    const sizes = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2',
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    // Compact mode - just text with color
    if (compact) {
        return (
            <span className={`inline-flex items-center gap-1 ${textColors[urgency]}`}>
                {showIcon && (
                    urgency === 'overdue' || urgency === 'critical' ? (
                        <HiOutlineExclamation className={iconSizes[size]} />
                    ) : (
                        <HiOutlineClock className={iconSizes[size]} />
                    )
                )}
                <span className={size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}>
                    {timeLeft.expired ? 'Overdue' : timeLeft.text}
                </span>
            </span>
        );
    }

    // Full badge mode
    return (
        <div className={`inline-flex items-center gap-1.5 rounded-lg border ${colors[urgency]} ${sizes[size]}`}>
            {showIcon && (
                urgency === 'overdue' || urgency === 'critical' ? (
                    <HiOutlineExclamation className={iconSizes[size]} />
                ) : (
                    <HiOutlineClock className={iconSizes[size]} />
                )
            )}
            {showLabel && <span className="opacity-70">Deadline:</span>}
            <span className="font-medium">
                {timeLeft.expired ? 'Overdue' : timeLeft.text}
            </span>
        </div>
    );
}

/**
 * DeadlineBar Component
 * Visual progress bar showing time remaining
 */
export function DeadlineBar({ deadline, createdAt }) {
    if (!deadline) return null;

    const deadlineDate = new Date(deadline);
    const startDate = createdAt ? new Date(createdAt) : new Date();
    const now = new Date();

    const totalDuration = deadlineDate - startDate;
    const elapsed = now - startDate;
    const percentElapsed = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    const percentRemaining = 100 - percentElapsed;

    // Color based on remaining time
    const getBarColor = () => {
        if (percentRemaining <= 10) return 'bg-red-500';
        if (percentRemaining <= 25) return 'bg-orange-500';
        if (percentRemaining <= 50) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <div className="w-full">
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className={`h-full ${getBarColor()} transition-all duration-500`}
                    style={{ width: `${percentRemaining}%` }}
                />
            </div>
        </div>
    );
}
