import React from "react";

// This is trying to mimic the marquee style scrolling that Spotify uses on long titles.
// This could be done just as css rules, if the bounding box was a static width.

export const ScrollingText: React.FC<{ text: string }> = ({ text }) =>
{
  const styleRef = React.useRef<HTMLStyleElement | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const [lastWrapperWidth, setLastWrapperWidth] = React.useState<number>(0);

  const rand = Math.round(Math.random() * 1000);

  React.useEffect(() =>
  { 
    if (styleRef.current == null || wrapperRef.current == null)
    {
      return; 
    }
    let wrapperWidth = Math.round(wrapperRef.current?.offsetWidth);
    let animation = getAnimation(wrapperWidth);

    let scrollRule = `
    .scrolling-text-${rand}:hover {
      animation-name: title-scroll-${rand};
    }`
    setLastWrapperWidth(wrapperWidth);
    styleRef.current?.sheet?.insertRule(animation, 0);
    styleRef.current?.sheet?.insertRule(scrollRule, 1);

  }, []);
  const mouseEnter = () =>
  {
    if (wrapperRef.current == null || styleRef.current == null)
    {
      return;
    }

    let wrapperWidth = Math.round(wrapperRef.current?.offsetWidth);
    if (lastWrapperWidth != wrapperWidth)
    {
      let animation = getAnimation(wrapperWidth);
      styleRef.current?.sheet?.deleteRule(0);
      styleRef.current?.sheet?.insertRule(animation, 0);
      setLastWrapperWidth(wrapperWidth);
    }
  };

  const getAnimation = (width: number): string => {
    let animation = `
    
    @keyframes title-scroll-${rand}
    {
      0% {
        opacity: 1;
        transform: translateX(0px);
      }
    
      10% {
        opacity: 1;
        transform: translateX(0px);
      }
      60% {
        opacity: 1;
        transform: translateX(calc(${width}px - 100%));
      }
    
      83% {
        opacity: 1;
        transform: translateX(calc(${width}px - 100%));
      }
      87% {
        opacity: 0;
        transform: translateX(calc(${width}px - 100%));
      }
      93% {
        transform:translateX(0px);
        opacity: 0;
      }
      100% {
        opacity: 1;
        transform: translateX(0px);
      }
    }`;
    return animation;
  }

  const mouseLeave = () => 
  {
    
  };
  
  return (
    <div>
      <style ref={styleRef}></style>
      <div className="scrolling-text-wrapper" ref={wrapperRef}>
        <div className={`scrolling-text scrolling-text-${rand}`} onMouseEnter={mouseEnter} onMouseLeave={mouseLeave}>{text}</div>
      </div>
    </div>
  );
};
