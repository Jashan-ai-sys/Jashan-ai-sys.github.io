import DeliveryCanvas from "./canvas/delivery";
import { PROJECTS } from "../constants";

// Works
export const Works = () => (
  <section id="work" className="max-w-7xl mx-auto px-6 sm:px-12 py-24 sm:py-32">
    <div className="flex flex-wrap items-end justify-between gap-6">
      <h2 className="text-[64px] sm:text-[88px]">Selected work</h2>
      <p className="max-w-[38ch] text-mute md:text-right">
        Systems I have built and run in production. Company names are withheld
        for confidentiality.
      </p>
    </div>

    <ol className="mt-12 border-t border-line">
      {PROJECTS.map((project, i) => (
        <li
          key={project.name}
          className="grid md:grid-cols-[72px_1fr_140px] gap-x-6 gap-y-3 py-10 border-b border-line"
        >
          <span className="font-mono text-[13px] text-mute pt-3">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="text-[44px] sm:text-[56px]">{project.name}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li key={tag} className="chip">
                  {tag}
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-[62ch] leading-7 text-mute">
              {project.description}
            </p>
          </div>
          <span className="font-mono text-[13px] text-teal md:text-right md:pt-3">
            {project.kind}
          </span>
        </li>
      ))}
    </ol>

    <figure className="studio relative mt-16 h-[320px] sm:h-[420px] border border-line">
      <DeliveryCanvas />
      <figcaption className="label-box absolute left-4 bottom-4">
        Delivery follow-up: the truck, the door, the parcel
      </figcaption>
    </figure>
  </section>
);
