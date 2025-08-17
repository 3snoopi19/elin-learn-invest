import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground">Terms of service coming soon...</p>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;