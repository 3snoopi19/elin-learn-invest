import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">ELIN</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your empathetic AI investment mentor for educational guidance.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-semibold">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/features" className="text-muted-foreground hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/learn" className="text-muted-foreground hover:text-foreground">
                  Learning Paths
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/ai-policy" className="text-muted-foreground hover:text-foreground">
                  AI Output Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/sources" className="text-muted-foreground hover:text-foreground">
                  Data Sources
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2024 ELIN Investment Mentor. All rights reserved.</p>
          <p className="mt-2 font-medium">
            Educational only — not financial advice. Consult a licensed advisor for personalized recommendations.
          </p>
        </div>
      </div>
    </footer>
  );
};