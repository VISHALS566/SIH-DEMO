import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { 
  Star, 
  Award, 
  TrendingUp, 
  Users, 
  Calendar,
  Filter,
  Search,
  ExternalLink,
  Heart,
  Share2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function SpotlightGallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const spotlightItems = [
    {
      id: 1,
      type: "achievement",
      title: "Forbes 30 Under 30",
      description: "Featured in Forbes 30 Under 30 for developing breakthrough AI algorithms in healthcare",
      person: "Dr. Priya Sharma",
      role: "Alumni '18",
      company: "TechHealth AI",
      category: "Recognition",
      date: "2024-11-15",
      image: "/api/placeholder/300/200",
      stats: { likes: 234, shares: 45 }
    },
    {
      id: 2,
      type: "startup",
      title: "GreenTech Solutions Startup",
      description: "Founded a sustainable technology company that raised $2M in Series A funding",
      person: "Marcus Johnson",
      role: "Alumni '20",
      company: "GreenTech Solutions",
      category: "Entrepreneurship",
      date: "2024-11-10",
      image: "/api/placeholder/300/200",
      stats: { likes: 189, shares: 67 }
    },
    {
      id: 3,
      type: "research",
      title: "Breakthrough Cancer Research",
      description: "Published groundbreaking research on early cancer detection using machine learning",
      person: "Dr. Amanda Chen",
      role: "Faculty",
      department: "Biomedical Engineering",
      category: "Research",
      date: "2024-11-08",
      image: "/api/placeholder/300/200",
      stats: { likes: 312, shares: 89 }
    },
    {
      id: 4,
      type: "community",
      title: "Community Education Initiative",
      description: "Launched free coding bootcamps for underserved communities, training 500+ students",
      person: "Sarah Martinez",
      role: "Alumni '17",
      company: "CodeForAll",
      category: "Social Impact",
      date: "2024-11-05",
      image: "/api/placeholder/300/200",
      stats: { likes: 267, shares: 78 }
    },
    {
      id: 5,
      type: "innovation",
      title: "AI-Powered Accessibility Tool",
      description: "Developed an AI tool that helps visually impaired users navigate websites more effectively",
      person: "David Kim",
      role: "Student",
      year: "Final Year",
      category: "Innovation",
      date: "2024-11-01",
      image: "/api/placeholder/300/200",
      stats: { likes: 145, shares: 34 }
    },
    {
      id: 6,
      type: "leadership",
      title: "Tech Industry Leadership",
      description: "Appointed as CTO of a Fortune 500 company, leading digital transformation initiatives",
      person: "Jennifer Wu",
      role: "Alumni '15",
      company: "Global Tech Corp",
      category: "Leadership",
      date: "2024-10-28",
      image: "/api/placeholder/300/200",
      stats: { likes: 198, shares: 56 }
    }
  ];

  const categories = [
    "all",
    "Recognition",
    "Entrepreneurship", 
    "Research",
    "Social Impact",
    "Innovation",
    "Leadership"
  ];

  const filteredItems = spotlightItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.person.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLike = (itemId: number) => {
    // In a real app, this would update the backend
    console.log(`Liked item ${itemId}`);
  };

  const handleShare = (item: any) => {
    // In a real app, this would open share dialog
    console.log(`Sharing item: ${item.title}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Spotlight Gallery</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Celebrating outstanding achievements, innovations, and contributions from our community
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">127</p>
            <p className="text-sm text-muted-foreground">Total Achievements</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">23</p>
            <p className="text-sm text-muted-foreground">This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">89</p>
            <p className="text-sm text-muted-foreground">Featured People</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold">4.8K</p>
            <p className="text-sm text-muted-foreground">Community Likes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search achievements, people, or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image/Visual */}
            <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
              <div className="text-center">
                <Award className="h-16 w-16 mx-auto text-primary mb-2" />
                <Badge variant="secondary" className="absolute top-3 right-3">
                  {item.category}
                </Badge>
              </div>
            </div>

            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {item.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Person Info */}
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {item.person.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{item.person}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.role}
                    {item.company && ` • ${item.company}`}
                    {item.department && ` • ${item.department}`}
                    {item.year && ` • ${item.year}`}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(item.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex space-x-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleLike(item.id)}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    {item.stats.likes}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleShare(item)}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    {item.stats.shares}
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Achievement CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Have an Achievement to Share?</h3>
          <p className="text-muted-foreground mb-4">
            Let the community celebrate your success! Submit your achievement for the spotlight gallery.
          </p>
          <Button>
            Submit Achievement
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}