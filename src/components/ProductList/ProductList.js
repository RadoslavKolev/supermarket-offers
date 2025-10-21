import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ProductCard from "../ProductCard/ProductCard";
import { Carousel as BootstrapCarousel } from "bootstrap";
import { useWindowWidth } from "../../hooks/useWindowWidth";
import "./ProductList.css";

// API endpoint
const API_URL = "https://sofia-supermarkets-api-proxy.stefan-bratanov.workers.dev/products";

function ProductList() {
  // States
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [supermarketFilter, setSupermarketFilter] = useState("");
  const [onlyOffers, setOnlyOffers] = useState(true);
  const [loading, setLoading] = useState(true);

  // Ref to the carousel element
  const carouselRef = useRef(null);

  const width = useWindowWidth();

  // Decide number of cards per slide based on screen width
  let cardsPerSlide;
  if (width >= 992) cardsPerSlide = 4; // LG
  else if (width >= 768) cardsPerSlide = 3; // MD/tablet
  else if (width >= 403) cardsPerSlide = 2;
  else cardsPerSlide = 1; // SM/phone

  // Fetch offers from API
  const fetchOffers = async () => {
    try {
      setLoading(true);

      // Fetch data from API
      const response = await axios.get(API_URL, {
        params: { offers: onlyOffers },
      });

      const allProducts = [];

      // Process data
      for (const store of response.data) {
        for (const product of store.products) {
          allProducts.push({
            ...product,
            supermarket: store.supermarket,
            discount:
              product.oldPrice && product.price < product.oldPrice
                ? Math.round(
                    ((product.oldPrice - product.price) / product.oldPrice) *
                      100
                  )
                : 0,
          });
        }
      }

      // Sort products by discount descending
      allProducts.sort((a, b) => b.discount - a.discount);
      setProducts(allProducts);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch offers on component mount and when onlyOffers changes
  useEffect(() => {
    fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyOffers]);

  // Initialize the carousel on component mount
  useEffect(() => {
    if (carouselRef.current) {
      const bsCarousel = new BootstrapCarousel(carouselRef.current, {
        interval: false, // disable built-in interval
        ride: false,
        touch: true,
      });

      // Manually cycle every 3 seconds
      const intervalId = setInterval(() => {
        bsCarousel.next();
      }, 8000);

      return () => clearInterval(intervalId); // cleanup on unmount
    }
  }, [products]);

  // Unique supermarkets for filter dropdown
  const supermarkets = [...new Set(products.map((product) => product.supermarket))];

  // Filtered products based on search and supermarket filter
  const filteredProducts = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(search.toLowerCase()) &&
      (supermarketFilter === "" || product.supermarket === supermarketFilter)
    );
  });

  // Top 16 deals for carousel (4 per slide)
  const topDeals = products
    .filter((product) => product.discount > 0)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 16);

  // Split into chunks of 4 for the carousel
  const chunkedDeals = [];
  for (let i = 0; i < topDeals.length; i += cardsPerSlide) {
    chunkedDeals.push(topDeals.slice(i, i + cardsPerSlide));
  }

  // Main product grid remains responsive with Bootstrap
  let productColClass;
  if (width >= 992) productColClass = "col-lg-3 col-md-4 col-6"; // 4 per row
  else if (width >= 768) productColClass = "col-md-4 col-6"; // 3 per row
  else if (width >= 403) productColClass = "col-6"; // 2 per row

  // Render product grid
  const renderProductGrid = () => {
    if (loading) {
      return <p>Loading offers...</p>;
    } else if (filteredProducts.length === 0) {
      return <p>No products found.</p>;
    } else {
      return (
        <div className="row">
          {filteredProducts.map((product) => (
            <div
              key={`${product.name}-${product.supermarket}`} // stable unique key
              className={`${productColClass} mb-4`}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-2">
          <select
            className="form-select"
            value={supermarketFilter}
            onChange={(e) => setSupermarketFilter(e.target.value)}
          >
            <option value="">All supermarkets</option>
            {supermarkets.map((supermarket) => (
              <option key={supermarket} value={supermarket}>
                {supermarket}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3 mb-2 d-flex align-items-center">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="onlyOffers"
              checked={onlyOffers}
              onChange={(e) => setOnlyOffers(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="onlyOffers">
              Show only offers
            </label>
          </div>
        </div>
        <div className="col-md-2 mb-2">
          <button className="btn btn-primary w-100" onClick={fetchOffers}>
            Refresh
          </button>
        </div>
      </div>

      {/* Top Deals Carousel */}
      {chunkedDeals.length > 0 && (
        <div className="mb-4">
          {/* Heading outside carousel */}
          <h4 className="mb-3 mt-5">🔥 Top Deals</h4>

          <div
            id="topDealsCarousel"
            ref={carouselRef}
            className="carousel slide"
          >
            <div className="carousel-inner">
              {chunkedDeals.map((group, index) => (
                <div
                  className={`carousel-item ${index === 0 ? "active" : ""}`}
                  key={`carousel-group-${group.map((product) => product.name).join("-")}`} // unique key
                >
                  <div className="row justify-content-center">
                    {group.map((product) => (
                      <div
                        className={`${productColClass} mb-4`}
                        key={`${product.name}-${product.supermarket}`} // unique key per product
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel buttons */}
            <button
              className="carousel-control-prev carousel-dark-btn"
              type="button"
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon"></span>
            </button>
            <button
              className="carousel-control-next carousel-dark-btn"
              type="button"
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon"></span>
            </button>
          </div>
        </div>
      )}

      {/* All products */}
      <h4 className=" mt-5 mb-3">🛒 All Products</h4>
      {renderProductGrid()}
    </div>
  );
}

export default ProductList;
