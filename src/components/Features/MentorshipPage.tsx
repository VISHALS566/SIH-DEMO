import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { 
  Users, 
  Calendar, 
  Search,
  Plus,
  Star,
  MessageCircle,
  UserCheck,
  Clock,
  Award,
  Target,
  Heart,
  Send,
  CheckCircle,
  XCircle,
  Filter
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";

interface MentorshipPageProps {
  user: any;
}

export function MentorshipPage({ user }: MentorshipPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTab, setSelectedTab] = useState(user?.userType === 'alumni' ? 'mentor-dashboard' : 'find-mentors');
  
  // Mock data for mentors (alumni)
  const availableMentors = [
    {
      id: 1,
      name: "Sarah Chen",
      position: "Senior Software Engineer",
      company: "Google",
      graduationYear: "2020",
      department: "Computer Science",
      expertise: ["Software Development", "Data Science", "Career Growth"],
      rating: 4.9,
      menteeCount: 8,
      responseTime: "< 24 hours",
      bio: "Passionate about helping students transition into tech careers. Specialized in full-stack development and data science.",
      availability: "Available",
      location: "San Francisco, CA",
      mentoringStyle: "Structured sessions with clear goals",
      achievements: ["Forbes 30 Under 30", "Tech Leadership Award"]
    },
    {
      id: 2,
      name: "Marcus Johnson",
      position: "Product Manager",
      company: "Microsoft",
      graduationYear: "2018",
      department: "Business Administration",
      expertise: ["Product Management", "Business Strategy", "Entrepreneurship"],
      rating: 4.8,
      menteeCount: 12,
      responseTime: "< 12 hours",
      bio: "Love guiding ambitious students through their career journey. Focus on product strategy and business development.",
      availability: "Limited",
      location: "Seattle, WA",
      mentoringStyle: "Flexible, goal-oriented approach",
      achievements: ["Product Excellence Award", "Startup Founder"]
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      position: "Research Scientist",
      company: "Tesla",
      graduationYear: "2016",
      department: "Electrical Engineering",
      expertise: ["Research", "Engineering", "Clean Energy"],
      rating: 4.7,
      menteeCount: 6,
      responseTime: "< 48 hours",
      bio: "Researcher passionate about sustainable technology. Help students explore research opportunities and engineering careers.",
      availability: "Available",
      location: "Austin, TX",
      mentoringStyle: "Research-focused with practical applications",
      achievements: ["IEEE Young Engineer Award", "Clean Tech Innovation"]
    }
  ];

  // Mock data for mentorship requests
  const mentorshipRequests = [
    {
      id: 1,
      studentName: "Alex Kim",
      department: "Computer Science",
      year: "Junior",
      interests: ["Web Development", "AI", "Startups"],
      message: "Hi! I'm really interested in breaking into tech after graduation. I'd love to learn about your journey from university to Google.",
      status: "pending",
      requestDate: "2024-12-15"
    },
    {
      id: 2,
      studentName: "Maya Patel",
      department: "Business",
      year: "Senior",
      interests: ["Product Management", "Strategy"],
      message: "Hello! I'm graduating next year and fascinated by product management. Would love to learn from your experience.",
      status: "pending", 
      requestDate: "2024-12-14"
    }
  ];

  // Mock data for current mentorships
  const currentMentorships = [
    {
      id: 1,
      mentorName: "Sarah Chen",
      studentName: "Jordan Wu",
      startDate: "2024-10-01",
      duration: "6 months",
      progress: 65,
      lastSession: "2024-12-10",
      nextSession: "2024-12-20",
      goals: ["Prepare for tech interviews", "Build portfolio", "Network in tech"],
      status: "active"
    }
  ];

  const handleRequestMentorship = (mentorId: number) => {
    console.log(`Requesting mentorship from mentor ${mentorId}`);
  };

  const handleAcceptRequest = (requestId: number) => {
    console.log(`Accepting mentorship request ${requestId}`);
  };

  const handleDeclineRequest = (requestId: number) => {
    console.log(`Declining mentorship request ${requestId}`);
  };

  const filteredMentors = availableMentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || 
                           mentor.expertise.some(exp => exp.toLowerCase().includes(selectedCategory.toLowerCase()));
    return matchesSearch && matchesCategory;
  });

  const MentorCard = ({ mentor }: { mentor: any }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {mentor.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{mentor.name}</h3>
              <p className="text-sm text-muted-foreground">{mentor.position}</p>
              <p className="text-sm font-medium text-blue-600">{mentor.company}</p>
            </div>
          </div>
          <Badge 
            variant={mentor.availability === 'Available' ? 'default' : 'secondary'}
            className={mentor.availability === 'Available' ? 'bg-green-600' : 'bg-orange-500'}
          >
            {mentor.availability}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{mentor.rating}</span>
            </div>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
          <div>
            <p className="font-semibold">{mentor.menteeCount}</p>
            <p className="text-xs text-muted-foreground">Mentees</p>
          </div>
          <div>
            <div className="flex items-center justify-center">
              <Clock className="h-4 w-4 text-green-600 mr-1" />
            </div>
            <p className="text-xs text-muted-foreground">{mentor.responseTime}</p>
          </div>
        </div>

        {/* Expertise */}
        <div>
          <p className="text-sm font-medium mb-2">Expertise</p>
          <div className="flex flex-wrap gap-1">
            {mentor.expertise.map((skill: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>

        {/* Achievements */}
        <div className="flex items-center space-x-2">
          <Award className="h-4 w-4 text-orange-500" />
          <span className="text-xs text-muted-foreground">
            {mentor.achievements.join(', ')}
          </span>
        </div>

        {/* Action */}
        <Button 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={() => handleRequestMentorship(mentor.id)}
          disabled={mentor.availability !== 'Available'}
        >
          <Send className="h-4 w-4 mr-2" />
          Request Mentorship
        </Button>
      </CardContent>
    </Card>
  );

  if (user?.userType === 'alumni') {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Mentorship Hub
          </h1>
          <p className="text-lg text-muted-foreground">
            Guide the next generation and make a lasting impact
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="mentor-dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="requests">Requests ({mentorshipRequests.length})</TabsTrigger>
            <TabsTrigger value="mentorships">Mentorships</TabsTrigger>
          </TabsList>

          <TabsContent value="mentor-dashboard" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-800">8</p>
                  <p className="text-sm text-blue-600">Current Mentees</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-800">4.9</p>
                  <p className="text-sm text-green-600">Average Rating</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <p className="text-2xl font-bold text-purple-800">24</p>
                  <p className="text-sm text-purple-600">Hours Response Time</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <p className="text-2xl font-bold text-orange-800">95%</p>
                  <p className="text-sm text-orange-600">Success Rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">New message from Jordan Wu</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Completed session with Alex Kim</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <div className="space-y-4">
              {mentorshipRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{request.studentName}</CardTitle>
                        <CardDescription>
                          {request.department} • {request.year} • Requested on {new Date(request.requestDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Interests:</p>
                      <div className="flex flex-wrap gap-2">
                        {request.interests.map((interest, index) => (
                          <Badge key={index} variant="secondary">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Message:</p>
                      <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                        {request.message}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleDeclineRequest(request.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mentorships" className="space-y-6">
            <div className="space-y-4">
              {currentMentorships.map((mentorship) => (
                <Card key={mentorship.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{mentorship.studentName}</CardTitle>
                        <CardDescription>
                          Started {new Date(mentorship.startDate).toLocaleDateString()} • {mentorship.duration}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{mentorship.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                          style={{ width: `${mentorship.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Goals:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {mentorship.goals.map((goal, index) => (
                          <li key={index}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Last Session</p>
                        <p className="text-muted-foreground">{new Date(mentorship.lastSession).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Next Session</p>
                        <p className="text-muted-foreground">{new Date(mentorship.nextSession).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message Student
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Student view
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Find Your Mentor
        </h1>
        <p className="text-lg text-muted-foreground">
          Connect with experienced alumni to accelerate your career growth
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="find-mentors">Find Mentors</TabsTrigger>
          <TabsTrigger value="my-mentorships">My Mentorships</TabsTrigger>
        </TabsList>

        <TabsContent value="find-mentors" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, company, or expertise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Expertise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Expertise</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-mentorships" className="space-y-6">
          {currentMentorships.length > 0 ? (
            <div className="space-y-4">
              {currentMentorships.map((mentorship) => (
                <Card key={mentorship.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Mentorship with {mentorship.mentorName}</CardTitle>
                        <CardDescription>
                          Started {new Date(mentorship.startDate).toLocaleDateString()} • {mentorship.duration}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{mentorship.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                          style={{ width: `${mentorship.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message Mentor
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No active mentorships</h3>
              <p className="text-muted-foreground mb-4">
                Start your journey by connecting with a mentor
              </p>
              <Button 
                onClick={() => setSelectedTab('find-mentors')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Find Mentors
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}