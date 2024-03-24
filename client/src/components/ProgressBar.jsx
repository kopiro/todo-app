import { useEffect, useState } from "react";

export default function ProgressBar(progress) {
  // let color;
  const [color, setColor] = useState("");

  useEffect(() => {
    if (progress.progress <= 30) {
      // color = "#EA7171";
      setColor("#EA7171");
    } else if (progress.progress > 30 && progress.progress <= 65) {
      // color = "#EAB271";
      setColor("#EAB271");
    } else {
      // color = "#90EA71";
      setColor("#90EA71");
    }
  }, [progress]);

  return (
    <div className="outer-bar">
      <div
        className="inner-bar"
        style={{
          width: `${progress.progress}%`,
          backgroundColor: color,
        }}
      ></div>
    </div>
  );
}
