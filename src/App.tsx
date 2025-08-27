import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Minimal QueryClient for debugging
const queryClient = new QueryClient();

// Minimal test component
const TestComponent = () => {
  console.log('TestComponent: React is:', typeof React);
  console.log('TestComponent: React.useEffect is:', typeof React.useEffect);
  return <div>Test Component Loaded</div>;
};

const App = () => {
  console.log('App component rendering...');
  console.log('App: React is:', typeof React);
  console.log('App: QueryClientProvider is:', typeof QueryClientProvider);
  console.log('App: queryClient is:', queryClient);
  
  // Test without QueryClientProvider first
  return <TestComponent />;
};

export default App;
