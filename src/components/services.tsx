import { PROCESS, SERVICES } from "../constants";

// Services
export const Services = () => (
  <section id="services" className="bg-panel border-y border-line">
    <div className="max-w-7xl mx-auto px-6 sm:px-12 py-24 sm:py-32">
      <h2 className="text-[46px] sm:text-[88px] max-w-[14ch]">
        What I can build for you
      </h2>

      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12">
        {SERVICES.map((service) => (
          <div key={service.title}>
            <h3 className="text-[38px] lg:min-h-[2lh]">{service.title}</h3>
            <ul className="mt-4 border-t border-line">
              {service.items.map((item) => (
                <li key={item} className="py-3 border-b border-line text-mute">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Process
export const Process = () => (
  <section id="process" className="max-w-7xl mx-auto px-6 sm:px-12 py-24 sm:py-32">
    <h2 className="text-[46px] sm:text-[88px]">How a project runs</h2>

    <ol className="mt-12 border-t border-line">
      {PROCESS.map((step, i) => (
        <li
          key={step.stage}
          className="grid md:grid-cols-[200px_1fr] gap-x-6 gap-y-2 py-9 border-b border-line"
        >
          <span className="font-mono text-[13px] text-teal pt-2">
            Step {i + 1} · {step.stage}
          </span>
          <div>
            <h3 className="text-[32px] sm:text-[46px]">{step.title}</h3>
            <p className="mt-3 max-w-[62ch] leading-7 text-mute">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  </section>
);
