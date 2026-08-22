'use client';

import {useEffect, useRef, useState} from 'react';

const chars = '!<>-_\\/[]{}—=+*^?#_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export default function TextScramble({text, delay = 0, speed = 40, className = ''}: {text: string; delay?: number; speed?: number; className?: string}) {
  const [display, setDisplay] = useState('');
  const frameRef = useRef(0);
  const queueRef = useRef<{from: string; to: string; start: number; char: string}[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const queue: typeof queueRef.current = [];
    const oldText = display || '';
    const len = Math.max(oldText.length, text.length);

    for (let i = 0; i < len; i++) {
      const from = oldText[i] || '';
      const to = text[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      queue.push({from, to, start, char: ''});
    }

    queueRef.current = queue;
    frameRef.current = 0;

    const timeout = setTimeout(() => {
      const update = () => {
        let output = '';
        let complete = 0;

        for (let i = 0; i < queue.length; i++) {
          const {from, to, start} = queue[i];

          if (frameRef.current >= start + 20) {
            complete++;
            output += to;
          } else if (frameRef.current >= start) {
            if (!queue[i].char || Math.random() < 0.28) {
              queue[i].char = chars[Math.floor(Math.random() * chars.length)];
            }
            output += `<span class="text-[#7042f8]">${queue[i].char}</span>`;
          } else {
            output += from;
          }
        }

        setDisplay(output);

        if (complete < queue.length) {
          frameRef.current++;
          rafRef.current = requestAnimationFrame(update);
        }
      };

      rafRef.current = requestAnimationFrame(update);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [text, delay, speed]);

  return <span className={className} dangerouslySetInnerHTML={{__html: display}} />;
}
