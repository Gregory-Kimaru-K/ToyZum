import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryContext from '../../Context/CategoryContext';
import "swiper/swiper-bundle.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import backendurl from '../../constants/constants';

function PromotionComp() {
  const navigate = useNavigate();
  const { getCategories, categories } = useContext(CategoryContext);
  const [mainAdverts, setMainAdverts] = useState([]);
  const [sideAdverts, setSideAdverts] = useState([])
  const swiperRef = useRef(null);

  useEffect(() => {
    if (categories.length === 0) getCategories();
  }, [categories, getCategories]);

  useEffect(() => {
    const getAdverts = async () => {
      try {
        const response = await fetch(`${backendurl}advert/`);
        if (response.status === 200) {
          const data = await response.json();
          const main = data.filter(ad => ad.place === "MAIN");
          const side = data.filter(ad => ad.place === "SIDE")
          setMainAdverts(main);
          setSideAdverts(side)
        }
      } catch (err) {
        alert(err instanceof Error ? JSON.stringify(err) : "Network Error");
      }
    };
    getAdverts();
  }, []);

  // When slides load/update, make sure Swiper updates and autoplay starts
  useEffect(() => {
    const s = swiperRef.current;
    if (s) {
      // update so Swiper recognizes new slides
      if (typeof s.update === "function") s.update();
      // restart autoplay
      if (s.autoplay && typeof s.autoplay.start === "function") s.autoplay.start();
    }
  }, [mainAdverts.length]);

  const renderAdvert = (advert) => {
    const commonStyle = { width: "100%", height: "auto", objectFit: "cover" };
    if (!advert) return null;

    if (advert.file_type?.startsWith("image/")) {
      return <img src={advert.image} alt={advert.slug || "ad"} style={{width: "100%", height: "100%"}} />;
    } else if (advert.file_type?.startsWith("video/")) {
      return (
        <video
          src={advert.image}
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          style={commonStyle}
        />
      );
    }
    return null;
  };

    const renderSideAdvert = (advert) => {
    if (!advert) return null;

    if (advert.file_type?.startsWith("image/")) {
      return <img src={advert.image} alt={advert.slug || "ad"} />;
    } else if (advert.file_type?.startsWith("video/")) {
      return (
        <video
          src={advert.image}
          autoPlay
          muted
          loop
          playsInline
          controls={false}
        />
      );
    }
    return null;
  };

  return (
    <div className="prom">
      <div className="prom-cat">
        {categories.map((category, idx) => (
          <div
            className="cat"
            key={category.id ?? idx}
            onClick={() => navigate(`/home/products/`, { state: { categoryId: category.id } })}
          >
            <p>{category.name}</p>
          </div>
        ))}
      </div>

      <div className="trending-prod" id="trending_prod">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            // ensure autoplay starts immediately if slides already present
            if (swiper.autoplay && typeof swiper.autoplay.start === "function") swiper.autoplay.start();
          }}
          observer={true}            // observe DOM changes
          observeParents={true}      // observe parent changes
          spaceBetween={50}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: 7000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          pagination={{
            clickable: true,
            renderBullet: (index, className) => {
              const advert = mainAdverts[index];
              if (!advert) {
                return `<span class="${className}" style="width:40px;height:40px;background:#ccc;border-radius:8px;display:inline-block;margin:0 5px;"></span>`;
              }

              // if it's an image
              if (advert.file_type?.startsWith("image/")) {
                return `
                  <span class="${className}" style="width:72px;height:72px;display:inline-block;margin:0 5px;border-radius:8px;overflow:hidden;">
                    <img src="${advert.image}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />
                  </span>
                `;
              }

              // if it's a video
              if (advert.file_type?.startsWith("video/")) {
                return `
                  <span class="${className}" style="width:72px;height:72px;display:inline-block;margin:0 5px;border-radius:8px;overflow:hidden;">
                    <video src="${advert.image}" muted autoplay loop playsinline style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></video>
                  </span>
                `;
              }

              // fallback
              return `<span class="${className}" style="width:40px;height:40px;background:#ccc;border-radius:8px;display:inline-block;margin:0 5px;"></span>`;
            },
          }}

          modules={[Navigation, Pagination, Autoplay]}
          className='swipe'
        >
          {mainAdverts && mainAdverts.length > 0 ? (
            mainAdverts.map((advert, idx) => (
              <SwiperSlide key={advert.id ?? idx}>
                {renderAdvert(advert)}
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide key="no-ad">No Adverts</SwiperSlide>
          )}
        </Swiper>
      </div>
      <div className='quick-sale'>
        {sideAdverts.map((advert, idx) => (
            <div className='side_adverts'>
                {renderSideAdvert(advert)}
                <button onClick={() => {
                    if (advert.url.startsWith("http")) {
                        const relativePath = new URL(advert.url).pathname;
                        navigate(relativePath)
                    } else{
                        navigate(advert.url)
                    }
                    }}>
                </button>
            </div>
        ))}
      </div>
    </div>
  );
}

export default PromotionComp;
