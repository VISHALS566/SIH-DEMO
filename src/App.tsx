import { useState, useEffect } from "react";
import { LoginPage } from "./components/Auth/LoginPage";
import { Navigation } from "./components/Layout/Navigation";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { CrowdfundingPage } from "./components/Features/CrowdfundingPage";
import { SpotlightGallery } from "./components/Features/SpotlightGallery";
import { ClubsPage } from "./components/Features/ClubsPage";
import { MentorshipPage } from "./components/Features/MentorshipPage";
import { AdminPage } from "./components/Features/AdminPage";
import { Chat } from "./components/Features/Chat";
import { Toaster } from "./components/Layout/Toaster";
import { ApprovalsPage } from "./components/Features/ApprovalsPage";
import { authService } from "./services/authService";
import { wsService } from "./services/wsService";
import type { User } from "./types/User";

type CurrentPage =
  | "dashboard"
  | "crowdfunding"
  | "spotlight"
  | "clubs"
  | "mentorship"
  | "admin"
  | "approvals"
  | "dms"
  | "profile";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<CurrentPage>("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userProfile = await authService.getProfile();
          setUser(userProfile);
          
          // Connect to WebSocket for real-time features
          try {
            await wsService.connect();
          } catch (error) {
            console.warn('Failed to connect to WebSocket:', error);
          }
        }
      } catch (error) {
        console.warn('Authentication check failed:', error);
        // Clear invalid tokens
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    
    // Connect to WebSocket after successful login
    wsService.connect().catch(error => {
      console.warn('Failed to connect to WebSocket:', error);
    });
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      wsService.disconnect();
      setUser(null);
      setCurrentPage("dashboard");
    }
  };

  const handleOpenDMs = () => {
    setCurrentPage("dms");
  };

  const handleViewProfile = () => {
    setCurrentPage("profile");
  };

  const handleNavigateFromMoreMenu = (page: string) => {
    switch (page) {
      case "Crowdfunding":
        setCurrentPage("crowdfunding");
        break;
      case "Spotlight Gallery":
        setCurrentPage("spotlight");
        break;
      case "Clubs":
        setCurrentPage("clubs");
        break;
      case "Mentorship":
        setCurrentPage("mentorship");
        break;
      case "Admin":
        setCurrentPage("admin");
        break;
      case "Approvals":
        setCurrentPage("approvals");
        break;
      default:
        setCurrentPage("dashboard");
    }
  };

  const renderCurrentPage = () => {
    if (!user) return null;

    switch (currentPage) {
      case "dashboard":
        return <Dashboard user={user} />;
      case "crowdfunding":
        return <CrowdfundingPage />;
      case "spotlight":
        return <SpotlightGallery />;
      case "clubs":
        return <ClubsPage />;
      case "mentorship":
        return <MentorshipPage user={user} />;
      case "admin":
        return <AdminPage />;
      case "approvals":
        return <ApprovalsPage />;
      case "dms":
        return (
          <div className="container mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-6">Direct Messages</h2>
            <Chat currentUser={user} />
          </div>
        );
      case "profile":
        return (
          <div className="container mx-auto p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">
                Profile
              </h2>
              <p className="text-muted-foreground">
                Profile management feature coming soon. Your
                information is safely stored.
              </p>
            </div>
          </div>
        );
      default:
        return <Dashboard user={user} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        user={user}
        onLogout={handleLogout}
        onOpenDMs={handleOpenDMs}
        onViewProfile={handleViewProfile}
      />

      {/* Quick Navigation Pills */}
      <div className="border-b bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
        <div className="container flex items-center space-x-1 py-3 px-4">
          <button
            onClick={() => setCurrentPage("dashboard")}
            className={`px-4 py-2 text-sm rounded-full transition-all duration-200 font-medium ${
              currentPage === "dashboard"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                : "text-gray-700 hover:text-blue-600 hover:bg-blue-100"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentPage("crowdfunding")}
            className={`px-4 py-2 text-sm rounded-full transition-all duration-200 font-medium ${
              currentPage === "crowdfunding"
                ? "bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg"
                : "text-gray-700 hover:text-green-600 hover:bg-green-100"
            }`}
          >
            Crowdfunding
          </button>
          <button
            onClick={() => setCurrentPage("spotlight")}
            className={`px-4 py-2 text-sm rounded-full transition-all duration-200 font-medium ${
              currentPage === "spotlight"
                ? "bg-gradient-to-r from-yellow-600 to-orange-700 text-white shadow-lg"
                : "text-gray-700 hover:text-yellow-600 hover:bg-yellow-100"
            }`}
          >
            Spotlight
          </button>
          <button
            onClick={() => setCurrentPage("clubs")}
            className={`px-4 py-2 text-sm rounded-full transition-all duration-200 font-medium ${
              currentPage === "clubs"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                : "text-gray-700 hover:text-purple-600 hover:bg-purple-100"
            }`}
          >
            Clubs
          </button>
          <button
            onClick={() => setCurrentPage("mentorship")}
            className={`px-4 py-2 text-sm rounded-full transition-all duration-200 font-medium ${
              currentPage === "mentorship"
                ? "bg-gradient-to-r from-pink-600 to-rose-700 text-white shadow-lg"
                : "text-gray-700 hover:text-pink-600 hover:bg-pink-100"
            }`}
          >
            Mentorship
          </button>
          {user?.userType === "admin" && (
            <button
              onClick={() => setCurrentPage("admin")}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-200 font-medium ${
                currentPage === "admin"
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg"
                  : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-100"
              }`}
            >
              Admin
            </button>
          )}
          {user?.userType === "admin" && (
            <button
              onClick={() => setCurrentPage("approvals")}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-200 font-medium ${
                currentPage === "approvals"
                  ? "bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg"
                  : "text-gray-700 hover:text-orange-600 hover:bg-orange-100"
              }`}
            >
              Approvals
            </button>
          )}
        </div>
      </div>

      <main className="min-h-[calc(100vh-8rem)]">
        {renderCurrentPage()}
      </main>
      <Toaster />
    </div>
  );
}