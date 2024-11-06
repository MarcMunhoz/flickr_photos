import { ref } from "vue";
const api_key = import.meta.env.VITE_API_KEY;

const data = ref(Object);

async function fetchData(apiParams) {
  let url = `https://api.flickr.com/services/rest?api_key=${api_key}&format=json&nojsoncallback=1`;

  if (apiParams && typeof apiParams === 'object') {
    const queryParams = new URLSearchParams(apiParams).toString();
    url += `&${queryParams}`;
  }  

  try {
    const res = await fetch(url, { method: "get" });
    data.value = await res.json();  // Await the response JSON
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  return data.value;
}

function theDate(dte) {
  const date = new Date(dte);
  const opt = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleString("en-US", opt);
}

function bordered (state, target = null, url = null)  {
  if (state && target && url) {
    target.classList.add("border");
  } else if (!state && target && url) {
    target.firstElementChild.classList.remove("border");
  }
};

// Export each function as a named export
export { fetchData, theDate, bordered };