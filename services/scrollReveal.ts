
import { useEffect } from 'react';

export const useScrollReveal = (dependency?: any) => {
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
        };

        const handleIntersect = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);
        const targets = document.querySelectorAll('.reveal');

        targets.forEach((target) => observer.observe(target));

        return () => observer.disconnect();
    }, [dependency]);
};
