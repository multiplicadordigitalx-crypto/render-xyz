
import { useEffect } from 'react';

export const useScrollReveal = () => {
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
        };

        const handleIntersect = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Optional: unobserve if you only want the animation once
                    // observer.unobserve(entry.target);
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);
        const targets = document.querySelectorAll('.reveal');

        targets.forEach((target) => observer.observe(target));

        return () => observer.disconnect();
    }, []);
};
