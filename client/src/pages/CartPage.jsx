import Layout from "../components/Layout/Layout";
import { useCart } from "../context/Cart";
import { useAuth } from "../context/Auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { dropin } from "braintree";

const CartPage = () => {
  const [sum, setSum] = useState(0);

  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  const [clientToken, setClientToken] = useState("");
  const [instance, setInstance] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showDropIn, setShowDropIn] = useState(false);

  // Function to handle the button click and display DropIn
  const handleDropInDisplay = () => {
    if (clientToken) {
      setShowDropIn(true); // Set showDropIn to true to display DropIn
    } else {
      // If clientToken is not available, fetch it
      getToken();
    }
  };

  //remove from cart
  const removeItem = (id) => {
    try {
      setCart((prev) => {
        return prev.filter((prod) => prod._id !== id);
      });
      toast.success("Item removed successfully!");
    } catch (error) {
      console.log(error);
    }
  };

  //total sum
  const totalPrice = () => {
    let total = 0;
    cart.forEach((item) => {
      total += item.price;
    });
    setSum(total);
  };

  useEffect(() => {
    totalPrice();
  }, []);

  //get payment gateway token
  const getToken = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API}/api/v1/product/braintree/token`
      );
      setClientToken(data?.clientToken);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getToken();
  }, [auth?.token]);

  //handle Payment
  const handlePayment = () => {};

  return (
    <Layout>
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h1 className="text-center bg-light p-2 m-2 w-100 ">
              {`Hello ${auth?.token && auth.token ? auth?.user?.name : ""}`}
            </h1>
            <h4 className="text-center">
              {cart?.length
                ? `You Have ${cart?.length} items in your cart ${
                    auth?.token ? "" : "Please Login to Checkout!"
                  }`
                : "Your Cart is Empty!"}
            </h4>
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">
            <div className="row">
              {cart?.map((p) => (
                <div
                  className="row mb-2 p-3 card flex-row"
                  key={crypto.randomUUID()}
                >
                  <div className="col-md-4">
                    <img
                      src={`${
                        import.meta.env.VITE_API
                      }/api/v1/product/product-photo/${p?._id}`}
                      className="card-img-top img-fluid"
                      alt={p?.name}
                      width={"100px"}
                      height="100px"
                    />
                  </div>
                  <div className="col-md-4">
                    <p>{p?.name}</p>
                    <p>{p?.description?.substring(0, 30)}</p>
                    <h4>{p?.price}$</h4>
                    <button
                      className="btn btn-danger"
                      onClick={() => removeItem(p._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-md-3 text-center">
            <h2>Cart Summary</h2>
            <p>Toal | Checkout | Payment</p>
            <hr />
            <h4>Total : {sum} $</h4>
            {auth?.user?.address ? (
              <>
                <div className="mb-3">
                  <h4>Current Address</h4>
                  <h5>{auth?.user?.address}</h5>
                  <button
                    className="btn btn-outline-warning"
                    onClick={() => navigate("/dashboard/user/profile")}
                  >
                    Update Address
                  </button>
                </div>
              </>
            ) : (
              <div className="mb-3">
                {auth?.token ? (
                  <button
                    onClick={() => navigate("/dashboard/user/profile")}
                    className="btn btn-outline-warning"
                  >
                    Update Address
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      navigate("/login", {
                        state: "/cart",
                      })
                    }
                    className="btn btn-outline-warning"
                  >
                    Please Login To Checkout
                  </button>
                )}
              </div>
            )}
            <div className="mt-2">
              {showDropIn && clientToken && (
                <DropIn
                  options={{
                    authorization: clientToken,
                    paypal: {
                      flow: "vault",
                    },
                  }}
                  onInstance={(instance) => setInstance(instance)}
                />
              )}
              <button
                className="btn btn-primary mb-2"
                onClick={handleDropInDisplay}
              >
                {showDropIn ? (
                  <div onClick={() => setShowDropIn(!dropin)}>
                    Hide Payment Form
                  </div>
                ) : (
                  <div>Show Payment Form</div>
                )}
              </button>
              <br />
              <button className="btn btn-primary" onClick={handlePayment}>
                Make Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
