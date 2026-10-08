import { Suspense, lazy } from "react";

import { OPEN_PROJECTS, PROJECTS } from "../constants";

const DeliveryCanvas = lazy(() => import("./canvas/delivery"));

type ProjectRowProps = {
  index: number;
  name: string;
  tags: readonly string[];
  description: string;
  aside: React.ReactNode;
};

const ProjectRow = ({ index, name, tags, description, aside }: ProjectRowProps) => (
  <li className="grid md:grid-cols-[72px_1fr_140px] gap-x-6 gap-y-3 py-10 border-b border-line">
    <span className="font-mono text-[13px] text-mute pt-3">
      {String(index + 1).padStart(2, "0")}
    </span>
    <div>
      <h3 className="text-[44px] sm:text-[56px]">{name}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li key={tag} className="chip">
            {tag}
          </li>
        ))}
      </ul>
      <p className="mt-4 max-w-[62ch] leading-7 text-mute">{description}</p>
    </div>
    <div className="font-mono text-[13px] md:text-right md:pt-3">{aside}</div>
  </li>
);

const LINK_CLASS = "text-teal underline underline-offset-4 hover:no-underline";

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
        <ProjectRow
          key={project.name}
          index={i}
          name={project.name}
          tags={project.tags}
          description={project.description}
          aside={<span className="text-teal">{project.kind}</span>}
        />
      ))}
    </ol>

    <figure className="studio relative mt-16 h-[320px] sm:h-[420px] border border-line">
      <Suspense fallback={null}>
        <DeliveryCanvas />
      </Suspense>
      <figcaption className="label-box absolute left-4 bottom-4">
        Delivery follow-up: the truck, the door, the parcel
      </figcaption>
    </figure>

    <div className="mt-28 flex flex-wrap items-end justify-between gap-6">
      <h2 className="text-[64px] sm:text-[88px]">Open projects</h2>
      <p className="max-w-[38ch] text-mute md:text-right">
        Projects I built on my own time, mostly for hackathons. The code is
        public, so you can read exactly how they work.
      </p>
    </div>

    <ol className="mt-12 border-t border-line">
      {OPEN_PROJECTS.map((project, i) => (
        <ProjectRow
          key={project.name}
          index={i}
          name={project.name}
          tags={project.tags}
          description={project.description}
          aside={
            <ul className="flex md:flex-col gap-x-6 gap-y-2">
              <li>
                <a href={project.code} target="_blank" rel="noreferrer noopener" className={LINK_CLASS}>
                  Code
                </a>
              </li>
              {project.demo && (
                <li>
                  <a href={project.demo} target="_blank" rel="noreferrer noopener" className={LINK_CLASS}>
                    Live demo
                  </a>
                </li>
              )}
            </ul>
          }
        />
      ))}
    </ol>
  </section>
);
