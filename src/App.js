import React from "react";
import ProductList from "./components/ProductList/ProductList";

function App() {
  return (
    <div className="container my-4">
      <h1 className="text-center mb-4">Supermarket Offers</h1>
      <ProductList />
    </div>
  );
}

export default App;