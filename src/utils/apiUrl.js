import { createApp } from "vue";

createApp({
  name: "apiUrl",
});

const data = [
  {
    method: ["flickr.people.getPublicPhotos", "flickr.people.findByUsername"],
    url: "https://api.flickr.com/services",
    endpoint: "/rest",
    params: [
      {
        extras: ["url_z", "url_o", "tags", "date_taken", "owner_name"],
        per_page: "12",
        format: "json",
        nojsoncallback: "1",
      },
    ],
  },
];

export default data;
