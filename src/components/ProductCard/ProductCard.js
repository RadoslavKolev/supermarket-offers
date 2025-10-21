import React from "react";
import PropTypes from "prop-types";
import "./ProductCard.css";

ProductCard.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string.isRequired,        // product name
    quantity: PropTypes.string,               // quantity is always string in API
    price: PropTypes.number.isRequired,       // price is a number
    oldPrice: PropTypes.number,               // oldPrice is a number, optional
    discount: PropTypes.number,               // discount we calculate, optional
    category: PropTypes.string,               // category from API
    picUrl: PropTypes.string,                 // image URL
    supermarket: PropTypes.string.isRequired, // supermarket name
    validFrom: PropTypes.string,              // optional validity start
    validUntil: PropTypes.string              // optional validity end
  }).isRequired
};

function ProductCard({ product }) {
  const isDeal = product.discount > 0;

  return (
    <div className={`card h-100 shadow-sm ${isDeal ? "border-success" : ""}`}>
      {product.picUrl && (
        <img src={product.picUrl} className="card-img-top" alt={product.name} />
      )}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name}</h5>

        <p className="card-text mb-1">
          {isDeal ? (
            <>
              <strong className="text-danger fs-5">{product.price} лв</strong>{" "}
              <span className="text-muted text-decoration-line-through">{product.oldPrice} лв</span>
            </>
          ) : (
            <strong>{product.price} лв.</strong>
          )}
        </p>

        {isDeal && (
          <>
            <span className="badge bg-danger mb-2">-{product.discount}%</span>
            <div className="mb-2">
              <progress
                value={product.discount}
                max="100"
                className="w-100"
                style={{
                  height: "12px",
                  accentColor: "green", // changes the color of the bar in most modern browsers
                }}
                aria-label={`Discount progress: ${product.discount}%`}
              ></progress>
            </div>
          </>
        )}

        {product.quantity && <p className="card-text text-secondary">{product.quantity}</p>}
        <p className="card-text text-secondary mt-auto">Supermarket: {product.supermarket}</p>
      </div>
    </div>
  );
}

export default ProductCard;
