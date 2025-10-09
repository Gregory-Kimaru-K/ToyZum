import React, { useState } from "react"

function LocationOrder({setOrderLocation}) {
  const [location, setLocation] = useState({
    latitude: -1.2921,
    longitude: 36.8219
  })
  const [step, setStep] = useState(1)
  const [deliveryOptions, setDeliveryOptions] = useState()

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to fetch your location. Please enable location services.")
        }
      )
    } else {
      alert("Geolocation is not supported by your browser.")
    }
  }

  return (
    <div className="order_container">
      {step === 1 && (
        <div className="cont_del">
          <div className='cancel' onClick={() => setOrderLocation(false)}>
              <div></div>
              <div></div>
          </div>
          <h2>CHOOSE DELIVERY OPTIONS</h2>
          <div className="del_options">
            <p onClick={() => setDeliveryOptions("PICKUP")}>
              <div className="selector">
                <div 
                  className={deliveryOptions === "PICKUP" ? 
                    "inner active" :
                    "inner"}>
                </div>
              </div>
              Pickup
            </p>
            <p onClick={() => setDeliveryOptions("DOORSTEP")}>
              <div className="selector">
                <div 
                  className={deliveryOptions === "DOORSTEP" ? 
                    "inner active" :
                    "inner"}></div>
              </div>
              Door-Step Delivery
            </p>
            <p onClick={() => setDeliveryOptions("COMMUNICATE")}>
              <div className="selector">
                <div 
                  className={deliveryOptions === "COMMUNICATE" ? 
                    "inner active" :
                    "inner"}></div>
              </div>
              Comunicate with seller
            </p>
          </div>
          <button onClick={() => setStep(2)}>
            Next
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="cont">
          <ion-icon id="my_location" onClick={getUserLocation} name="locate-outline"></ion-icon>
          <iframe
            title="Google Maps"
            src={`https://www.google.com/maps?q=${location.latitude},${location.longitude}&hl=es;z=14&output=embed`}
            width="100%"
            height="88%"
            style={{
              border: "none",
              filter: "invert(90%) hue-rotate(180deg)",
            }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
          <button>
            Create Order
          </button>
        </div>
      )}
    </div>
  )
}

export default LocationOrder
