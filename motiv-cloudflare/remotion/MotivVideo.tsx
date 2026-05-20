import { AbsoluteFill, Sequence } from "remotion";
import { Scene1_Hook } from "./scenes/Scene1_Hook";
import { Scene2_Problem } from "./scenes/Scene2_Problem";
import { Scene3_Reveal } from "./scenes/Scene3_Reveal";
import { Scene4_PhoneMockup } from "./scenes/Scene4_PhoneMockup";
import { Scene5_HowItWorks } from "./scenes/Scene5_HowItWorks";
import { Scene6_Stats } from "./scenes/Scene6_Stats";
import { Scene7_CTA } from "./scenes/Scene7_CTA";
import { BackgroundParticles } from "./components/Particles";
import { GrainOverlay } from "./components/GrainOverlay";

export const MotivVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0908" }}>
      {/* Persistent background particles */}
      <BackgroundParticles />

      {/* Scene 1: Hook — 0-4s */}
      <Sequence from={0} durationInFrames={240}>
        <Scene1_Hook />
      </Sequence>

      {/* Scene 2: Problem — 4-8s */}
      <Sequence from={240} durationInFrames={240}>
        <Scene2_Problem />
      </Sequence>

      {/* Scene 3: Brand Reveal — 8-12s */}
      <Sequence from={480} durationInFrames={240}>
        <Scene3_Reveal />
      </Sequence>

      {/* Scene 4: Phone Mockup with real UI — 12-19s */}
      <Sequence from={720} durationInFrames={420}>
        <Scene4_PhoneMockup />
      </Sequence>

      {/* Scene 5: How it Works — 19-23s */}
      <Sequence from={1140} durationInFrames={240}>
        <Scene5_HowItWorks />
      </Sequence>

      {/* Scene 6: Social Proof / Stats — 23-26s */}
      <Sequence from={1380} durationInFrames={180}>
        <Scene6_Stats />
      </Sequence>

      {/* Scene 7: CTA — 26-30s */}
      <Sequence from={1560} durationInFrames={240}>
        <Scene7_CTA />
      </Sequence>

      {/* Film grain overlay for cinematic feel */}
      <GrainOverlay />
    </AbsoluteFill>
  );
};
