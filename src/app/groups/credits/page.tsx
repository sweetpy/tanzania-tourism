import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Group trip photographs | Boker Adventures",
  alternates: { canonical: "/groups/credits" },
};
const photographs = [
  {
    title: "Kilimanjaro seen from Moshi",
    author: "Lebu Ayiga",
    file: "kilimanjaro.jpg",
    source: "Moshi_facing_Mt.Kilimanjaro.jpg",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  },
  {
    title: "Mount Meru seen from Arusha",
    author: "Phase9",
    file: "meru.jpg",
    source: "Look_at_Mt._Meru_Arusha_Tanzania.jpg",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
  {
    title: "Lake Manyara from the Rift Valley rim",
    author: "Clem23",
    file: "manyara.jpg",
    source: "Lake_Manyara.jpg",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
  {
    title: "Serengeti landscape",
    author: "Bjørn Christian Tørrissen",
    file: "serengeti.jpg",
    source: "Serengeti-Landscape-2012.JPG",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
];
export default function GroupCredits() {
  return (
    <main className="group-width group-private-page">
      <p className="group-eyebrow">The places behind the photographs</p>
      <h1>Photographs and credits</h1>
      <p>
        The calendar uses photographs of real places in northern Tanzania.
        Regional images set the scene; they do not identify a particular
        departure’s accommodation or promised wildlife sightings.
      </p>
      <div className="group-trip-grid">
        {photographs.map((photo) => (
          <article key={photo.file} className="group-enrol-card">
            <h2>{photo.title}</h2>
            <p>Photograph by {photo.author}.</p>
            <p>
              <a
                href={`https://commons.wikimedia.org/wiki/File:${photo.source}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Original photograph and source
              </a>
            </p>
            <p>
              <a
                href={photo.licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {photo.license}
              </a>
              . Hosted copies retain this licence. The site resizes and crops
              the display to fit cards and banners; these displayed versions
              retain the same licence.
            </p>
            <a href={`/images/groups/${photo.file}`} download>
              Download the original hosted photograph
            </a>
          </article>
        ))}
      </div>
      <p>
        <Link href="/groups">Return to the departure calendar ↗</Link>
      </p>
    </main>
  );
}
