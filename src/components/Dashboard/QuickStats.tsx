import { Card, CardContent } from "../ui/card";
import { 
  Users, 
  TrendingUp, 
  BookOpen, 
  Target,
  Briefcase,
  Star,
  DollarSign,
  Award
} from "lucide-react";

interface QuickStatsProps {
  userType: string;
}

export function QuickStats({ userType }: QuickStatsProps) {
  const getStatsForUserType = () => {
    switch (userType) {
      case 'student':
        return [
          { label: 'Network Connections', value: '45', icon: Users, change: '+12%' },
          { label: 'Projects Submitted', value: '8', icon: BookOpen, change: '+25%' },
          { label: 'Mentorship Hours', value: '24', icon: Target, change: '+8%' },
          { label: 'Skill Rating', value: '4.2', icon: Star, change: '+0.3' },
        ];
      case 'alumni':
        return [
          { label: 'Mentees', value: '12', icon: Users, change: '+3' },
          { label: 'Contributions', value: '156', icon: TrendingUp, change: '+24%' },
          { label: 'Projects Funded', value: '5', icon: DollarSign, change: '+2' },
          { label: 'Community Rating', value: '4.8', icon: Star, change: '+0.1' },
        ];
      case 'faculty':
        return [
          { label: 'Students Mentored', value: '89', icon: Users, change: '+15' },
          { label: 'Projects Reviewed', value: '234', icon: BookOpen, change: '+45%' },
          { label: 'Research Papers', value: '12', icon: Award, change: '+3' },
          { label: 'Teaching Rating', value: '4.9', icon: Star, change: '+0.2' },
        ];
      case 'admin':
        return [
          { label: 'Total Users', value: '2,340', icon: Users, change: '+15%' },
          { label: 'Active Projects', value: '67', icon: BookOpen, change: '+8%' },
          { label: 'Funds Raised', value: '$45K', icon: DollarSign, change: '+22%' },
          { label: 'Engagement Rate', value: '78%', icon: TrendingUp, change: '+5%' },
        ];
      case 'recruiter':
        return [
          { label: 'Candidates Viewed', value: '156', icon: Users, change: '+12%' },
          { label: 'Applications', value: '23', icon: Briefcase, change: '+8' },
          { label: 'Interviews Scheduled', value: '7', icon: Target, change: '+3' },
          { label: 'Success Rate', value: '67%', icon: TrendingUp, change: '+5%' },
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForUserType();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.change.startsWith('+');
        
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                    {stat.change}
                    <span className="text-muted-foreground ml-1">vs last month</span>
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}