const axios = require("axios");

async function test() {
  try {
    //const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGVJZCI6MSwiaWF0IjoxNzc1ODY0ODE2LCJleHAiOjE3NzU4NjU3MTZ9.fplAtKHAO7NMWEnywlC4f2ClSK7LOsx1qB8ml8OdTZI"; // ⚠️ usa la misma del .env del backend
    
    const API_KEY = "SUPER_SECRET_KEY_FOR_INTERNAL_USE_ONLY"; // ⚠️ usa la misma del .env del backend

    //const phone = encodeURIComponent("+506 2563-2562");
    const phone = encodeURIComponent("+506 6038-4406");
    const encoded = encodeURIComponent("Tres Marías");

    const url = `https://monterosgas.com/bck/api/customers/by-phone/${phone}`;

    const productListUrl = 'https://monterosgas.com/bck/api/products/list-products-whatsapp';

    const productDetailUrl = `https://monterosgas.com/bck/api/places/placeID-whatsapp/${encoded}`;

    
    console.log("➡️ URL:", productDetailUrl);

    const res = await axios.get(productDetailUrl, {
      headers: {
        "x-api-key": API_KEY,
      },
      timeout: 8000,
    });

    console.log("✅ STATUS:", res.status);
    console.log("📦 DATA:", res.data);

  } catch (error) {
    console.error("❌ ERROR STATUS:", error.response?.status);
    console.error("❌ ERROR DATA:", error.response?.data);
    console.error("❌ HEADERS ENVIADOS:", error.config?.headers);
  }
}

test();