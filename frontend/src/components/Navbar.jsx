import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { user, signout } = useAuth();

  function handleSignout() {
    signout();
    window.location.href = "/";
  }

  return (
    <nav className="border-b border-border bg-background">
      <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-display text-xl text-foreground">
            Formjo
          </Link>

          {user && user.role === "coach" && (
            <>
              <Link to="/coach/lessons" className="text-sm text-muted-foreground hover:text-foreground">
                Lessons
              </Link>
              <Link to="/coach/modules" className="text-sm text-muted-foreground hover:text-foreground">
                Modules
              </Link>
              <Link to="/coach/assignments" className="text-sm text-muted-foreground hover:text-foreground">
                Assignments
              </Link>
            </>
          )}

          {user && user.role === "student" && (
            <Link to="/student/assignments" className="text-sm text-muted-foreground hover:text-foreground">
              Assignments
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignout}>
              Sign out
            </Button>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
