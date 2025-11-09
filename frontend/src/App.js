import "@/App.css";
import { ThemeProvider } from "next-themes";
import Dashboard from "@/components/Dashboard";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="App min-h-screen bg-background text-foreground">
        <Dashboard />
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}

export default App;