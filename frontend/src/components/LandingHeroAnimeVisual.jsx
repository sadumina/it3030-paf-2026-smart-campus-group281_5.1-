import { useEffect, useRef } from "react";
import anime from "../vendor/anime.es.js";

export default function LandingHeroAnimeVisual() {
  const topLayerRef = useRef(null);
  const middleLayerRef = useRef(null);
  const baseLayerRef = useRef(null);
  const glowRef = useRef(null);
  const sparkRefs = useRef([]);

  useEffect(() => {
    const animations = [
      anime({
        targets: topLayerRef.current,
        translateY: [0, -26],
        duration: 2200,
        direction: "alternate",
        loop: true,
        easing: "easeInOutSine",
      }),
      anime({
        targets: middleLayerRef.current,
        translateY: [0, -10],
        duration: 2200,
        direction: "alternate",
        loop: true,
        easing: "easeInOutSine",
      }),
      anime({
        targets: baseLayerRef.current,
        scale: [1, 1.02],
        duration: 2200,
        direction: "alternate",
        loop: true,
        easing: "easeInOutSine",
      }),
      anime({
        targets: glowRef.current,
        opacity: [0.4, 0.85],
        scale: [1, 1.15],
        duration: 1600,
        direction: "alternate",
        loop: true,
        easing: "easeInOutSine",
      }),
      anime({
        targets: sparkRefs.current,
        translateY: [8, -8],
        opacity: [0.25, 1],
        delay: anime.stagger(200),
        duration: 1300,
        direction: "alternate",
        loop: true,
        easing: "easeInOutSine",
      }),
    ];

    return () => {
      animations.forEach((instance) => instance.pause());
    };
  }, []);

  return (
    <div className="relative h-[390px] w-full overflow-hidden rounded-[2rem] border border-orange-100 bg-[#fefefe] p-5 shadow-[0_22px_45px_rgba(148,67,0,0.09)] sm:h-[430px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,176,109,0.25),transparent_45%),radial-gradient(circle_at_82%_86%,rgba(166,85,247,0.22),transparent_40%)]" />

      <div className="relative mx-auto mt-7 h-[320px] w-[92%] sm:mt-5 sm:h-[360px]">
        <div
          ref={glowRef}
          className="absolute bottom-[14px] left-1/2 h-24 w-56 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500/35 via-violet-400/25 to-fuchsia-400/30 blur-2xl"
        />

        <div
          ref={baseLayerRef}
          className="absolute bottom-0 left-1/2 h-[145px] w-[88%] -translate-x-1/2 rounded-[2.2rem] border border-violet-200 bg-gradient-to-b from-white to-violet-50 shadow-[0_20px_40px_rgba(109,40,217,0.18)]"
        >
          <div className="absolute inset-x-6 bottom-4 h-2 rounded-full bg-violet-200/70" />
        </div>

        <div
          ref={middleLayerRef}
          className="absolute bottom-[98px] left-1/2 h-[125px] w-[82%] -translate-x-1/2 rounded-[2rem] border border-violet-300/70 bg-white shadow-[0_12px_30px_rgba(99,102,241,0.14)]"
        />

        <div
          ref={topLayerRef}
          className="absolute bottom-[190px] left-1/2 h-[140px] w-[78%] -translate-x-1/2 rounded-[2rem] border border-slate-300 bg-white shadow-[0_8px_22px_rgba(51,65,85,0.15)]"
        />

        <div className="absolute bottom-[116px] left-[18%] h-[76px] border-l-2 border-dashed border-slate-300/85" />
        <div className="absolute bottom-[116px] right-[18%] h-[76px] border-r-2 border-dashed border-slate-300/85" />

        {["left-16 top-8", "right-14 top-14", "left-[45%] top-3"].map((pos, index) => (
          <span
            key={pos}
            ref={(element) => {
              sparkRefs.current[index] = element;
            }}
            className={`absolute ${pos} h-2.5 w-2.5 rounded-full bg-gradient-to-r from-orange-400 to-violet-500`}
          />
        ))}
      </div>
    </div>
  );
}
