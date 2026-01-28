import { useState, useEffect } from 'react';

const TypeWriter = ({
  text,
  speed = 30,
  onComplete,
  className = ''
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);

    if (!text) return;

    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 bg-leaf ml-0.5 animate-pulse" />
      )}
    </span>
  );
};

export default TypeWriter;
