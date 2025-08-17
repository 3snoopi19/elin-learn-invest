import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">About ELIN</h1>
        <div className="max-w-3xl">
          <p className="text-lg text-muted-foreground mb-6">
            ELIN (Educational Learning Investment Navigator) is your empathetic AI investment mentor 
            designed specifically for beginner investors who want to learn about investing without the jargon and pressure.
          </p>
          <p className="text-muted-foreground">
            Our mission is to make investment education accessible, clear, and confidence-building 
            while maintaining strict compliance with educational-only content standards.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;