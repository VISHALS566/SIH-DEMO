import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  FileText,
  DollarSign,
  Users,
  Search,
  Filter,
  Eye,
  MessageCircle,
  Calendar,
  Building,
  GraduationCap
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Label } from "../ui/label";

export function ApprovalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("alumni-registrations");

  // Mock data for pending approvals
  const [pendingAlumni, setPendingAlumni] = useState([
    {
      id: 1,
      name: "Sarah Williams",
      email: "sarah.williams@gmail.com",
      graduationYear: "2019",
      department: "Computer Science",
      currentPosition: "Software Engineer",
      company: "Meta",
      linkedinProfile: "linkedin.com/in/sarahwilliams",
      submittedAt: "2024-12-15T10:30:00Z",
      interests: ["Technology", "AI", "Mentorship"],
      status: "pending"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "m.chen@outlook.com",
      graduationYear: "2020",
      department: "Business Administration",
      currentPosition: "Product Manager",
      company: "Netflix",
      linkedinProfile: "linkedin.com/in/michaelchen",
      submittedAt: "2024-12-14T16:45:00Z",
      interests: ["Product Strategy", "Leadership", "Innovation"],
      status: "pending"
    }
  ]);

  const [pendingProjects, setPendingProjects] = useState([
    {
      id: 1,
      title: "AI-Powered Study Assistant",
      description: "A machine learning application to help students with personalized study recommendations",
      submittedBy: "Alex Johnson",
      category: "Technology",
      fundingGoal: 25000,
      submittedAt: "2024-12-13T14:20:00Z",
      status: "pending"
    },
    {
      id: 2,
      title: "Sustainable Campus Initiative",
      description: "Campus-wide sustainability project focusing on renewable energy and waste reduction",
      submittedBy: "Emma Davis",
      category: "Environment",
      fundingGoal: 50000,
      submittedAt: "2024-12-12T09:15:00Z",
      status: "pending"
    }
  ]);

  const [pendingMentorships, setPendingMentorships] = useState([
    {
      id: 1,
      mentorName: "Dr. Robert Zhang",
      menteeName: "Lisa Parker",
      mentorCompany: "Google",
      menteeYear: "Junior",
      menteeDepartment: "Computer Science",
      requestedAt: "2024-12-14T11:30:00Z",
      message: "Looking for guidance in machine learning and career development in tech industry.",
      status: "pending"
    }
  ]);

  const handleApprove = (type: string, id: number) => {
    const timestamp = new Date().toISOString();
    
    switch (type) {
      case 'alumni':
        setPendingAlumni(prev => prev.map(item => 
          item.id === id ? { ...item, status: "approved", approvedAt: timestamp } : item
        ));
        break;
      case 'project':
        setPendingProjects(prev => prev.map(item => 
          item.id === id ? { ...item, status: "approved", approvedAt: timestamp } : item
        ));
        break;
      case 'mentorship':
        setPendingMentorships(prev => prev.map(item => 
          item.id === id ? { ...item, status: "approved", approvedAt: timestamp } : item
        ));
        break;
    }
  };

  const handleReject = (type: string, id: number) => {
    const timestamp = new Date().toISOString();
    
    switch (type) {
      case 'alumni':
        setPendingAlumni(prev => prev.map(item => 
          item.id === id ? { ...item, status: "rejected", rejectedAt: timestamp } : item
        ));
        break;
      case 'project':
        setPendingProjects(prev => prev.map(item => 
          item.id === id ? { ...item, status: "rejected", rejectedAt: timestamp } : item
        ));
        break;
      case 'mentorship':
        setPendingMentorships(prev => prev.map(item => 
          item.id === id ? { ...item, status: "rejected", rejectedAt: timestamp } : item
        ));
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate pending counts
  const pendingCounts = {
    alumni: pendingAlumni.filter(item => item.status === 'pending').length,
    projects: pendingProjects.filter(item => item.status === 'pending').length,
    mentorships: pendingMentorships.filter(item => item.status === 'pending').length
  };

  const totalPending = pendingCounts.alumni + pendingCounts.projects + pendingCounts.mentorships;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Approvals Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and manage pending submissions and requests
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{totalPending}</p>
            <p className="text-sm text-muted-foreground">Total Pending</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6 text-center">
            <User className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-800">{pendingCounts.alumni}</p>
            <p className="text-sm text-blue-600">Alumni Registrations</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-800">{pendingCounts.projects}</p>
            <p className="text-sm text-green-600">Project Submissions</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-800">{pendingCounts.mentorships}</p>
            <p className="text-sm text-purple-600">Mentorship Requests</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="alumni-registrations">
            Alumni ({pendingCounts.alumni})
          </TabsTrigger>
          <TabsTrigger value="project-submissions">
            Projects ({pendingCounts.projects})
          </TabsTrigger>
          <TabsTrigger value="mentorship-requests">
            Mentorships ({pendingCounts.mentorships})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alumni-registrations" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alumni by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Alumni Registration Requests */}
          <div className="space-y-4">
            {pendingAlumni
              .filter(alumni => selectedFilter === 'all' || alumni.status === selectedFilter)
              .filter(alumni => 
                alumni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                alumni.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                alumni.company.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((alumni) => (
                <Card key={alumni.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {alumni.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{alumni.name}</CardTitle>
                          <CardDescription>{alumni.email}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(alumni.status)}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(alumni.submittedAt)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{alumni.department}</p>
                          <p className="text-muted-foreground">Class of {alumni.graduationYear}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{alumni.company}</p>
                          <p className="text-muted-foreground">{alumni.currentPosition}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Interests:</p>
                      <div className="flex flex-wrap gap-2">
                        {alumni.interests.map((interest, index) => (
                          <Badge key={index} variant="outline">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {alumni.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleApprove('alumni', alumni.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleReject('alumni', alumni.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Alumni Registration Details</DialogTitle>
                              <DialogDescription>
                                Review all information submitted by {alumni.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>LinkedIn Profile</Label>
                                  <p className="text-sm text-blue-600">{alumni.linkedinProfile}</p>
                                </div>
                                <div>
                                  <Label>Submitted At</Label>
                                  <p className="text-sm">{formatDate(alumni.submittedAt)}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="project-submissions" className="space-y-6">
          <div className="space-y-4">
            {pendingProjects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription>Submitted by {project.submittedBy}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(project.status)}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(project.submittedAt)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">{project.category}</Badge>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">${project.fundingGoal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {project.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleApprove('project', project.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleReject('project', project.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mentorship-requests" className="space-y-6">
          <div className="space-y-4">
            {pendingMentorships.map((mentorship) => (
              <Card key={mentorship.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {mentorship.mentorName} ← {mentorship.menteeName}
                      </CardTitle>
                      <CardDescription>
                        {mentorship.menteeName} ({mentorship.menteeYear}, {mentorship.menteeDepartment})
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(mentorship.status)}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(mentorship.requestedAt)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{mentorship.mentorCompany}</span>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Message from student:</Label>
                    <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg mt-1">
                      {mentorship.message}
                    </p>
                  </div>

                  {mentorship.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleApprove('mentorship', mentorship.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Match
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleReject('mentorship', mentorship.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}