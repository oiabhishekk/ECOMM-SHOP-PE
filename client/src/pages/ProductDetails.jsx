import { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/Cart";
import { toast } from "react-toastify";

const ProductDetails = () => {
  const [product, setProduct] = useState({});
  const params = useParams();
  const [relatedProducts, setRelatedProducts] = useState([]);
  //Cart
  const [cart, setCart] = useCart();

  const { slug } = params;

  const getProduct = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/product/get-product/${slug}`
      );
      setProduct(data?.product);
      getSimilarProduct(data?.product?._id, data?.product?.category?._id);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (params?.slug) {
      getProduct();
    }
  }, [params.slug]);

  //get similar product (USED ABOVE INSIDE GETPRODUCT)
  const getSimilarProduct = async (pid, cid) => {
    try {
      const { data } = await axios.get(
        `${
          import.meta.env.VITE_API
        }/api/v1/product/related-product/${pid}/${cid}`
      );
      setRelatedProducts(data?.products);
    } catch (error) {
      console.log(error);
    }
  };

  //Add to Cart
  const addToCart = (prod) => {
    setCart((prev) => {
      return [...prev, prod];
    });
    toast.success("Product Added to Cart");
  };

  return (
    <Layout>
      <div className="row container mt-2">
        <div className="col-md-6">
          <img
            src={`${import.meta.env.VITE_API}/api/v1/product/product-photo/${
              product?._id
            }`}
            height="300"
            width={"350px"}
            className="card-img-top img-fluid"
            alt={product?.name}
          />
        </div>
        <div className="col-md-6 ">
          <h1 className="text-center">Product details</h1>
          <h6>Name: {product?.name}</h6>
          <h6>Description: {product?.description}</h6>
          <h6>Price: {product?.price}</h6>
          <h6>Category: {product?.category?.name}</h6>
          <button
            className="btn btn-secondary ms-1"
            onClick={() => addToCart(product?._id)}
          >
            Add to cart
          </button>
        </div>
      </div>
      <hr />
      <div className="row m-2 container">
        <h5>Similar Product</h5>
        {relatedProducts.length < 1 && (
          <p className="text-center">No Similar products Found</p>
        )}
        {relatedProducts?.map((p) => (
          <div key={p._id} className="card m-2" style={{ width: "18rem" }}>
            <img
              src={`${import.meta.env.VITE_API}/api/v1/product/product-photo/${
                p._id
              }`}
              className="card-img-top img-fluid"
              alt={p.name}
            />
            <div className="card-body">
              <h5 className="card-title">{p.name}</h5>
              <p className="card-text">{p.description.substring(0, 30)}</p>
              <p className="card-text">${p.price}</p>
              <button
                className="btn btn-secondary ms-1"
                onClick={() => addToCart(p)}
              >
                Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default ProductDetails;
