import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Linkedin, GraduationCap, X, Loader2 } from "lucide-react";
import { authService, RegisterData, User } from "../../services/api";
import { toast } from "sonner";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [userType, setUserType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
    linkedin_profile: "",
    phone_number: "",
    date_of_birth: "",
    bio: "",
    interests: [] as string[]
  });

  const interestOptions = [
    "Technology", "Software Development", "Data Science", "Artificial Intelligence",
    "Cybersecurity", "Mobile Development", "Web Development", "Cloud Computing",
    "Business", "Entrepreneurship", "Marketing", "Finance", "Consulting",
    "Product Management", "Project Management", "Strategy", "Innovation",
    "Healthcare", "Biotechnology", "Medical Research", "Public Health",
    "Engineering", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering",
    "Environment", "Sustainability", "Climate Change", "Renewable Energy",
    "Education", "Research", "Teaching", "Training", "Academia",
    "Arts & Design", "Creative Writing", "Graphic Design", "UI/UX Design",
    "Media", "Journalism", "Communications", "Public Relations",
    "Social Impact", "Non-profit", "Community Service", "Volunteering",
    "Sports", "Travel", "Photography", "Music", "Reading", "Gaming"
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType || !formData.email || !formData.first_name || !formData.last_name || !formData.password || formData.interests.length < 3) {
      toast.error("Please fill in all required fields and select at least 3 interests");
      return;
    }

    if (formData.password !== formData.password_confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    try {
      const registerData: RegisterData = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        password_confirm: formData.password_confirm,
        user_type: userType as User['user_type'],
        linkedin_profile: formData.linkedin_profile || undefined,
        phone_number: formData.phone_number || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        bio: formData.bio || undefined,
        interests_data: formData.interests,
      };

      const result = await authService.register(registerData);
      toast.success("Registration successful!");
      onLogin(result.user);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Alumni Connect</CardTitle>
          <CardDescription>
            Connect with your institution's alumni network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userType">I am a</Label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="alumni">Alumni</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@institution.edu"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_confirm">Confirm Password</Label>
                <Input
                  id="password_confirm"
                  type="password"
                  value={formData.password_confirm}
                  onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn Profile</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="linkedin"
                  value={formData.linkedin_profile}
                  onChange={(e) => setFormData({ ...formData, linkedin_profile: e.target.value })}
                  placeholder="linkedin.com/in/yourprofile"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Input
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Interests Section */}
            <div className="space-y-3">
              <Label>Your Interests (Select at least 3)</Label>
              
              {/* Selected Interests */}
              {formData.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border">
                  {formData.interests.map((interest) => (
                    <Badge 
                      key={interest} 
                      variant="default" 
                      className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                      onClick={() => removeInterest(interest)}
                    >
                      {interest}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Available Interests */}
              <div className="max-h-40 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                <div className="grid grid-cols-2 gap-2">
                  {interestOptions.map((interest) => (
                    <label
                      key={interest}
                      className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                        formData.interests.includes(interest)
                          ? 'bg-blue-100 text-blue-800'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <Checkbox
                        checked={formData.interests.includes(interest)}
                        onCheckedChange={() => handleInterestToggle(interest)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <span className="text-sm">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Selected: {formData.interests.length} (minimum 3 required)
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
              disabled={!userType || !formData.email || !formData.first_name || !formData.last_name || !formData.password || formData.interests.length < 3 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Join Alumni Network"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}