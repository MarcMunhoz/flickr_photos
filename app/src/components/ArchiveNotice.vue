<template>
  <main class="archive-page" aria-labelledby="archive-title">
    <section class="archive-hero">
      <div class="archive-copy">
        <p class="archive-kicker">Public archive</p>
        <h1 id="archive-title">Flickr Photos is archived</h1>
        <p class="archive-lede">
          This public gallery has been retired because Flickr media delivery
          became too unreliable for a real-time photo browsing experience.
        </p>
        <p>
          The API can still return metadata, but the corresponding public image
          files may arrive late, fail, or remain unavailable long enough to make
          search results misleading. Keeping a broken gallery online would be
          less honest than preserving the project as a technical record.
        </p>
        <a
          class="archive-link"
          href="https://github.com/MarcMunhoz/flickr_photos"
          rel="noopener noreferrer"
          target="_blank"
        >
          View source repository
        </a>
      </div>

      <div class="archive-light-table" aria-hidden="true">
        <span class="film-strip strip-blue"></span>
        <span class="film-strip strip-pink"></span>
        <span class="film-frame frame-one"></span>
        <span class="film-frame frame-two"></span>
        <span class="film-frame frame-three"></span>
      </div>
    </section>
  </main>
</template>

<script>
export default {
  name: "ArchiveNotice",
};
</script>

<style scoped>
.archive-page {
  min-height: calc(100vh - 68px);
  padding: clamp(2rem, 6vw, 5rem);
  background:
    linear-gradient(135deg, rgba(4, 98, 220, 0.08), transparent 34%),
    linear-gradient(315deg, rgba(255, 0, 132, 0.08), transparent 30%),
    #f8fafc;
  color: #1f2b3a;
}

.archive-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.82fr);
  align-items: center;
  gap: clamp(2rem, 6vw, 5rem);
  width: min(1180px, 100%);
  margin: 0 auto;
  text-align: left;
}

.archive-copy {
  max-width: 650px;
}

.archive-kicker {
  margin: 0 0 0.9rem;
  color: #0462dc;
  font-family: system-ui, sans-serif;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.archive-copy h1 {
  margin: 0;
  color: #172131;
  font-size: clamp(3rem, 8vw, 6.5rem);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 0.92;
}

.archive-lede {
  margin-top: 1.5rem;
  color: #2b3747;
  font-family: system-ui, sans-serif;
  font-size: clamp(1.15rem, 2vw, 1.45rem);
  font-weight: 650;
  line-height: 1.5;
}

.archive-copy p:not(.archive-kicker):not(.archive-lede) {
  color: #536173;
  font-family: system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.8;
}

.archive-link {
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  margin-top: 1.25rem;
  padding: 0 1.1rem;
  border: 2px solid #0462dc;
  border-radius: 6px;
  color: #0462dc;
  font-family: system-ui, sans-serif;
  font-weight: 800;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.archive-link:hover,
.archive-link:focus-visible {
  background: #0462dc;
  color: white;
  transform: translateY(-2px);
}

.archive-light-table {
  position: relative;
  min-height: 520px;
  border: 1px solid #dde4ee;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.78) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.78) 1px, transparent 1px),
    linear-gradient(135deg, #eef4fb, #ffffff);
  background-size: 36px 36px, 36px 36px, auto;
  box-shadow: 0 28px 70px rgba(33, 43, 58, 0.14);
  overflow: hidden;
}

.film-strip {
  position: absolute;
  display: block;
  width: 78%;
  height: 74px;
  border: 2px solid currentColor;
  opacity: 0.7;
}

.strip-blue {
  top: 94px;
  left: -14%;
  color: #0462dc;
  transform: rotate(-16deg);
}

.strip-pink {
  right: -22%;
  bottom: 112px;
  color: #ff0084;
  transform: rotate(-16deg);
}

.film-frame {
  position: absolute;
  display: block;
  border: 2px solid #cfd8e5;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 0 0 12px rgba(248, 250, 252, 0.88);
}

.frame-one {
  top: 150px;
  left: 12%;
  width: 42%;
  aspect-ratio: 4 / 3;
}

.frame-two {
  right: 10%;
  bottom: 92px;
  width: 34%;
  aspect-ratio: 3 / 4;
}

.frame-three {
  right: 18%;
  top: 78px;
  width: 24%;
  aspect-ratio: 1;
}

@media (max-width: 900px) {
  .archive-hero {
    grid-template-columns: 1fr;
  }

  .archive-light-table {
    min-height: 340px;
  }
}
</style>
