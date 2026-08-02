export interface Service {
  title: string;
  desc: string;
  detail: string;
}

export const services: Service[] = [
  {
    title: 'Websites',
    desc: "A site that actually represents your business, hand-built and easy to keep up with. Still the most common place to start.",
    detail: 'Custom-coded HTML, CSS, and JavaScript — fast to load, easy to hand off, and built to be edited without a page-builder subscription.',
  },
  {
    title: 'Business Automation',
    desc: 'Fixing the repetitive stuff: the same info typed into three different places, the manual process everyone dreads doing.',
    detail: 'Connecting forms, spreadsheets, and everyday tools so information moves on its own instead of being retyped by hand.',
  },
  {
    title: 'Internal Tools & Web Apps',
    desc: "Small custom tools built for how your business actually runs, when a spreadsheet or a sticky note has hit its limit.",
    detail: 'Purpose-built dashboards and small apps — scheduling, inventory, tracking — shaped around your actual workflow, not a generic template.',
  },
  {
    title: 'Process Improvement & Consulting',
    desc: "Sometimes the fix isn't code at all. An outside look at how something's organized can be worth more than a new tool.",
    detail: "An honest look at where time is actually going, with a plain-language plan for what's worth fixing first.",
  },
  {
    title: 'Systems Integration',
    desc: "Getting the tools you already use to actually talk to each other, so you're not stuck re-entering the same information.",
    detail: "Wiring up the software you've already invested in so it works as one system instead of a pile of disconnected logins.",
  },
  {
    title: 'Computer Repair & Hardware Installation',
    desc: 'Diagnosing and fixing the machines you already own, and setting up new hardware right the first time.',
    detail: 'On-site diagnostics and repair, plus setup for new computers, networking gear, and point-of-sale hardware.',
  },
];
