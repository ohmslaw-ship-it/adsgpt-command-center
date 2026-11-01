"use client";

import {
  Children,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const motionHidden =
  "opacity-0 translate-y-3 motion-reduce:translate-y-0 motion-reduce:opacity-100";
const motionVisible = "opacity-100 translate-y-0";
const motionTransition =
  "transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

function isInViewport(node: Element) {
  const rect = node.getBoundingClientRect();
  const viewHeight =
    window.innerHeight || document.documentElement.clientHeight;
  return rect.top < viewHeight * 0.92 && rect.bottom > 0;
}

function useRevealOnce() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const show = () => setVisible(true);

    if (isInViewport(node)) {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          show();
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const { ref, visible } = useRevealOnce();
  const stateClass = visible ? motionVisible : motionHidden;

  return (
    <div
      ref={ref}
      className={`${motionTransition} ${stateClass} ${className}`.trim()}
      style={
        visible && delay > 0
          ? { transitionDelay: `${delay}ms` }
          : undefined
      }
    >
      {children}
    </div>
  );
}

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
};

export function RevealGroup({ children, className = "" }: RevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const show = () => setVisible(true);

    if (isInViewport(node)) {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          show();
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const items = Children.toArray(children);
  const stateClass = visible ? motionVisible : motionHidden;

  return (
    <div ref={ref} className={className}>
      {items.map((child, index) => (
        <div
          key={index}
          className={`${motionTransition} ${stateClass} h-full min-w-0`.trim()}
          style={
            visible ? { transitionDelay: `${index * 80}ms` } : undefined
          }
        >
          {child}
        </div>
      ))}
    </div>
  );
}
