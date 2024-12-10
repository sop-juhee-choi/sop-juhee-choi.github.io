function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
    });
}