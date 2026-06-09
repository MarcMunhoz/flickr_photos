<template>
  <div
    class="flickr py-3 d-flex flex-row flex-wrap justify-content-around mx-auto w-75"
    :class="{ 'is-empty': photos.length === 0 && !error }"
  >
    <p v-if="error" class="text-danger w-100">{{ error }}</p>

    <div class="spinner text-info w-100 visually-hidden">
      <div class="spinner-border" role="status" />
      <p class="fw-bold">Loading... Please wait.</p>
    </div>

    <div class="gallery d-flex flex-row flex-wrap justify-content-around mx-auto">
      <section v-if="photos.length === 0 && !error" class="home-empty-state">
        <div class="home-empty-content">
          <span class="home-empty-eyebrow">Explore Flickr</span>
          <h2>Discover public photography</h2>
          <p>
            Search for a Flickr username above to browse their public gallery,
            or jump straight into the latest public photos.
          </p>

          <div class="home-empty-actions">
            <span class="search-hint">Use the search field in the header</span>
            <router-link to="/recent-photos" class="recent-photos-link">
              Explore recent photos
            </router-link>
          </div>
        </div>

        <div class="home-feature-grid">
          <article>
            <span class="feature-number">01</span>
            <h3>Search photographers</h3>
            <p>Find public galleries using a Flickr username.</p>
          </article>
          <article>
            <span class="feature-number">02</span>
            <h3>Browse details</h3>
            <p>View titles, tags, dates and links to original photos.</p>
          </article>
          <article>
            <span class="feature-number">03</span>
            <h3>See what is new</h3>
            <p>Explore recent public uploads with useful filters.</p>
          </article>
        </div>
      </section>

      <div class="w-100" v-if="photos.length > 0">
        <h1>
          Photos by <span class="text-success fw-bolder">{{ photos_owner }}</span> on Flickr - Page {{ nextPage }} of {{ totalPages }}
        </h1>
        <p class="fw-bold w-100" v-if="photos[0].url_o">
          *** Gallery with links ***<br />
          Click on photo to open original
        </p>
      </div>
      <ul class="d-flex flex-row flex-wrap align-items-end justify-content-center gap-1">
        <li v-for="photo in photos" :key="photo.id">
          <h3 v-if="photo.title" class="mb-2 text-ellipsis">{{ photo.title }}</h3>
          <h3 v-else class="mb-2 fs-4 text-decoration-line-through text-muted">Untitled</h3>
          <a :href="photo.url_o" target="_photo" @mouseover="bordered(true, $event.target, photo.url_o)" @mouseleave="bordered(false, $event.target, photo.url_o)">
            <img :src="photo.url_z" :title="photo.title" lazy="loading" class="border-4 border-unicorn mw-100" />
          </a>
          <cite v-if="photo.tags.length > 0" class="d-block px-2 simple-font fst-normal text-ellipsis"><span class="fw-bold">Tags:</span> {{ photo.tags }}</cite>
          <cite class="d-block px-2 simple-font fst-normal"><span class="fw-bold">Date</span>: {{ theDate(photo.datetaken) }}</cite>
        </li>
      </ul>
      <button v-if="nextPage > 1 && photos.length > 0" @click="mountExec('down')" class="btn btn-primary simple-font fw-bold">Page [ {{ nextPage - 1 }} ]</button>
      <button v-if="nextPage < totalPages && photos.length > 0" @click="mountExec('up')" class="btn btn-primary simple-font fw-bold">Page [ {{ nextPage + 1 }} ]</button>
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import { on, fetchData, theDate, bordered } from "@/utils/usefulFunctions.js";

export default defineComponent({
  name: "FlickrPhotos",
  setup() {
    const photos = ref(Array);
    const user_id = ref(String);
    const photos_owner = ref(String);
    const totalPages = ref(Number);
    const nextPage = ref(null);
    const error = ref(String);
    const spinner = ref(null);

    photos.value = [];
    photos_owner.value = "";
    totalPages.value = 1;
    error.value = "";

    const emittedUserId = (userId) => {
      user_id.value = userId;
      nextPage.value = 1;
      error.value = "";

      return pageMount();
    };

    const pageMount = async () => {
      let rawData = Object;
      photos.value = [];

      const fetchParams = {
        method: "flickr.people.getPublicPhotos",
        extras: ["url_z", "url_o", "tags", "date_taken", "owner_name"],
        page: nextPage.value,
        per_page: "12",
        user_id: user_id.value,
      };

      try {
        rawData = await fetchData(fetchParams);

        error.value = null;
        spinner.value.classList.add("visually-hidden");
        document.querySelector(".gallery").classList.remove("visually-hidden");
      } catch (err) {
        // Cleaning up the old gallery data from app
        photos.value = "";

        // Errors handling
        if (err == "TypeError: Cannot read property 'ownername' of undefined") {
          return (error.value = "Invalid username. Please, check it out.");
        } else {
          return (error.value = err);
        }
      }

      if (rawData.photos.total > 0) {
        totalPages.value = rawData.photos.pages;
        photos_owner.value = rawData.photos.photo[0].ownername;

        for (let index = 0; index < rawData.photos.photo.length; index++) {
          photos.value.push(rawData.photos.photo[index]); // It populates the array with all photos comin' from API data
        }
      } else {
        return (error.value = "This user doesn't have any public photos.");
      }
    };

    const mountExec = (upDown) => {
      // Cleaning up the old gallery data from app and executing next/prev page action
      photos.value = [];
      upDown === "down" ? (nextPage.value = nextPage.value - 1) : (nextPage.value = nextPage.value + 1);
      pageMount();
    };

    onMounted(() => {
      spinner.value = document.querySelector(".flickr .spinner");

      on("userID", (userId) => {
        emittedUserId(userId);
      });
    });

    return {
      emittedUserId,
      bordered,
      mountExec,
      theDate,
      error,
      photos,
      photos_owner,
      nextPage,
      totalPages,
    };
  },
});
</script>

<style scoped lang="less">
h3 {
  margin: 40px 0 0;
  min-height: 36px;

  @media @sm-screens {
    min-height: 28px;
  }
}

.gallery {
  width: 100%;

  @media @sm-screens {
    width: 100%;
  }
}

.home-empty-state {
  width: 100%;
  margin: 0.75rem auto;
  color: #263241;
  font-family: Arial, Helvetica, sans-serif;
  text-align: left;
}

.home-empty-content {
  position: relative;
  overflow: hidden;
  padding: clamp(1.75rem, 4vw, 3rem);
  background:
    radial-gradient(circle at 85% 20%, rgba(255, 0, 132, 0.16), transparent 28%),
    radial-gradient(circle at 70% 85%, rgba(4, 98, 220, 0.18), transparent 30%),
    linear-gradient(135deg, #f7faff 0%, #fff 55%, #fff5fa 100%);
  border: 1px solid #e1e7f0;
  border-radius: 22px;
  box-shadow: 0 24px 60px rgba(39, 53, 76, 0.12);
}

.home-empty-content::after {
  position: absolute;
  right: -55px;
  bottom: -70px;
  width: 220px;
  height: 220px;
  border: 34px solid rgba(81, 70, 216, 0.08);
  border-radius: 50%;
  content: "";
}

.home-empty-eyebrow {
  display: block;
  margin-bottom: 0.75rem;
  color: #0462dc;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.home-empty-content h2 {
  max-width: 720px;
  margin: 0 0 1rem;
  color: #25304a;
  font-size: clamp(2rem, 4vw, 3.25rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
}

.home-empty-content p {
  max-width: 650px;
  margin: 0;
  color: #697386;
  font-size: clamp(1rem, 2vw, 1.15rem);
  line-height: 1.7;
}

.home-empty-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.search-hint {
  color: #687386;
  font-size: 0.85rem;
  font-weight: 600;
}

.recent-photos-link {
  position: relative;
  z-index: 1;
  padding: 0.75rem 1rem;
  background: linear-gradient(90deg, #0462dc, #5146d8);
  border-radius: 10px;
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recent-photos-link:hover {
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(81, 70, 216, 0.24);
}

.home-feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.home-feature-grid article {
  padding: 1rem 1.25rem;
  background: white;
  border: 1px solid #e5e9f0;
  border-radius: 14px;
}

.feature-number {
  color: #d51a8c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.home-feature-grid h3 {
  min-height: 0;
  margin: 0.65rem 0 0.45rem;
  color: #2e3748;
  font-size: 1rem;
  font-weight: 700;
}

.home-feature-grid p {
  margin: 0;
  color: #77808f;
  font-size: 0.85rem;
  line-height: 1.5;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;

  li {
    display: inline-block;
    min-height: 436px;
    width: 473px;
  }

  @media @sm-screens {
    width: 100%;

    li {
      min-height: unset;
      width: 100%;
    }
  }
}

.simple-font {
  font-family: Avenir, Helvetica !important;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flickr {
  &.is-empty {
    min-height: calc(100vh - 68px);
    align-content: center;
  }

  img {
    height: 305px;
    object-fit: cover;
    transition: transform 0.5s ease;
    width: 100%;

    &:hover {
      transform: scale(1.1);
    }
  }

  .spinner-border {
    height: 10rem;
    width: 10rem;
  }

  @media @sm-screens {
    &.is-empty {
      min-height: auto;
      align-content: initial;
    }

    .home-empty-state {
      margin: 1rem auto;
      padding: 0 0.75rem;
    }

    .home-empty-content {
      padding: 2rem 1.25rem;
      border-radius: 16px;
    }

    .home-empty-actions {
      align-items: stretch;
      flex-direction: column;
    }

    .recent-photos-link {
      text-align: center;
    }

    .home-feature-grid {
      grid-template-columns: 1fr;
    }

    &.w-75 {
      width: 100% !important;
    }
  }
}
</style>
