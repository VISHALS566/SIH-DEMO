import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Progress } from "../ui/progress";
import { 
  Star, 
  TrendingUp, 
  Calendar, 
  Users, 
  Briefcase, 
  BookOpen,
  Target,
  Flame
} from "lucide-react";
import { PostFeed } from "./PostFeed";
import { QuickStats } from "./QuickStats";

interface DashboardProps {
  user: any;
}

export function Dashboard({ user }: DashboardProps) {
  const userType = user?.userType || 'student';
  
  const welcomeMessage = {
    student: `Welcome back, ${user?.email?.split('@')[0]}! Keep up the great work.`,
    alumni: `Welcome back! Your experience is valuable to our community.`,
    faculty: `Welcome, Professor. Ready to mentor the next generation?`,
    admin: `Welcome, Admin. Here's your institution overview.`,
    recruiter: `Welcome! Discover talented candidates from our network.`
  };

  const streakDays = 12; // Mock data
  const userRating = 4.7; // Mock data

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {welcomeMessage[userType as keyof typeof welcomeMessage]}
              </h1>
              <p className="text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {userType === 'student' && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-3 shadow-md">
                  <Flame className="h-6 w-6 text-orange-600" />
                  <div>
                    <p className="text-sm font-semibold text-orange-800">{streakDays} Day Streak</p>
                    <p className="text-xs text-orange-600">Keep it up!</p>
                  </div>
                </div>
              )}
              {(userType === 'alumni' || userType === 'faculty') && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg p-3 shadow-md">
                  <Star className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">{userRating} Rating</p>
                    <p className="text-xs text-yellow-600">Community score</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <QuickStats userType={userType} />
          
          {/* Recent Activity / Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest posts and updates from your network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PostFeed userType={userType} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Upcoming Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Alumni Tech Meetup</p>
                  <p className="text-sm text-muted-foreground">Dec 15, 2024 • 6:00 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Career Fair</p>
                  <p className="text-sm text-muted-foreground">Dec 20, 2024 • 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Annual Gala</p>
                  <p className="text-sm text-muted-foreground">Jan 5, 2025 • 7:00 PM</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Events
              </Button>
            </CardContent>
          </Card>

          {/* Career Opportunities */}
          {(userType === 'student' || userType === 'alumni') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Career Opportunities</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-3">
                  <p className="font-medium">Software Engineer</p>
                  <p className="text-sm text-muted-foreground">Tech Corp</p>
                  <Badge variant="secondary" className="mt-1">Remote</Badge>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="font-medium">Product Manager</p>
                  <p className="text-sm text-muted-foreground">StartupXYZ</p>
                  <Badge variant="secondary" className="mt-1">Hybrid</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  Browse All Jobs
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Top Contributors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Top Contributors</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>A{i}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Alumni {i}</p>
                    <p className="text-xs text-muted-foreground">250 contributions</p>
                  </div>
                  <Badge variant="outline">{5 - i + 3}.{Math.floor(Math.random() * 10)}</Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-3">
                View Leaderboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}