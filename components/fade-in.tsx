"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "li";
};

export function FadeIn({
  children,
  className = "",
  as: Tag = "div",
}: FadeInProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`fade-in-up ${visible ? "is-visible" : ""} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}

type FadeInGroupProps = {
  children: ReactNode;
  className?: string;
};

export function FadeInGroup({ children, className = "" }: FadeInGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const items = Children.toArray(children);

  return (
    <div ref={ref} className={className}>
      {items.map((child, index) => {
        if (!isValidElement(child)) return child;

        const delay = `${index * 40}ms`;
        const existingStyle = (child.props as { style?: React.CSSProperties }).style;

        return cloneElement(child as ReactElement<{ className?: string; style?: React.CSSProperties }>, {
          className: `fade-in-up ${visible ? "is-visible" : ""} ${(child.props as { className?: string }).className ?? ""}`.trim(),
          style: {
            ...existingStyle,
            ["--fade-delay" as string]: delay,
          },
        });
      })}
    </div>
  );
}
