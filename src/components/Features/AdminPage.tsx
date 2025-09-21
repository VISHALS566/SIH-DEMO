import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { 
  Users, 
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  MoreHorizontal,
  UserPlus,
  GraduationCap,
  Building,
  Calendar,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle
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

export function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("alumni-management");
  
  // Mock alumni data
  const [alumni, setAlumni] = useState([
    {
      id: 1,
      name: "Sarah Chen",
      email: "sarah.chen@gmail.com",
      graduationYear: "2020",
      department: "Computer Science",
      currentPosition: "Senior Software Engineer",
      company: "Google",
      location: "San Francisco, CA",
      linkedinProfile: "linkedin.com/in/sarahchen",
      phone: "+1 (555) 123-4567",
      interests: ["Technology", "AI", "Mentorship"],
      status: "verified",
      joinDate: "2024-01-15",
      lastActive: "2024-12-15",
      menteeCount: 8,
      contributions: 45
    },
    {
      id: 2,
      name: "Marcus Johnson",
      email: "marcus.j@outlook.com",
      graduationYear: "2018",
      department: "Business Administration",
      currentPosition: "Product Manager",
      company: "Microsoft",
      location: "Seattle, WA",
      linkedinProfile: "linkedin.com/in/marcusjohnson",
      phone: "+1 (555) 987-6543",
      interests: ["Business", "Strategy", "Innovation"],
      status: "verified",
      joinDate: "2024-02-20",
      lastActive: "2024-12-14",
      menteeCount: 12,
      contributions: 67
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.r.phd@gmail.com",
      graduationYear: "2016",
      department: "Electrical Engineering",
      currentPosition: "Research Scientist",
      company: "Tesla",
      location: "Austin, TX",
      linkedinProfile: "linkedin.com/in/emilyrodriguez",
      phone: "+1 (555) 456-7890",
      interests: ["Research", "Clean Energy", "Innovation"],
      status: "pending",
      joinDate: "2024-12-10",
      lastActive: "2024-12-13",
      menteeCount: 0,
      contributions: 12
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.kim.dev@gmail.com",
      graduationYear: "2021",
      department: "Computer Science",
      currentPosition: "Software Developer",
      company: "Amazon",
      location: "New York, NY",
      linkedinProfile: "linkedin.com/in/davidkim",
      phone: "+1 (555) 321-0987",
      interests: ["Technology", "Cloud Computing", "DevOps"],
      status: "suspended",
      joinDate: "2024-03-05",
      lastActive: "2024-11-20",
      menteeCount: 3,
      contributions: 23
    }
  ]);

  const [newAlumni, setNewAlumni] = useState({
    name: "",
    email: "",
    graduationYear: "",
    department: "",
    currentPosition: "",
    company: "",
    location: "",
    linkedinProfile: "",
    phone: "",
    interests: ""
  });

  const handleAddAlumni = () => {
    const alumniData = {
      id: alumni.length + 1,
      ...newAlumni,
      interests: newAlumni.interests.split(',').map(i => i.trim()),
      status: "pending",
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      menteeCount: 0,
      contributions: 0
    };
    setAlumni([...alumni, alumniData]);
    setNewAlumni({
      name: "",
      email: "",
      graduationYear: "",
      department: "",
      currentPosition: "",
      company: "",
      location: "",
      linkedinProfile: "",
      phone: "",
      interests: ""
    });
  };

  const handleStatusChange = (alumniId: number, newStatus: string) => {
    setAlumni(alumni.map(a => 
      a.id === alumniId ? { ...a, status: newStatus } : a
    ));
  };

  const handleDeleteAlumni = (alumniId: number) => {
    setAlumni(alumni.filter(a => a.id !== alumniId));
  };

  const filteredAlumni = alumni.filter(alumnus => {
    const matchesSearch = alumnus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alumnus.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alumnus.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alumnus.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" || alumnus.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'suspended': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      case 'suspended': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  // Analytics data
  const analyticsData = {
    totalAlumni: alumni.length,
    verifiedAlumni: alumni.filter(a => a.status === 'verified').length,
    pendingApprovals: alumni.filter(a => a.status === 'pending').length,
    activeThis30Days: alumni.filter(a => {
      const lastActive = new Date(a.lastActive);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastActive >= thirtyDaysAgo;
    }).length,
    totalMentorships: alumni.reduce((sum, a) => sum + a.menteeCount, 0),
    totalContributions: alumni.reduce((sum, a) => sum + a.contributions, 0)
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage alumni network and platform analytics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Alumni
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alumni-management">Alumni</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-800">{analyticsData.totalAlumni}</p>
                <p className="text-sm text-blue-600">Total Alumni</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-800">{analyticsData.verifiedAlumni}</p>
                <p className="text-sm text-green-600">Verified Alumni</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                <p className="text-2xl font-bold text-yellow-800">{analyticsData.pendingApprovals}</p>
                <p className="text-sm text-yellow-600">Pending Approvals</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6 text-center">
                <GraduationCap className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <p className="text-2xl font-bold text-purple-800">{analyticsData.totalMentorships}</p>
                <p className="text-sm text-purple-600">Active Mentorships</p>
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
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">New alumni registration: Emily Rodriguez</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Alumni verification approved: Marcus Johnson</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Alumni account suspended: David Kim</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alumni-management" className="space-y-6">
          {/* Search and Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alumni by name, email, company, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Alumni
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Alumni</DialogTitle>
                  <DialogDescription>
                    Add a new alumni member to the network
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newAlumni.name}
                      onChange={(e) => setNewAlumni({...newAlumni, name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newAlumni.email}
                      onChange={(e) => setNewAlumni({...newAlumni, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="graduation">Graduation Year</Label>
                    <Input
                      id="graduation"
                      value={newAlumni.graduationYear}
                      onChange={(e) => setNewAlumni({...newAlumni, graduationYear: e.target.value})}
                      placeholder="2020"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newAlumni.department}
                      onChange={(e) => setNewAlumni({...newAlumni, department: e.target.value})}
                      placeholder="Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Current Position</Label>
                    <Input
                      id="position"
                      value={newAlumni.currentPosition}
                      onChange={(e) => setNewAlumni({...newAlumni, currentPosition: e.target.value})}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={newAlumni.company}
                      onChange={(e) => setNewAlumni({...newAlumni, company: e.target.value})}
                      placeholder="Google"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newAlumni.location}
                      onChange={(e) => setNewAlumni({...newAlumni, location: e.target.value})}
                      placeholder="San Francisco, CA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newAlumni.phone}
                      onChange={(e) => setNewAlumni({...newAlumni, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      value={newAlumni.linkedinProfile}
                      onChange={(e) => setNewAlumni({...newAlumni, linkedinProfile: e.target.value})}
                      placeholder="linkedin.com/in/johndoe"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="interests">Interests (comma-separated)</Label>
                    <Input
                      id="interests"
                      value={newAlumni.interests}
                      onChange={(e) => setNewAlumni({...newAlumni, interests: e.target.value})}
                      placeholder="Technology, AI, Mentorship"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleAddAlumni}>Add Alumni</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Alumni Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumni</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mentees</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlumni.map((alumnus) => (
                    <TableRow key={alumnus.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              {alumnus.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{alumnus.name}</p>
                            <p className="text-sm text-muted-foreground">{alumnus.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{alumnus.department}</p>
                          <p className="text-sm text-muted-foreground">Class of {alumnus.graduationYear}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{alumnus.company}</p>
                          <p className="text-sm text-muted-foreground">{alumnus.currentPosition}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(alumnus.status)}>
                          {getStatusIcon(alumnus.status)}
                          <span className="ml-1 capitalize">{alumnus.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{alumnus.menteeCount}</TableCell>
                      <TableCell>{new Date(alumnus.lastActive).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Select
                            value={alumnus.status}
                            onValueChange={(value) => handleStatusChange(alumnus.id, value)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="verified">Verified</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteAlumni(alumnus.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto text-indigo-600 mb-2" />
                <p className="text-2xl font-bold text-indigo-800">{analyticsData.activeThis30Days}</p>
                <p className="text-sm text-indigo-600">Active This Month</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-pink-50 to-pink-100">
              <CardContent className="p-6 text-center">
                <GraduationCap className="h-8 w-8 mx-auto text-pink-600 mb-2" />
                <p className="text-2xl font-bold text-pink-800">{analyticsData.totalContributions}</p>
                <p className="text-sm text-pink-600">Total Contributions</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-teal-50 to-teal-100">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto text-teal-600 mb-2" />
                <p className="text-2xl font-bold text-teal-800">
                  {((analyticsData.verifiedAlumni / analyticsData.totalAlumni) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-teal-600">Verification Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Department Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Alumni by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  alumni.reduce((acc, alumnus) => {
                    acc[alumnus.department] = (acc[alumnus.department] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([department, count]) => (
                  <div key={department} className="flex items-center justify-between">
                    <span className="font-medium">{department}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                          style={{ width: `${(count / analyticsData.totalAlumni) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}