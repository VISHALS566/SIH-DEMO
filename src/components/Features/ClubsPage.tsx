import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { 
  Users, 
  Calendar, 
  MapPin, 
  Search,
  Plus,
  Star,
  MessageCircle,
  Settings,
  UserPlus
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
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export function ClubsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("discover");
  
  const clubs = [
    {
      id: 1,
      name: "Tech Innovation Society",
      description: "A community of tech enthusiasts sharing knowledge, organizing hackathons, and building innovative projects together.",
      members: 234,
      posts: 45,
      category: "Technology",
      isPublic: true,
      isMember: false,
      isOwner: false,
      lastActivity: "2 hours ago",
      upcomingEvents: 2,
      coverColor: "from-blue-500 to-purple-600"
    },
    {
      id: 2,
      name: "Alumni Entrepreneurs",
      description: "Connecting alumni who are founders, providing mentorship, networking opportunities, and startup resources.",
      members: 156,
      posts: 78,
      category: "Business",
      isPublic: true,
      isMember: true,
      isOwner: false,
      lastActivity: "1 hour ago",
      upcomingEvents: 1,
      coverColor: "from-green-500 to-teal-600"
    },
    {
      id: 3,
      name: "Sustainable Future Club",
      description: "Dedicated to environmental sustainability projects, green initiatives, and climate action discussions.",
      members: 89,
      posts: 23,
      category: "Environment",
      isPublic: true,
      isMember: false,
      isOwner: false,
      lastActivity: "3 hours ago",
      upcomingEvents: 3,
      coverColor: "from-emerald-500 to-green-600"
    },
    {
      id: 4,
      name: "Data Science Collective",
      description: "Sharing insights, collaborating on data projects, and discussing the latest trends in data science and AI.",
      members: 198,
      posts: 92,
      category: "Technology",
      isPublic: false,
      isMember: true,
      isOwner: true,
      lastActivity: "30 minutes ago",
      upcomingEvents: 1,
      coverColor: "from-purple-500 to-pink-600"
    },
    {
      id: 5,
      name: "Creative Arts Network",
      description: "A space for artists, designers, writers, and creative professionals to showcase work and collaborate.",
      members: 145,
      posts: 67,
      category: "Arts",
      isPublic: true,
      isMember: false,
      isOwner: false,
      lastActivity: "4 hours ago",
      upcomingEvents: 2,
      coverColor: "from-orange-500 to-red-600"
    },
    {
      id: 6,
      name: "Career Development Hub",
      description: "Professional development resources, interview prep, career advice, and networking opportunities.",
      members: 312,
      posts: 134,
      category: "Career",
      isPublic: true,
      isMember: true,
      isOwner: false,
      lastActivity: "1 hour ago",
      upcomingEvents: 4,
      coverColor: "from-indigo-500 to-blue-600"
    }
  ];

  const myClubs = clubs.filter(club => club.isMember);
  const discoveredClubs = clubs.filter(club => !club.isMember);

  const [newClub, setNewClub] = useState({
    name: "",
    description: "",
    category: "",
    isPublic: true
  });

  const handleJoinClub = (clubId: number) => {
    // In a real app, this would call an API
    console.log(`Joining club ${clubId}`);
  };

  const handleLeaveClub = (clubId: number) => {
    // In a real app, this would call an API
    console.log(`Leaving club ${clubId}`);
  };

  const filteredClubs = (clubList: any[]) => {
    return clubList.filter(club =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const ClubCard = ({ club, showMemberActions = false }: { club: any, showMemberActions?: boolean }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`h-24 bg-gradient-to-r ${club.coverColor} flex items-center justify-center relative`}>
        <div className="absolute top-3 right-3 flex space-x-1">
          {!club.isPublic && (
            <Badge variant="secondary" className="text-xs">Private</Badge>
          )}
          {club.isOwner && (
            <Badge variant="default" className="text-xs">Owner</Badge>
          )}
        </div>
        <h3 className="text-white font-semibold text-lg text-center px-4">{club.name}</h3>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">{club.category}</Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>{club.lastActivity}</span>
          </div>
        </div>
        <CardDescription className="line-clamp-2 text-sm">
          {club.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold">{club.members}</p>
            <p className="text-xs text-muted-foreground">Members</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{club.posts}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{club.upcomingEvents}</p>
            <p className="text-xs text-muted-foreground">Events</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          {!club.isMember ? (
            <Button 
              className="flex-1" 
              onClick={() => handleJoinClub(club.id)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Join Club
            </Button>
          ) : (
            <>
              <Button className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                View Posts
              </Button>
              {showMemberActions && (
                <>
                  {club.isOwner && (
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleLeaveClub(club.id)}
                  >
                    Leave
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clubs & Communities</h1>
          <p className="text-muted-foreground mt-2">
            Connect with like-minded people and join interest-based communities
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Club
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Club</DialogTitle>
              <DialogDescription>
                Start a new community around your interests. You'll be the club owner and can invite members.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="club-name">Club Name</Label>
                <Input
                  id="club-name"
                  value={newClub.name}
                  onChange={(e) => setNewClub({...newClub, name: e.target.value})}
                  placeholder="Tech Innovation Society"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="club-description">Description</Label>
                <Textarea
                  id="club-description"
                  value={newClub.description}
                  onChange={(e) => setNewClub({...newClub, description: e.target.value})}
                  placeholder="Describe what your club is about and what members can expect"
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="club-category">Category</Label>
                <Input
                  id="club-category"
                  value={newClub.category}
                  onChange={(e) => setNewClub({...newClub, category: e.target.value})}
                  placeholder="Technology, Business, Arts, etc."
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="public-club"
                  checked={newClub.isPublic}
                  onChange={(e) => setNewClub({...newClub, isPublic: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="public-club">Make this club public</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button>Create Club</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clubs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-clubs">My Clubs ({myClubs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Discover New Clubs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs(discoveredClubs).map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-clubs" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">My Clubs</h2>
            {myClubs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClubs(myClubs).map((club) => (
                  <ClubCard key={club.id} club={club} showMemberActions={true} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No clubs joined yet</h3>
                <p className="text-muted-foreground mb-4">
                  Join clubs to connect with people who share your interests
                </p>
                <Button onClick={() => setSelectedTab("discover")}>
                  Discover Clubs
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}