import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Flame, Crown, Zap, Star } from 'lucide-react';
import { apiClient } from '../../services/api';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  is_premium: boolean;
  premium_expires_at?: string;
}

interface StreakAnimationProps {
  userId: number;
  onPremiumUpgrade?: () => void;
}

export function StreakAnimation({ userId, onPremiumUpgrade }: StreakAnimationProps) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPremiumAnimation, setShowPremiumAnimation] = useState(false);

  useEffect(() => {
    fetchStreakData();
  }, [userId]);

  const fetchStreakData = async () => {
    try {
      const data = await apiClient.get<StreakData>('/chat/streaks/');
      setStreakData(data);
      
      // Check if user has activity today and is premium
      if (data.is_premium && hasActivityToday(data.last_activity_date)) {
        triggerPremiumAnimation();
      }
    } catch (error) {
      console.error('Failed to fetch streak data:', error);
    }
  };

  const hasActivityToday = (lastActivityDate: string): boolean => {
    const today = new Date().toDateString();
    const lastActivity = new Date(lastActivityDate).toDateString();
    return today === lastActivity;
  };

  const triggerPremiumAnimation = () => {
    setIsAnimating(true);
    setShowPremiumAnimation(true);
    
    // Animation duration
    setTimeout(() => {
      setIsAnimating(false);
      setShowPremiumAnimation(false);
    }, 3000);
  };

  const handleStreakClick = () => {
    if (streakData?.is_premium) {
      triggerPremiumAnimation();
    } else if (onPremiumUpgrade) {
      onPremiumUpgrade();
    }
  };

  if (!streakData) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-sm text-orange-700">Loading streak...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <Card 
        className={`bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 transition-all duration-300 ${
          isAnimating ? 'scale-105 shadow-lg' : ''
        } ${streakData.is_premium ? 'cursor-pointer hover:shadow-md' : ''}`}
        onClick={handleStreakClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`relative ${isAnimating ? 'animate-pulse' : ''}`}>
                <Flame className={`h-6 w-6 text-orange-500 ${isAnimating ? 'animate-bounce' : ''}`} />
                {streakData.is_premium && (
                  <Crown className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-orange-800">
                    {streakData.current_streak} Day Streak
                  </span>
                  {streakData.is_premium && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-orange-600">
                  Best: {streakData.longest_streak} days
                </p>
              </div>
            </div>
            
            {!streakData.is_premium && (
              <Button 
                size="sm" 
                variant="outline" 
                className="text-orange-600 border-orange-300 hover:bg-orange-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onPremiumUpgrade?.();
                }}
              >
                Upgrade
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Premium Animation Overlay */}
      {showPremiumAnimation && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="relative w-full h-full">
            {/* Fire particles */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              >
                <Flame className="h-4 w-4 text-orange-400" />
              </div>
            ))}
            
            {/* Lightning effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Zap className="h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
            
            {/* Stars */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${20 + (i % 2) * 60}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '2s'
                }}
              >
                <Star className="h-3 w-3 text-yellow-300 fill-current" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Premium upgrade modal component
interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function PremiumUpgradeModal({ isOpen, onClose, onUpgrade }: PremiumUpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Crown className="h-12 w-12 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Upgrade to Premium</h2>
            <p className="text-muted-foreground mb-6">
              Unlock amazing streak animations and exclusive features!
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <Flame className="h-5 w-5 text-orange-500" />
                <span>Animated streak celebrations</span>
              </div>
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Lightning effects and particles</span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Exclusive premium badges</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Maybe Later
              </Button>
              <Button onClick={onUpgrade} className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500">
                Upgrade Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
