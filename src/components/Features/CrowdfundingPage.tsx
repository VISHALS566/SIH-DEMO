import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { 
  DollarSign, 
  Calendar, 
  Users, 
  Target,
  Plus,
  Heart,
  Share2,
  TrendingUp
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";

export function CrowdfundingPage() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "EcoTrack - Sustainable Living App",
      description: "A mobile app that helps users track their carbon footprint and suggests eco-friendly alternatives for daily activities.",
      creator: "Emma Rodriguez",
      creatorRole: "Student",
      target: 15000,
      raised: 8750,
      backers: 67,
      daysLeft: 23,
      category: "Environment",
      verified: true,
      image: "/api/placeholder/400/200"
    },
    {
      id: 2,
      title: "AI-Powered Study Assistant",
      description: "An AI tool that creates personalized study plans and provides intelligent tutoring for students across various subjects.",
      creator: "Marcus Chen",
      creatorRole: "Alumni",
      target: 25000,
      raised: 18500,
      backers: 142,
      daysLeft: 15,
      category: "Education",
      verified: true,
      image: "/api/placeholder/400/200"
    },
    {
      id: 3,
      title: "Community Garden Network",
      description: "Building a network of urban community gardens to promote food security and environmental education.",
      creator: "Dr. Sarah Kim",
      creatorRole: "Faculty",
      target: 12000,
      raised: 5200,
      backers: 34,
      daysLeft: 31,
      category: "Community",
      verified: true,
      image: "/api/placeholder/400/200"
    }
  ]);

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    target: "",
    category: "",
    duration: ""
  });

  const handleContribute = (projectId: number, amount: number) => {
    setProjects(projects.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            raised: project.raised + amount,
            backers: project.backers + 1
          }
        : project
    ));
  };

  const getProgressPercentage = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Crowdfunding Projects</h1>
          <p className="text-muted-foreground mt-2">
            Support innovative projects from our community
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Submit your project idea for community funding. All projects are verified before publishing.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  placeholder="Enter your project title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Describe your project and its impact"
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target">Funding Target ($)</Label>
                  <Input
                    id="target"
                    type="number"
                    value={newProject.target}
                    onChange={(e) => setNewProject({...newProject, target: e.target.value})}
                    placeholder="10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newProject.duration}
                    onChange={(e) => setNewProject({...newProject, duration: e.target.value})}
                    placeholder="30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newProject.category}
                  onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                  placeholder="Technology, Environment, Education, etc."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button>Submit for Review</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">$156K</p>
                <p className="text-sm text-muted-foreground">Total Raised</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">23</p>
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">1.2K</p>
                <p className="text-sm text-muted-foreground">Total Backers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">78%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">{project.category}</p>
              </div>
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                {project.verified && (
                  <Badge variant="secondary" className="text-xs">
                    Verified
                  </Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Creator Info */}
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {project.creator.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{project.creator}</p>
                  <p className="text-xs text-muted-foreground">{project.creatorRole}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">${project.raised.toLocaleString()}</span>
                  <span className="text-muted-foreground">
                    ${project.target.toLocaleString()} goal
                  </span>
                </div>
                <Progress 
                  value={getProgressPercentage(project.raised, project.target)} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{project.backers} backers</span>
                  <span>{project.daysLeft} days left</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button 
                  className="flex-1" 
                  onClick={() => handleContribute(project.id, 50)}
                >
                  Back Project
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}