import { ref } from "vue";
const api_key = import.meta.env.VITE_API_KEY;

const data = ref(Object);

async function fetchData(apiParams) {
  // Construct the base URL with the API key
  let url = `https://api.flickr.com/services/rest?api_key=${api_key}&format=json&nojsoncallback=1`;
  
  // Append each parameter in `apiParams` to the URL
  if (apiParams && typeof apiParams === 'object') {
    const queryParams = new URLSearchParams(apiParams).toString();
    url += `&${queryParams}`;
  }  

  try {
    const res = await fetch(url, { method: "get" });
    data.value = res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  return data.value
}

export default fetchData;
