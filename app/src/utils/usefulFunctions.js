import { ref, reactive, watch } from "vue";

const evtBus = reactive({})
const data = ref(Object);

export function emit(evtName, payload) {
  evtBus[evtName] = payload
}

export function on(evtName, callback) {
  watch(() => evtBus[evtName], newValue => {
    if (newValue !== undefined) {
      callback(newValue)
    }
  })
}

async function fetchData(apiParams) {
  const API_BASE_URL = import.meta.env.PROD
    ? 'https://flickr-public-photos.onrender.com'
    : '/api';

  let url = `${API_BASE_URL}/flickr`;

  if (apiParams && typeof apiParams === 'object') {
    const queryParams = new URLSearchParams(apiParams).toString();
    url += `?${queryParams}`;
  }

  const res = await fetch(url);
  const data = await res.json();
  return data;
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
export default { emit, on }