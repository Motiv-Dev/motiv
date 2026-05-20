import { Composition } from "remotion";
import { MotivVideo } from "./MotivVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MotivLaunch"
      component={MotivVideo}
      durationInFrames={1800} // 30 seconds at 60fps
      fps={60}
      width={1080}
      height={1920}
    />
  );
};
