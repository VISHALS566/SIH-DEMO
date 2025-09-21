import { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  ThumbsUp,
  TrendingUp,
  Bookmark,
  Send
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface PostFeedProps {
  userType: string;
}

export function PostFeed({ userType }: PostFeedProps) {
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Sarah Chen",
      role: "Alumni '20",
      company: "Google",
      avatar: "",
      time: "2h ago",
      content: "Just got promoted to Senior Software Engineer! Grateful for the foundation I built during my time at university. Happy to mentor current students interested in tech careers.",
      likes: 47,
      comments: 12,
      shares: 5,
      type: "achievement",
      isLiked: false,
      isBookmarked: false
    },
    {
      id: 2,
      author: "Dr. Michael Johnson",
      role: "Faculty",
      department: "Computer Science",
      avatar: "",
      time: "4h ago",
      content: "Exciting news! Our research paper on AI Ethics has been accepted to ICML 2024. Looking for students interested in research opportunities in this area.",
      likes: 23,
      comments: 8,
      shares: 15,
      type: "research",
      isLiked: true,
      isBookmarked: false
    },
    {
      id: 3,
      author: "Alex Rivera",
      role: "Student",
      year: "Final Year",
      avatar: "",
      time: "6h ago",
      content: "Just launched my capstone project - a sustainability tracking app! Looking for feedback from alumni who work in environmental tech. Would love to connect!",
      likes: 31,
      comments: 15,
      shares: 8,
      type: "project",
      isLiked: false,
      isBookmarked: true,
      projectUpvotes: 24
    }
  ]);

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleBookmark = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const handleUpvote = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId && post.projectUpvotes !== undefined
        ? { ...post, projectUpvotes: post.projectUpvotes + 1 }
        : post
    ));
  };

  const handleSubmitPost = () => {
    if (newPost.trim()) {
      const post = {
        id: posts.length + 1,
        author: "You",
        role: userType === 'student' ? 'Student' : userType === 'alumni' ? 'Alumni' : 'Faculty',
        company: "",
        avatar: "",
        time: "now",
        content: newPost,
        likes: 0,
        comments: 0,
        shares: 0,
        type: "general",
        isLiked: false,
        isBookmarked: false
      };
      setPosts([post, ...posts]);
      setNewPost("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <Avatar>
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Share an update, achievement, or project..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {userType === 'student' ? 'Project' : 'Update'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">Achievement</Badge>
                </div>
                <Button onClick={handleSubmitPost} disabled={!newPost.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex space-x-3">
                <Avatar>
                  <AvatarFallback>{post.author.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold">{post.author}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {post.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {post.company || post.department || post.year} • {post.time}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Save post</DropdownMenuItem>
                  <DropdownMenuItem>Hide post</DropdownMenuItem>
                  <DropdownMenuItem>Report</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed mb-4">{post.content}</p>
            
            {/* Project Upvotes for Student Posts */}
            {post.type === 'project' && post.projectUpvotes !== undefined && (
              <div className="flex items-center space-x-2 mb-4 p-3 bg-muted/30 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{post.projectUpvotes} project upvotes</span>
                {(userType === 'alumni' || userType === 'faculty') && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleUpvote(post.id)}
                    className="ml-auto"
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Upvote
                  </Button>
                )}
              </div>
            )}

            {/* Engagement Actions */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleLike(post.id)}
                  className={post.isLiked ? "text-red-500" : ""}
                >
                  <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? "fill-current" : ""}`} />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {post.comments}
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  {post.shares}
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleBookmark(post.id)}
                className={post.isBookmarked ? "text-blue-500" : ""}
              >
                <Bookmark className={`h-4 w-4 ${post.isBookmarked ? "fill-current" : ""}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}