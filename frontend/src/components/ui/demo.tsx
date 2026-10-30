"use client";

import { SqueezeCarousel, type SqueezeSlide } from "@/components/ui/carousel-squeeze";

export const settings = {
    height: 320,
    gap: 16,
    slatGap: 8,
    slatWidth: 8,
    radius: 6,
    duration: 1000,
    hoverGrow: true,
    autoplay: false,
    interval: 6000,
    controls: true,
};

type DemoProps = Partial<typeof settings>;

/** A wordmark for the corner of the open panel. */
const mark = (text: string) => (
    <span className="text-sm font-medium tracking-tight text-white">{text}</span>
);

const slides: SqueezeSlide[] = [
    {
        id: "grid",
        title: "A layout engine that finally respects the fold.",
        description:
            "Grid 2.0 measures the viewport before it paints, so the first screen lands in one frame on any device.",
        action: "Read the notes",
        overlay: mark("Grid 2.0"),
        image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Cricket stadium match action under floodlights",
    },
    {
        id: "studio",
        title: "Design tokens now sync both ways.",
        description:
            "Change a colour in the editor and the repo follows; change it in the repo and the editor catches up on the next pull.",
        action: "See how it works",
        overlay: mark("Studio"),
        image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Footballers training on turf field",
    },
    {
        id: "edge",
        title: "Cold starts are down to 11 milliseconds.",
        description:
            "A rewritten scheduler keeps a warm pool near every region, so the first request costs about what the tenth does.",
        action: "Read the benchmark",
        overlay: mark("Edge runtime"),
        image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Badminton player executing high smash",
    },
    {
        id: "release",
        title: "Ninety-four changes in one release.",
        description:
            "Charts, forms, and the whole command palette were rebuilt this quarter. Here is everything that moved.",
        action: "Browse the changelog",
        overlay: mark("Summer release"),
        image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Basketball player taking court jump shot",
    },
    {
        id: "insights",
        title: "Every query, traced end to end.",
        description:
            "Follow one request from the browser through the queue and into the database, with the slow step marked for you.",
        action: "Open a demo trace",
        overlay: mark("Insights"),
        image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Tennis court player serving",
    },
    {
        id: "handbook",
        title: "How we run a team of forty without standups.",
        description:
            "Written decisions, one weekly review, and a shared calendar. Our handbook is open, so take what works.",
        action: "Read the handbook",
        overlay: mark("Handbook"),
        image: "https://images.unsplash.com/photo-1628891435222-065925dcb365?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Pickleball doubles rally on court",
    },
    {
        id: "craft",
        title: "The tools we make are the ones we use.",
        description:
            "Every part of the platform is built by the people who run on it, and shipped only once they trust it themselves.",
        action: "Meet the team",
        overlay: mark("Workshop"),
        image: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Athletes warming up for team tournament",
    },
];

export default function SqueezeCarouselDemo(props: DemoProps) {
    const options = { ...settings, ...props };

    return (
        <div className="bg-background w-full px-6 py-10">
            <SqueezeCarousel slides={slides} label="What we shipped" {...options} />
        </div>
    );
}

